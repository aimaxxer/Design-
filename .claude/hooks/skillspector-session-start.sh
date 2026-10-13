#!/bin/bash
# Keeps NVIDIA SkillSpector installed in cloud sessions, then rescans any skill
# or project plugin that changed since the last review (see CLAUDE.md).
set -uo pipefail

export PATH="$HOME/.local/bin:$PATH"

if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ] && ! skillspector --version 2>/dev/null | grep -q 'v2\.12\.0'; then
  # stdout is reserved for the hook's JSON, so send installer output to stderr.
  uv tool install --force 'git+https://github.com/NVIDIA/skillspector.git@v2.12.0' >&2 \
    || echo "SkillSpector install failed" >&2
fi

exec python3 "${CLAUDE_PROJECT_DIR:-$(pwd)}/.claude/skill-security/skill_scan.py" session-start
