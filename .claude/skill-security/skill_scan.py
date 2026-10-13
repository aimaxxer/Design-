#!/usr/bin/env python3
"""SkillSpector gate for every skill this project can load.

Scans skills with NVIDIA SkillSpector (static analysis, --no-llm) and records
each result in ledger.json, keyed by skill id and content hash, so a skill is
only rescanned when its files change. A skill is "flagged" when SkillSpector
reports a HIGH or CRITICAL finding, a score above 50, or DO_NOT_INSTALL.
Flagged skills stay blocked until the user approves them with `approve`.

Skill sources covered:
  project      .claude/skills/ in this repo
  user         ~/.claude/skills/ (including skills synced from claude.ai)
  plugins      ~/.claude/plugins/ (installed and synced plugins)
  marketplace  plugins enabled in .claude/settings.json, fetched from their
               marketplace repo (only the plugin's skills/hooks/commands/agents)

Usage:
  skill_scan.py scan [--all] [--jobs N] [--report FILE] [--local-only]
  skill_scan.py session-start                     SessionStart hook
  skill_scan.py hook-pre                          PreToolUse hook (Write|Edit|MultiEdit)
  skill_scan.py hook-post                         PostToolUse hook (Bash)
  skill_scan.py approve ID --note TEXT [--hash SHA256]
  skill_scan.py status
"""
import argparse
import concurrent.futures
import contextlib
import datetime
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from collections import Counter
from pathlib import Path

try:
    import fcntl
except ImportError:  # Windows: run without the ledger lock
    fcntl = None

HERE = Path(__file__).resolve().parent
PROJECT = Path(os.environ.get("CLAUDE_PROJECT_DIR") or HERE.parent.parent).resolve()
HOME = Path.home()
LEDGER = HERE / "ledger.json"
CACHE = Path(os.environ.get("XDG_CACHE_HOME") or HOME / ".cache") / "skill-security"
SCRIPT = ".claude/skill-security/skill_scan.py"

SKILLSPECTOR_VERSION = "2.12.0"
INSTALL_CMD = "uv tool install 'git+https://github.com/NVIDIA/skillspector.git@v2.12.0'"
RANK = {"NONE": 0, "INFO": 0, "LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv"}
# Per-account bucket directories under ~/.claude/{skills,plugins}/synced/.
BUCKET_RE = re.compile(r"^(\.bucket-)?[0-9a-f-]{36}_[0-9a-f-]{36}$")
PLUGIN_PARTS = ("skills", "hooks", "commands", "agents", ".claude-plugin")


class ScannerMissing(Exception):
    pass


# ---------------------------------------------------------------- discovery

def local_roots():
    return [
        ("project", PROJECT / ".claude" / "skills", ()),
        ("user", HOME / ".claude" / "skills", ()),
        ("plugins", HOME / ".claude" / "plugins", ("marketplaces", "data")),
    ]


def find_skill_dirs(root, skip=()):
    found = []
    if not root.is_dir():
        return found
    for dirpath, dirnames, filenames in os.walk(root):
        if "SKILL.md" in filenames:
            found.append(Path(dirpath))
            dirnames[:] = []
            continue
        here = Path(dirpath)
        dirnames[:] = sorted(
            d for d in dirnames if d not in SKIP_DIRS and not (here == root and d in skip)
        )
    return found


def skill_id(label, root, skill_dir):
    parts = [p for p in skill_dir.relative_to(root).parts if not BUCKET_RE.match(p)]
    if parts and parts[0] == "synced":
        parts = parts[1:]
    return f"{label}:{'/'.join(parts) or '.'}"


def id_for_path(skill_dir):
    skill_dir = skill_dir.resolve() if skill_dir.exists() else skill_dir
    for label, root, _ in local_roots():
        try:
            skill_dir.relative_to(root)
        except ValueError:
            continue
        return skill_id(label, root, skill_dir)
    try:
        return f"project-path:{skill_dir.relative_to(PROJECT).as_posix()}"
    except ValueError:
        return f"path:{skill_dir}"


def content_hash(directory):
    h = hashlib.sha256()
    for dirpath, dirnames, filenames in os.walk(directory):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
        for name in sorted(filenames):
            p = Path(dirpath) / name
            h.update(p.relative_to(directory).as_posix().encode() + b"\0")
            if p.is_symlink():
                h.update(b"symlink:" + os.readlink(p).encode())
                continue
            fh = hashlib.sha256()
            with open(p, "rb") as f:
                for chunk in iter(lambda: f.read(1 << 20), b""):
                    fh.update(chunk)
            h.update(fh.digest())
    return h.hexdigest()


def discover_local():
    targets = []
    for label, root, skip in local_roots():
        for d in find_skill_dirs(root, skip):
            targets.append({"id": skill_id(label, root, d), "path": d, "hash": content_hash(d)})
    return targets


# ------------------------------------------------------------ marketplaces

def read_settings(path=None):
    path = path or PROJECT / ".claude" / "settings.json"
    try:
        return json.loads(Path(path).read_text())
    except (OSError, ValueError):
        return {}


def enabled_plugins(settings):
    return {k for k, v in (settings.get("enabledPlugins") or {}).items() if v}


def marketplace_source(settings, name):
    src = ((settings.get("extraKnownMarketplaces") or {}).get(name) or {}).get("source") or {}
    kind = src.get("source")
    if kind == "github" and src.get("repo"):
        return {"label": src["repo"], "url": f"https://github.com/{src['repo']}.git", "ref": src.get("ref")}
    if kind in ("git", "url") and src.get("url"):
        label = re.sub(r"^https?://|\.git$", "", src["url"])
        return {"label": label, "url": src["url"], "ref": src.get("ref")}
    if kind in ("directory", "local") and src.get("path"):
        return {"label": src["path"], "local": src["path"]}
    return None


def git(*args, cwd=None, timeout=300):
    return subprocess.run(
        ["git", *args], cwd=cwd, capture_output=True, text=True, timeout=timeout, check=True
    ).stdout.strip()


def remote_head(source):
    if source.get("local"):
        return None
    out = git("ls-remote", source["url"], source.get("ref") or "HEAD", timeout=60)
    return out.split()[0] if out else None


def rel(path_str):
    p = os.path.normpath(path_str or ".")
    return "" if p == "." else Path(p).as_posix()


def fetch_marketplace(source, plugin_names):
    """Fetch only what the named plugins load from a marketplace repo.

    Returns (checkout_dir, commit, plugins) where plugins maps each plugin name
    to {"root": rel path, "skills": [skill dirs], "surface": {...}}.
    """
    if source.get("local"):
        dest = (PROJECT / source["local"]).resolve()
        commit = None
    else:
        dest = CACHE / "marketplaces" / re.sub(r"[^A-Za-z0-9._-]", "_", source["label"])
        if dest.exists():
            shutil.rmtree(dest)
        dest.parent.mkdir(parents=True, exist_ok=True)
        clone = ["clone", "--quiet", "--depth", "1", "--filter=blob:none", "--no-checkout"]
        if source.get("ref"):
            clone += ["--branch", source["ref"]]
        git(*clone, source["url"], str(dest))
        git("sparse-checkout", "set", "--no-cone", "/*", "!/*/", "/.claude-plugin/", cwd=dest)
        git("checkout", "--quiet", cwd=dest)
        commit = git("rev-parse", "HEAD", cwd=dest)

    manifest = json.loads((dest / ".claude-plugin" / "marketplace.json").read_text())
    entries = {p.get("name"): p for p in manifest.get("plugins", [])}
    plugins, patterns = {}, ["/*", "!/*/", "/.claude-plugin/"]
    for name in plugin_names:
        entry = entries.get(name)
        if entry is None:
            plugins[name] = {"error": "plugin not listed in the marketplace manifest"}
            continue
        if not isinstance(entry.get("source"), str):
            plugins[name] = {"error": f"external plugin source {json.dumps(entry.get('source'))}; scan it by hand"}
            continue
        root = rel(entry["source"])
        base = f"/{root}/" if root else "/"
        if root:
            patterns += [base + "*", "!" + base + "*/"]
        patterns += [base + part + "/" for part in PLUGIN_PARTS]
        explicit = [rel(str(Path(root) / s)) for s in entry.get("skills") or []]
        patterns += ["/" + s + "/" for s in explicit]
        plugins[name] = {"root": root, "explicit": explicit, "entry": entry}
    if not source.get("local"):
        git("sparse-checkout", "set", "--no-cone", *patterns, cwd=dest)

    for name, info in plugins.items():
        if "error" in info:
            continue
        root_dir = dest / info["root"]
        skills = find_skill_dirs(root_dir / "skills")
        if (root_dir / "SKILL.md").exists():
            skills.append(root_dir)
        skills += [dest / s for s in info.pop("explicit") if (dest / s / "SKILL.md").exists()]
        info["skills"] = sorted(set(skills))
        info["surface"] = plugin_surface(root_dir, info.pop("entry"))
    return dest, commit, plugins


def plugin_surface(root_dir, entry):
    """Executable plugin parts that SkillSpector's skill scan does not cover."""
    manifest = {}
    with contextlib.suppress(OSError, ValueError):
        manifest = json.loads((root_dir / ".claude-plugin" / "plugin.json").read_text())
    surface = {}
    if (root_dir / "hooks" / "hooks.json").exists() or manifest.get("hooks") or entry.get("hooks"):
        surface["hooks"] = "hooks/hooks.json" if (root_dir / "hooks" / "hooks.json").exists() else "declared in manifest"
    mcp = {}
    with contextlib.suppress(OSError, ValueError):
        mcp.update(json.loads((root_dir / ".mcp.json").read_text()).get("mcpServers", {}))
    for src in (manifest, entry):
        if isinstance(src.get("mcpServers"), dict):
            mcp.update(src["mcpServers"])
    if mcp:
        surface["mcp_servers"] = sorted(mcp)
    for part in ("commands", "agents"):
        n = len(list((root_dir / part).glob("*.md"))) if (root_dir / part).is_dir() else 0
        if n:
            surface[part] = n
    return surface


def discover_marketplaces(settings, only=None):
    """Return (targets, marketplace records, errors) for enabled marketplace plugins."""
    wanted = {}
    for key in enabled_plugins(settings):
        if only is not None and key not in only:
            continue
        plugin, _, mkt = key.partition("@")
        wanted.setdefault(mkt, []).append(plugin)
    targets, records, errors = {}, {}, []
    for mkt, names in sorted(wanted.items()):
        source = marketplace_source(settings, mkt)
        if source is None:
            errors.append(f"{', '.join(names)}@{mkt}: marketplace source unknown (not in extraKnownMarketplaces); scan it by hand")
            continue
        try:
            dest, commit, plugins = fetch_marketplace(source, sorted(names))
        except (subprocess.SubprocessError, OSError, ValueError) as e:
            detail = getattr(e, "stderr", "") or str(e)
            errors.append(f"{mkt} ({source['label']}): fetch failed: {detail.strip()[-300:]}")
            continue
        records[source["label"]] = {"marketplace": mkt, "commit": commit, "plugins": {}}
        for name, info in plugins.items():
            if "error" in info:
                errors.append(f"{name}@{mkt}: {info['error']}")
                continue
            records[source["label"]]["plugins"][name] = {
                "skills": len(info["skills"]),
                **info["surface"],
            }
            for d in info["skills"]:
                r = d.relative_to(dest).as_posix()
                sid = f"marketplace:{source['label']}" + (f"/{r}" if r != "." else "")
                t = targets.setdefault(sid, {"id": sid, "path": d, "hash": content_hash(d), "plugins": []})
                t["plugins"].append(f"{name}@{mkt}")
    return list(targets.values()), records, errors


# ---------------------------------------------------------------- scanning

def scanner():
    exe = shutil.which("skillspector") or shutil.which("skillspector", path=str(HOME / ".local" / "bin"))
    if not exe:
        raise ScannerMissing(f"SkillSpector is not installed. Install it with: {INSTALL_CMD}")
    return exe


def classify(score, max_sev, recommendation):
    if RANK.get(max_sev, 0) >= RANK["HIGH"] or score > 50 or recommendation == "DO_NOT_INSTALL":
        return "flagged"
    return "caution" if score > 35 else "pass"


def scan_dir(path):
    exe = scanner()
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "report.json"
        try:
            proc = subprocess.run(
                [exe, "scan", str(path), "--no-llm", "--format", "json", "--output", str(out)],
                capture_output=True, text=True, timeout=600,
            )
        except subprocess.TimeoutExpired:
            return {"status": "error", "error": "scan timed out after 600s"}
        if not out.exists():
            return {"status": "error", "error": (proc.stderr or proc.stdout).strip()[-400:]}
        report = json.loads(out.read_text())
    ra = report.get("risk_assessment") or {}
    issues = report.get("issues") or []
    score = int(ra.get("score") or 0)
    max_sev = ra.get("max_issue_severity") or "NONE"
    top = []
    for i in sorted(issues, key=lambda i: -RANK.get(i.get("severity"), 0)):
        loc = i.get("location") or {}
        line = (f"{i.get('severity')} {i.get('id')} {i.get('pattern') or i.get('category')}"
                f" @ {loc.get('file')}:{loc.get('start_line')}")
        if line not in top:
            top.append(line)
        if len(top) == 8:
            break
    return {
        "status": classify(score, max_sev, ra.get("recommendation")),
        "score": score,
        "severity": ra.get("severity"),
        "recommendation": ra.get("recommendation"),
        "max_issue_severity": max_sev,
        "counts": dict(Counter(i.get("severity") for i in issues)),
        "top": top,
        "high": sorted({f"{i.get('id')}@{(i.get('location') or {}).get('file')}"
                        for i in issues if RANK.get(i.get("severity"), 0) >= RANK["HIGH"]}),
        "complete": (report.get("analysis_completeness") or {}).get("is_complete"),
    }


def scan_many(targets, jobs=4, budget=None):
    """Scan targets in parallel. Returns (results by id, ids skipped by the time budget)."""
    results, skipped = {}, []
    if not targets:
        return results, skipped
    scanner()
    deadline = time.monotonic() + budget if budget else None
    pool = concurrent.futures.ThreadPoolExecutor(max_workers=jobs)
    futures = {pool.submit(scan_dir, t["path"]): t for t in targets}
    try:
        for fut in concurrent.futures.as_completed(
            futures, timeout=(deadline - time.monotonic()) if deadline else None
        ):
            t = futures[fut]
            try:
                results[t["id"]] = fut.result()
            except Exception as e:  # keep scanning the rest
                results[t["id"]] = {"status": "error", "error": str(e)[-400:]}
    except concurrent.futures.TimeoutError:
        for fut, t in futures.items():
            if not fut.done() and fut.cancel():
                skipped.append(t["id"])
        for fut, t in futures.items():
            if not fut.cancelled() and t["id"] not in results:
                try:
                    results[t["id"]] = fut.result()
                except Exception as e:
                    results[t["id"]] = {"status": "error", "error": str(e)[-400:]}
    finally:
        pool.shutdown(wait=True)
    return results, skipped


# ------------------------------------------------------------------ ledger

@contextlib.contextmanager
def ledger_lock():
    CACHE.mkdir(parents=True, exist_ok=True)
    with open(CACHE / "ledger.lock", "w") as lock:
        if fcntl:
            fcntl.flock(lock, fcntl.LOCK_EX)
        yield


def load_ledger():
    try:
        data = json.loads(LEDGER.read_text())
    except (OSError, ValueError):
        data = {}
    data.setdefault("skills", {})
    data.setdefault("marketplaces", {})
    data.setdefault("pending", {})  # blocked proposals, kept apart so they can't clobber what is on disk
    return data


def save_ledger(data):
    data["skillspector"] = SKILLSPECTOR_VERSION
    data["skills"] = dict(sorted(data["skills"].items()))
    data["marketplaces"] = dict(sorted(data["marketplaces"].items()))
    data["pending"] = dict(sorted(data["pending"].items()))
    tmp = LEDGER.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=1) + "\n")
    os.replace(tmp, LEDGER)


def needs_scan(ledger, target):
    entry = ledger["skills"].get(target["id"])
    return not entry or entry.get("hash") != target["hash"] or entry.get("status") == "error"


def record(ledger, targets, results):
    """Store scan results. An approval survives a change that adds no new HIGH/CRITICAL finding."""
    today = datetime.date.today().isoformat()
    for t in targets:
        res = results.get(t["id"])
        if res is None:
            continue
        prev = ledger["skills"].get(t["id"]) or {}
        if prev.get("status") == "approved" and prev.get("hash") == t["hash"]:
            continue
        entry = {"hash": t["hash"], **res, "scanned_at": today}
        if t.get("plugins"):
            entry["plugins"] = t["plugins"]
        if (prev.get("status") == "approved" and res.get("status") == "flagged"
                and set(res.get("high", [])) <= set(prev.get("high", []))):
            entry.update(status="approved", note=prev.get("note"), approved_at=prev.get("approved_at"),
                         approval_carried_from=prev.get("hash"))
        ledger["skills"][t["id"]] = entry


def blocked(ledger, ids=None):
    return {
        sid: e for sid, e in ledger["skills"].items()
        if e.get("status") in ("flagged", "error") and (ids is None or sid in ids)
    }


def describe(sid, e):
    if e.get("status") == "error":
        return f"- {sid}: scan failed: {e.get('error')}"
    lines = [f"- {sid}: {e.get('score')}/100 {e.get('severity')} {e.get('recommendation')}"
             f" (max finding {e.get('max_issue_severity')}) [{e.get('status')}]"]
    lines += [f"    {t}" for t in e.get("top", [])[:5]]
    return "\n".join(lines)


# ---------------------------------------------------------------- commands

def cmd_scan(args):
    with ledger_lock():
        ledger = load_ledger()
    targets = discover_local()
    errors = []
    if not args.local_only:
        mk_targets, mk_records, errors = discover_marketplaces(read_settings())
        targets += mk_targets
    todo = targets if args.all else [t for t in targets if needs_scan(ledger, t)]
    print(f"{len(targets)} skills found, scanning {len(todo)}...", file=sys.stderr)
    results, skipped = scan_many(todo, jobs=args.jobs)
    with ledger_lock():
        ledger = load_ledger()
        record(ledger, todo, results)
        if not args.local_only:
            ledger["marketplaces"].update(mk_records)
        save_ledger(ledger)
    ids = {t["id"] for t in targets}
    if args.report:
        write_report(Path(args.report), ledger, ids, errors)
    by_status = Counter(ledger["skills"][i]["status"] for i in ids if i in ledger["skills"])
    print(f"Scanned {len(results)} skills. " + ", ".join(f"{k}: {v}" for k, v in sorted(by_status.items())))
    flagged = blocked(ledger, ids)
    if flagged:
        print("\nFlagged (needs review and user approval):")
        print("\n".join(describe(s, e) for s, e in flagged.items()))
    for e in errors:
        print(f"! {e}")
    return 1 if flagged or errors else 0


def write_report(path, ledger, ids, errors):
    skills = {i: ledger["skills"][i] for i in sorted(ids) if i in ledger["skills"]}
    groups = {}
    for sid, e in skills.items():
        groups.setdefault(e["status"], []).append((sid, e))
    out = [f"# SkillSpector scan, {datetime.date.today().isoformat()}", "",
           f"SkillSpector v{SKILLSPECTOR_VERSION}, static analysis (`--no-llm`). {len(skills)} skills scanned.", "",
           "| Status | Skills |", "|---|---:|"]
    for status in ("flagged", "error", "approved", "caution", "pass"):
        if groups.get(status):
            out.append(f"| {status} | {len(groups[status])} |")
    for status, title in (("flagged", "Flagged: HIGH/CRITICAL finding or score over 50"),
                          ("error", "Scan errors"), ("approved", "Approved by the user"),
                          ("caution", "Caution: score 36-50")):
        if not groups.get(status):
            continue
        out += ["", f"## {title}", "", "| Skill | Score | Severity | Recommendation | Top findings |", "|---|---:|---|---|---|"]
        for sid, e in sorted(groups[status], key=lambda x: -(x[1].get("score") or 0)):
            top = "<br>".join(t.replace("|", "\\|") for t in e.get("top", [])[:4]) or e.get("error", "")
            out.append(f"| `{sid}` | {e.get('score', '')} | {e.get('severity', '')} | {e.get('recommendation', '')} | {top} |")
    if groups.get("pass"):
        out += ["", "## Pass: score 35 or lower, no HIGH/CRITICAL finding", ""]
        out += [f"- `{sid}` ({e.get('score')})" for sid, e in groups["pass"]]
    if ledger["marketplaces"]:
        out += ["", "## Project plugins: parts SkillSpector does not scan", "",
                "| Marketplace | Commit | Plugin | Skills | Hooks | MCP servers | Commands | Agents |",
                "|---|---|---|---:|---|---|---:|---:|"]
        for label, m in ledger["marketplaces"].items():
            for name, p in m.get("plugins", {}).items():
                out.append(f"| {label} | `{(m.get('commit') or '')[:10]}` | {name} | {p.get('skills', 0)} | "
                           f"{p.get('hooks', '')} | {', '.join(p.get('mcp_servers', []))} | "
                           f"{p.get('commands', '')} | {p.get('agents', '')} |")
    if errors:
        out += ["", "## Not scanned", ""] + [f"- {e}" for e in errors]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(out) + "\n")


def cmd_approve(args):
    with ledger_lock():
        ledger = load_ledger()
        entry = ledger["skills"].get(args.id)
        pending = ledger["pending"].get(args.id)
        if pending and (not args.hash or pending.get("hash") == args.hash):
            entry = ledger["pending"].pop(args.id)
        if entry is None and not args.hash:
            sys.exit(f"{args.id} is not in the ledger; pass --hash from the gate message")
        if entry is None or (args.hash and entry.get("hash") != args.hash):
            entry = {"hash": args.hash, "status": "flagged"}
        entry.pop("approval_carried_from", None)
        entry.update(status="approved", note=args.note, approved_at=datetime.date.today().isoformat())
        ledger["skills"][args.id] = entry
        save_ledger(ledger)
    print(f"Approved {args.id} at hash {entry['hash'][:12]}: {args.note}")


def cmd_status(_args):
    ledger = load_ledger()
    print(", ".join(f"{k}: {v}" for k, v in sorted(Counter(e["status"] for e in ledger["skills"].values()).items())))
    flagged = blocked(ledger)
    if flagged:
        print("\n".join(describe(s, e) for s, e in flagged.items()))


def emit(obj):
    print(json.dumps(obj))


def cmd_session_start(_args):
    notes = []
    try:
        scanner()
    except ScannerMissing as e:
        emit({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext":
              f"Skill security: {e}. The skill gate blocks skill and plugin changes until it is installed."}})
        return 0
    with ledger_lock():
        ledger = load_ledger()
    local = discover_local()
    targets = [t for t in local if needs_scan(ledger, t)]

    # Rescan enabled marketplace plugins whose upstream commit moved.
    settings = read_settings()
    enabled = enabled_plugins(settings)
    by_mkt = {}
    for key in enabled:
        by_mkt.setdefault(key.partition("@")[2], set()).add(key)
    moved, errors = set(), []
    for mkt, keys in by_mkt.items():
        source = marketplace_source(settings, mkt)
        if not source or source.get("local"):
            continue
        known = ledger["marketplaces"].get(source["label"], {})
        try:
            head = remote_head(source)
        except (subprocess.SubprocessError, OSError):
            continue  # offline: keep the last review
        missing = {k for k in keys if k.partition("@")[0] not in known.get("plugins", {})}
        moved |= keys if head != known.get("commit") else missing
    mk_records = {}
    if moved:
        mk_targets, mk_records, errors = discover_marketplaces(settings, only=moved)
        targets += [t for t in mk_targets if needs_scan(ledger, t)]

    results, skipped = scan_many(targets, budget=240)
    with ledger_lock():
        ledger = load_ledger()
        record(ledger, targets, results)
        ledger["marketplaces"].update(mk_records)
        save_ledger(ledger)

    new_flags = blocked(ledger, set(results))
    if results:
        notes.append(f"SkillSpector rescanned {len(results)} new or changed skills; {len(new_flags)} flagged.")
        if new_flags:
            notes.append(listing(new_flags))
    if skipped:
        notes.append(f"{len(skipped)} changed skills were not scanned in time; run `python3 {SCRIPT} scan`.")
    present = {t["id"] for t in local} | {s for s, e in ledger["skills"].items() if enabled & set(e.get("plugins", []))}
    pending = sorted(set(blocked(ledger, present)) - set(new_flags))
    if pending:
        sources = Counter(re.sub(r"^((?:marketplace:)?[^/]+(?:/[^/]+)?).*", r"\1", s.replace("plugins:", "plugin:"))
                          if not s.startswith("user:") else "user skills" for s in pending)
        notes.append(f"{len(pending)} {'other ' if new_flags else ''}skills in use are flagged by SkillSpector "
                     "and not approved by the user ("
                     + ", ".join(f"{src}: {n}" for src, n in sorted(sources.items())) + "). "
                     f"Check their findings with `python3 {SCRIPT} status` before following them.")
    notes += [f"! {e}" for e in errors]
    if notes:
        emit({"hookSpecificOutput": {"hookEventName": "SessionStart",
                                     "additionalContext": "Skill security:\n" + "\n".join(notes)}})
    return 0


# ------------------------------------------------------------------- hooks

def proposed_content(path, tool, ti):
    if tool == "Write":
        return ti.get("content", "")
    current = path.read_text(encoding="utf-8") if path.exists() else ""
    for e in ti.get("edits") if tool == "MultiEdit" else [ti]:
        old, new = e.get("old_string", ""), e.get("new_string", "")
        if old == "" and current == "":
            current = new
            continue
        if old not in current:
            return None  # the edit will fail on its own
        current = current.replace(old, new) if e.get("replace_all") else current.replace(old, new, 1)
    return current


def skill_dir_for(path):
    """The skills/<name> directory containing path, if it is part of a skill."""
    for d in path.parents:
        if d.parent.name == "skills":
            if (d / "SKILL.md").exists() or path == d / "SKILL.md":
                return d
            return None
    return None


def deny(reason):
    emit({"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny",
                                 "permissionDecisionReason": reason}})


def allow_with_context(text):
    emit({"systemMessage": text,
          "hookSpecificOutput": {"hookEventName": "PreToolUse", "additionalContext": text}})


def listing(flagged, paths=None, limit=10):
    lines = [describe(s, e) + (f"\n    path: {paths[s]}" if paths and s in paths else "")
             for s, e in list(flagged.items())[:limit]]
    if len(flagged) > limit:
        lines.append(f"- ...and {len(flagged) - limit} more; run `python3 {SCRIPT} status` for the full list.")
    return "\n".join(lines)


def approval_steps(items, retry=True, limit=10):
    cmds = "\n".join(f"  python3 {SCRIPT} approve '{sid}' --hash {h} --note '<user's reason>'"
                     for sid, h in items[:limit])
    if len(items) > limit:
        cmds += f"\n  (same for the other {len(items) - limit}; the hash for each is in ledger.json)"
    if retry:
        return ("Policy (CLAUDE.md, Skill security): do not add this yet. Run the skill-inspector review on the "
                "staged copy, show the user the verdict, and only if they explicitly approve run:\n"
                f"{cmds}\nthen retry the same change. If they don't approve, drop it.")
    return ("Policy (CLAUDE.md, Skill security): tell the user, and don't follow these skills until they are "
            "reviewed. If your command just added one, remove it unless the user approves it after the "
            f"skill-inspector review. To record an approval:\n{cmds}")


def gate_skill(path, skill_dir, tool, ti):
    content = proposed_content(path, tool, ti)
    if content is None:
        return
    sid = id_for_path(skill_dir)
    with tempfile.TemporaryDirectory() as tmp:
        stage = Path(tmp) / skill_dir.name
        if skill_dir.exists():
            shutil.copytree(skill_dir, stage, symlinks=True, ignore=shutil.ignore_patterns(*SKIP_DIRS))
        target = stage / path.relative_to(skill_dir)
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.is_symlink():
            target.unlink()
        target.write_text(content, encoding="utf-8")
        h = content_hash(stage)
        with ledger_lock():
            ledger = load_ledger()
        prev = ledger["skills"].get(sid)
        if prev and prev.get("hash") == h and prev.get("status") in ("approved", "pass", "caution"):
            return
        result = scan_dir(stage)
        keep = CACHE / "staged" / h[:16] / skill_dir.name
        if result["status"] in ("flagged", "error") and not keep.exists():
            shutil.copytree(stage, keep, symlinks=True)
    with ledger_lock():
        ledger = load_ledger()
        record(ledger, [{"id": sid, "hash": h}], {sid: result})
        entry = ledger["skills"][sid]
        if entry["status"] in ("flagged", "error"):
            ledger = load_ledger()  # leave the entry for what is on disk untouched
            ledger["pending"][sid] = entry
        else:
            ledger["pending"].pop(sid, None)
        save_ledger(ledger)
    if entry["status"] in ("flagged", "error"):
        deny(f"SkillSpector gate: {path} would leave this skill flagged.\n{describe(sid, entry)}\n"
             f"Staged copy for review: {keep}\n{approval_steps([(sid, h)])}")
    else:
        allow_with_context(f"SkillSpector: {sid} scored {result['score']}/100 {result['severity']} ({entry['status']}).")


def gate_settings(path, tool, ti):
    content = proposed_content(path, tool, ti)
    if content is None:
        return
    try:
        new = json.loads(content)
    except ValueError:
        return
    old = read_settings(path) if path.exists() else {}
    keys = enabled_plugins(new) - enabled_plugins(old)
    old_mkts = old.get("extraKnownMarketplaces") or {}
    for mkt, cfg in (new.get("extraKnownMarketplaces") or {}).items():
        if old_mkts.get(mkt) != cfg:
            keys |= {k for k in enabled_plugins(new) if k.partition("@")[2] == mkt}
    if not keys:
        return
    try:
        scanner()
    except ScannerMissing as e:
        deny(f"SkillSpector gate: {e}. Plugins {', '.join(sorted(keys))} can't be enabled until they are scanned.")
        return
    targets, records, errors = discover_marketplaces(new, only=keys)
    with ledger_lock():
        ledger = load_ledger()
    todo = [t for t in targets if needs_scan(ledger, t)]
    results, _ = scan_many(todo)
    with ledger_lock():
        ledger = load_ledger()
        record(ledger, todo, results)
        ledger["marketplaces"].update(records)
        save_ledger(ledger)
    ids = {t["id"] for t in targets}
    flagged = blocked(ledger, ids)
    surface = [f"- {name} ({label}): " + ", ".join(f"{k}: {v}" for k, v in p.items() if k != "skills")
               for label, m in records.items() for name, p in m["plugins"].items() if len(p) > 1]
    summary = f"SkillSpector scanned {len(ids)} skills from {', '.join(sorted(keys))}."
    if surface:
        summary += ("\nThese plugins also ship code SkillSpector does not scan; read it before enabling:\n"
                    + "\n".join(surface))
    if flagged or errors:
        staged = sorted(str(t["path"]) for t in targets if t["id"] in flagged)
        deny(f"SkillSpector gate: {summary}\n" + listing(flagged)
             + "".join(f"\n! {e}" for e in errors)
             + (f"\nFetched copies for review:\n  " + "\n  ".join(staged) if staged else "")
             + "\n" + approval_steps([(s, e["hash"]) for s, e in flagged.items()]))
    else:
        allow_with_context(summary + " None flagged.")


def cmd_hook_pre(_args):
    data = json.load(sys.stdin)
    tool, ti = data.get("tool_name"), data.get("tool_input") or {}
    if tool not in ("Write", "Edit", "MultiEdit") or not ti.get("file_path"):
        return 0
    path = Path(ti["file_path"])
    if not path.is_absolute():
        path = Path(data.get("cwd") or os.getcwd()) / path
    path = Path(os.path.normpath(path))
    if path.parent.name == ".claude" and path.name in ("settings.json", "settings.local.json"):
        gate_settings(path, tool, ti)
        return 0
    skill_dir = skill_dir_for(path)
    if skill_dir is None:
        return 0
    try:
        gate_skill(path, skill_dir, tool, ti)
    except ScannerMissing as e:
        deny(f"SkillSpector gate: {e}. Skill changes are blocked until it is installed.")
    return 0


def cmd_hook_post(_args):
    data = json.load(sys.stdin)
    cmd = (data.get("tool_input") or {}).get("command", "")
    if not re.search(r"skill|plugin|\.claude", cmd, re.I):
        return 0
    with ledger_lock():
        ledger = load_ledger()
    todo = [t for t in discover_local() if needs_scan(ledger, t)]
    if not todo:
        return 0
    try:
        results, skipped = scan_many(todo, budget=90)
    except ScannerMissing as e:
        emit({"decision": "block", "reason": f"New or changed skills were not scanned: {e}"})
        return 0
    with ledger_lock():
        ledger = load_ledger()
        record(ledger, todo, results)
        save_ledger(ledger)
    flagged = blocked(ledger, set(results))
    paths = {t["id"]: t["path"] for t in todo}
    msg = f"SkillSpector scanned {len(results)} new or changed skills after that command."
    if skipped:
        msg += f" {len(skipped)} more were not scanned in time; run `python3 {SCRIPT} scan`."
    if flagged:
        emit({"decision": "block", "reason": msg + " Flagged:\n" + listing(flagged, paths)
              + "\n" + approval_steps([(s, e["hash"]) for s, e in flagged.items()], retry=False)})
    else:
        emit({"hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": msg + " None flagged."}})
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("scan")
    p.add_argument("--all", action="store_true", help="rescan every skill, not just new or changed ones")
    p.add_argument("--jobs", type=int, default=4)
    p.add_argument("--report", help="write a Markdown report to this path")
    p.add_argument("--local-only", action="store_true", help="skip fetching project marketplace plugins")
    p.set_defaults(fn=cmd_scan)
    p = sub.add_parser("approve")
    p.add_argument("id")
    p.add_argument("--note", required=True)
    p.add_argument("--hash")
    p.set_defaults(fn=cmd_approve)
    sub.add_parser("status").set_defaults(fn=cmd_status)
    sub.add_parser("session-start").set_defaults(fn=cmd_session_start)
    sub.add_parser("hook-pre").set_defaults(fn=cmd_hook_pre)
    sub.add_parser("hook-post").set_defaults(fn=cmd_hook_post)
    args = parser.parse_args()
    try:
        sys.exit(args.fn(args))
    except ScannerMissing as e:
        sys.exit(str(e))


if __name__ == "__main__":
    main()
