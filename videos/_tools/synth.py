"""Sound beds for the 10X Affiliation reels.

Each reel gets a 120 BPM track (one beat = 0.5s, one bar = 2s) plus sound effects
placed on the same grid as the cuts in its composition. Everything is synthesised
here so the audio is reproducible and royalty-free.

Usage: python3 synth.py <reel-id> <out.wav>   (reel ids: v1..v5)
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
BEAT = 0.5
DUR = 15.0
N = int(SR * DUR)
rng = np.random.default_rng(10)  # seeded: identical output on every run


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tvec(d):
    return np.arange(int(SR * d)) / SR


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


class Mix:
    def __init__(self):
        self.bus = {k: np.zeros((N, 2)) for k in ("drums", "bass", "music", "fx", "verb")}

    def add(self, bus, sig, at, gain=1.0, pan=0.0, send=0.0):
        if sig.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            sig = np.stack([sig * l * 1.414, sig * r * 1.414], 1)
        i = int(at * SR)
        if i >= N:
            return
        j = min(N, i + len(sig))
        self.bus[bus][i:j] += sig[: j - i] * gain
        if send:
            self.bus["verb"][i:j] += sig[: j - i] * gain * send


# ---------- instruments ----------
def kick():
    t = tvec(0.5)
    f = 46 + 120 * np.exp(-t / 0.032)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.17)
    click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.003) * 0.35
    return np.tanh(1.6 * (body + click)) * 0.9


def clap():
    t = tvec(0.35)
    n = rng.standard_normal(len(t))
    env = np.zeros_like(t)
    for o in (0, 0.009, 0.019):
        env += np.where(t >= o, np.exp(-(t - o) / 0.006), 0)
    env += np.where(t >= 0.019, 0.55 * np.exp(-(t - 0.019) / 0.09), 0)
    return bp(n, 900, 4200) * env * 0.8


def hat(open_=False):
    t = tvec(0.3 if open_ else 0.08)
    n = hp(rng.standard_normal(len(t)), 7500, 4)
    return n * np.exp(-t / (0.12 if open_ else 0.022)) * 0.45


def sub(m, d):
    t = tvec(d)
    f = midi(m)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    env = np.minimum(1, t / 0.006) * np.minimum(1, np.maximum(0, (d - t) / 0.03))
    return np.tanh(1.8 * x * env) * 0.55


def bell(m, d=1.2, idx=2.6, ratio=3.5, decay=0.5):
    t = tvec(d)
    f = midi(m)
    mod = idx * np.exp(-t / 0.09) * np.sin(2 * np.pi * f * ratio * t)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t / decay) * np.minimum(1, t / 0.002)
    return x * 0.4


def pluck(m, d=0.35):
    t = tvec(d)
    f = midi(m)
    saw = sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 14))
    return lp(saw, 900 + 3500 * 0.5) * np.exp(-t / 0.11) * 0.22


def pad(notes, d, cutoff=1600):
    t = tvec(d)
    out = np.zeros((len(t), 2))
    for ni, m in enumerate(notes):
        for v, det in enumerate((-0.11, -0.04, 0.04, 0.11)):
            f = midi(m) * 2 ** (det / 12)
            ph = rng.uniform(0, 2 * np.pi)
            saw = sum(np.sin(2 * np.pi * f * k * t + ph * k) / k for k in range(1, 10))
            out[:, v % 2] += saw
    out = np.stack([lp(out[:, 0], cutoff), lp(out[:, 1], cutoff)], 1)
    env = np.minimum(1, t / 0.35) * np.minimum(1, np.maximum(0, (d - t) / 0.8))
    return out * env[:, None] * (0.05 / len(notes) * 3)


def riser(d):
    t = tvec(d)
    p = t / d
    n = rng.standard_normal(len(t))
    lo = hp(n, 1500) * p ** 2.2
    hi = hp(n, 6000) * p ** 3
    tone = np.sin(2 * np.pi * np.cumsum(220 + 900 * p ** 2) / SR) * 0.15 * p ** 2
    return (lo * 0.25 + hi * 0.2 + tone) * 0.8


def whoosh(d=0.4, peak=0.65):
    t = tvec(d)
    p = t / d
    env = np.where(p < peak, (p / peak) ** 2, np.exp(-(p - peak) / 0.12))
    n = rng.standard_normal(len(t))
    x = bp(n, 300, 5000) * env * 0.5
    pan = np.linspace(-0.7, 0.7, len(t))
    return np.stack([x * (1 - pan) * 0.8, x * (1 + pan) * 0.8], 1)


def impact(size=1.0):
    t = tvec(1.6)
    f = 34 + 40 * np.exp(-t / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.45 * size))
    crack = bp(rng.standard_normal(len(t)), 250, 2500) * np.exp(-t / 0.05) * 0.5
    return np.tanh(1.4 * (boom * 0.9 + crack)) * 0.8 * size


def tick(f=2600, d=0.03, g=0.25):
    t = tvec(d)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) * g


def ding():
    a = bell(88, 1.0, idx=1.2, ratio=2.0, decay=0.35)
    b = bell(95, 1.0, idx=1.0, ratio=2.0, decay=0.3)
    out = np.zeros(len(a) + int(0.09 * SR))
    out[: len(a)] += a
    out[int(0.09 * SR):] += b
    return out * 0.8


def shimmer(d=1.0, base=96):
    out = np.zeros(int(SR * (d + 1.0)))
    for k in range(10):
        b = bell(base + [0, 3, 7, 10, 12, 15, 19, 22, 24, 27][k], 0.9, idx=1.0, ratio=2.0, decay=0.25) * 0.35
        i = int(k * d / 10 * SR)
        out[i:i + len(b)] += b
    return out


def reverb(x, rt=1.4):
    t = tvec(rt * 1.3)
    ir_l = rng.standard_normal(len(t)) * np.exp(-t / (rt / 6.9))
    ir_r = rng.standard_normal(len(t)) * np.exp(-t / (rt / 6.9))
    ir_l, ir_r = lp(ir_l, 6000), lp(ir_r, 6000)
    ir_l /= np.sqrt(np.sum(ir_l ** 2)); ir_r /= np.sqrt(np.sum(ir_r ** 2))
    l = fftconvolve(x[:, 0], ir_l)[:N]
    r = fftconvolve(x[:, 1], ir_r)[:N]
    return np.stack([l, r], 1) * 0.45


# ---------- arrangement helpers ----------
def groove(m, start, end, roots, skip=(), hats16=(), claps=True, bassline=True, kick_on=True):
    """Four-on-the-floor between start and end. roots: one MIDI note per 2s bar."""
    kicks = []
    t = start
    while t < end - 1e-6:
        if not any(a <= t < b for a, b in skip):
            if kick_on:
                m.add("drums", kick(), t, 0.95)
                kicks.append(t)
            beat_in_bar = round((t % 2.0) / BEAT)
            if claps and beat_in_bar in (1, 3):
                m.add("drums", clap(), t, 0.55, pan=0.05, send=0.25)
            m.add("drums", hat(beat_in_bar == 2 and False), t + 0.25, 0.5, pan=0.25)
            if any(a <= t < b for a, b in hats16):
                m.add("drums", hat(), t + 0.125, 0.28, pan=-0.3)
                m.add("drums", hat(), t + 0.375, 0.28, pan=-0.3)
            if bassline:
                root = roots[int(t // 2.0) % len(roots)]
                m.add("bass", sub(root, 0.22), t + 0.25, 0.85)
        t += BEAT
    return kicks


def sidechain(m, kicks, depth=0.55):
    g = np.ones(N)
    tt = np.arange(N) / SR
    for k in kicks:
        i = int(k * SR)
        seg = tt[i:i + int(0.3 * SR)] - k
        g[i:i + len(seg)] = np.minimum(g[i:i + len(seg)], 1 - depth * np.exp(-seg / 0.09))
    for b in ("bass", "music"):
        m.bus[b] *= g[:, None]


def arp(m, start, end, chords, step=0.125, gain=0.5, octave=12):
    t, k = start, 0
    while t < end - 1e-6:
        notes = chords[int(t // 2.0) % len(chords)]
        n = notes[k % len(notes)] + octave
        m.add("music", bell(n, 0.5, idx=1.8, ratio=3.0, decay=0.16), t, gain, pan=(-0.35 if k % 2 else 0.35), send=0.3)
        t += step
        k += 1


def count_ticks(m, start, dur, target, ease):
    """One tick each time the displayed number steps up, timed by the same ease as the counter."""
    xs = np.linspace(0, 1, 2000)
    vals = np.round(target * ease(xs))
    last = 0
    for x, v in zip(xs, vals):
        if v > last:
            m.add("fx", tick(2400 + 18 * v, g=0.12), start + x * dur, 1.0, pan=0.1)
            last = v


def brand_out(x):  # cubic-bezier(0.23,1,0.32,1), solved numerically
    return bezier_y(0.23, 1, 0.32, 1, x)


def bezier_y(x1, y1, x2, y2, xs):
    ts = np.linspace(0, 1, 4000)
    bx = 3 * x1 * ts * (1 - ts) ** 2 + 3 * x2 * ts ** 2 * (1 - ts) + ts ** 3
    by = 3 * y1 * ts * (1 - ts) ** 2 + 3 * y2 * ts ** 2 * (1 - ts) + ts ** 3
    return np.interp(xs, bx, by)


def ending(m, at, chord, top):
    m.add("music", pad(chord, DUR - at + 0.2, 2200), at, 1.0, send=0.5)
    for i, n in enumerate(chord + [top]):
        m.add("music", bell(n + 12, 2.6, idx=1.4, ratio=2.0, decay=0.9), at + i * 0.06, 0.35, pan=(-0.3 + 0.2 * i), send=0.6)
    m.add("fx", impact(0.8), at, 0.7, send=0.4)


# ---------- reels ----------
def v1(m):  # Money on the table, F minor
    roots = [41, 37, 44, 39]  # F Db Ab Eb
    chords = [[53, 56, 60], [49, 53, 56], [56, 60, 63], [51, 55, 58]]
    m.add("fx", impact(1.0), 0.02, 0.9, send=0.3)
    for t, n in ((0.15, 65), (0.5, 68), (1.0, 72)):
        m.add("music", pluck(n, 0.5), t, 0.9, send=0.3)
    m.add("fx", impact(0.7), 0.5, 0.6)
    for t in (2.5, 3.0, 3.5):
        m.add("fx", whoosh(0.22), t - 0.14, 0.7)
        m.add("fx", impact(0.5), t, 0.55)
        m.add("music", pluck(72, 0.4), t, 0.7, send=0.3)
    m.add("fx", whoosh(0.45), 3.6, 0.8)
    m.add("fx", riser(1.0), 5.0, 0.8)
    m.add("fx", impact(1.2), 6.0, 0.95, send=0.4)
    count_ticks(m, 6.2, 1.6, 40, brand_out)
    m.add("fx", shimmer(1.0, 89), 8.6, 0.6, send=0.5)
    m.add("fx", whoosh(0.4), 10.2, 0.8)
    m.add("fx", impact(0.8), 10.6, 0.7)
    m.add("fx", whoosh(0.4), 11.7, 0.7)
    kicks = groove(m, 0.0, 12.0, roots, skip=((5.5, 6.0),), hats16=((6.0, 10.5),))
    arp(m, 6.0, 10.5, chords, gain=0.35)
    m.add("music", pad(chords[0], 6.0, 1400), 0.0, 0.8, send=0.3)
    sidechain(m, kicks)
    ending(m, 12.0, [53, 56, 60, 65], 72)


def v2(m):  # 10x buying power, D minor
    roots = [38, 34, 41, 36]  # D Bb F C
    chords = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]]
    m.add("fx", riser(0.6), 0.0, 0.6)
    m.add("fx", whoosh(0.7, 0.8), 0.1, 0.9)
    m.add("fx", impact(1.1), 0.8, 0.9, send=0.4)
    m.add("music", pluck(62, 0.5), 2.2, 0.8)
    m.add("music", pluck(65, 0.5), 2.8, 0.8)
    # credit grows: a gliding tone plus a tick per multiple
    t = tvec(0.9)
    glide = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (np.linspace(0, 1, len(t)) * 2.3)) / SR) * np.minimum(1, t / 0.05) * 0.12
    m.add("fx", glide, 3.0, 1.0, send=0.2)
    for k in range(10):
        m.add("fx", tick(1800 + 160 * k, g=0.18), 3.0 + k * 0.12, 1.0)
    m.add("fx", impact(1.2), 4.4, 0.95, send=0.4)
    m.add("fx", shimmer(1.0, 86), 4.8, 0.6, send=0.5)
    m.add("fx", whoosh(0.4), 5.7, 0.8)
    for i in range(7):
        tt = 6.0 + i * 0.5
        m.add("fx", tick(2200, g=0.2), tt, 1.0)
        m.add("music", pluck([62, 65, 69, 72, 69, 65, 74][i], 0.3), tt, 0.6, send=0.25)
    m.add("fx", whoosh(0.4), 9.2, 0.8)
    m.add("fx", impact(1.0), 9.6, 0.85, send=0.3)
    m.add("fx", whoosh(0.4), 11.7, 0.7)
    kicks = groove(m, 0.8, 12.0, roots, skip=((4.0, 4.4),), hats16=((6.0, 9.5),))
    arp(m, 6.0, 9.5, chords, gain=0.3)
    sidechain(m, kicks)
    ending(m, 12.0, [50, 53, 57, 62], 69)


def v3(m):  # Structure, A minor
    roots = [45, 41, 36, 43]  # A F C G
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
    for i, tt in enumerate((0.6, 1.1, 1.6, 2.1, 2.6)):
        m.add("fx", impact(0.9 + 0.05 * i), tt, 0.85, send=0.25)
        m.add("drums", clap(), tt, 0.4, send=0.3)
    m.add("music", pad(chords[0], 3.5, 900), 0.0, 0.9, send=0.3)
    m.add("fx", riser(0.5), 3.0, 0.7)
    m.add("fx", whoosh(0.5), 3.3, 1.0)
    m.add("music", pad(chords[1], 1.8, 1200), 3.5, 1.0, send=0.5)
    m.add("music", bell(69, 1.5), 3.7, 0.7, send=0.6)
    m.add("fx", riser(0.8), 4.2, 0.6)
    m.add("fx", impact(1.2), 5.0, 0.95, send=0.4)
    m.add("fx", whoosh(0.4), 6.2, 0.8)
    for tt in (9.9, 10.4, 10.9, 11.4):
        for k in range(4):
            m.add("fx", tick(2000 + 300 * k, g=0.12), tt - 0.12 + k * 0.03, 1.0)
        m.add("music", pluck(69, 0.3), tt, 0.6, send=0.3)
    m.add("fx", whoosh(0.45), 12.2, 0.7)
    kicks = groove(m, 0.6, 12.5, roots, skip=((3.5, 5.0),), hats16=((9.5, 12.5),))
    arp(m, 9.5, 12.5, chords, gain=0.3)
    sidechain(m, kicks)
    ending(m, 12.5, [57, 60, 64, 69], 76)


def v4(m):  # Within 1 hour, E minor
    roots = [40, 36, 43, 38]  # E C G D
    chords = [[52, 55, 59], [48, 52, 55], [55, 59, 62], [50, 54, 57]]
    for k in range(12):  # minute markers drawing round the dial
        m.add("fx", tick(3000 if k % 3 == 0 else 2400, g=0.2 if k % 3 == 0 else 0.12), 0.2 + k * 0.11, 1.0)
    m.add("fx", impact(0.9), 1.2, 0.8, send=0.3)
    m.add("fx", whoosh(0.4), 2.75, 0.85)
    for i, tt in enumerate((3.2, 4.2, 5.2)):
        m.add("fx", tick(1700, g=0.3), tt, 1.0)
        m.add("music", pluck([64, 67, 71][i], 0.5), tt, 0.8, send=0.3)
        if i:
            m.add("fx", whoosh(0.35), tt - 0.3, 0.5)
    m.add("fx", whoosh(0.45), 6.75, 0.85)
    for tt in (8.0, 8.75, 9.5):
        m.add("fx", ding(), tt, 0.7, send=0.4)
    m.add("fx", whoosh(0.4), 10.75, 0.8)
    m.add("fx", impact(1.0), 11.0, 0.85, send=0.3)
    m.add("fx", whoosh(0.4), 12.2, 0.7)
    kicks = groove(m, 0.0, 12.5, roots, hats16=((3.0, 7.0),))
    arp(m, 7.0, 11.0, chords, gain=0.25, step=0.25)
    sidechain(m, kicks)
    ending(m, 12.5, [52, 55, 59, 64], 71)


def v5(m):  # Infrastructure, C minor
    roots = [36, 44, 39, 46]  # C Ab Eb Bb
    chords = [[48, 51, 55], [44, 48, 51], [51, 55, 58], [46, 50, 53]]
    for k in range(8):
        m.add("fx", tick(2600 + 120 * k, g=0.15), k * 0.25, 1.0)
        m.add("drums", hat(), k * 0.25, 0.5)
    m.add("fx", riser(2.0), 0.0, 0.8)
    m.add("fx", impact(1.3), 2.0, 1.0, send=0.5)
    m.add("fx", shimmer(1.1, 84), 2.4, 0.6, send=0.6)
    for tt in (3.5, 4.5, 5.5, 6.5, 7.5):
        m.add("fx", whoosh(0.5, 0.75), tt - 0.25, 0.85)
    m.add("music", pad(chords[0], 2.6, 1500), 8.5, 1.0, send=0.5)
    m.add("music", bell(72, 1.5), 8.6, 0.6, send=0.6)
    m.add("music", bell(75, 1.5), 9.6, 0.6, send=0.6)
    m.add("fx", riser(0.9), 10.9, 0.8)
    m.add("fx", whoosh(0.6, 0.8), 11.2, 0.9)
    m.add("fx", impact(1.4), 11.9, 1.0, send=0.5)
    m.add("fx", shimmer(0.8, 91), 12.2, 0.45, send=0.6)
    kicks = groove(m, 2.0, 11.0, roots, skip=((8.5, 9.5),), hats16=((3.5, 8.5),))
    arp(m, 3.5, 8.5, chords, gain=0.33)
    sidechain(m, kicks)
    ending(m, 11.9, [48, 51, 55, 60], 67)


def master(m):
    m.bus["verb"] = reverb(m.bus["verb"] + m.bus["music"] * 0.15)
    mix = m.bus["drums"] * 0.9 + m.bus["bass"] * 0.8 + m.bus["music"] * 0.9 + m.bus["fx"] * 0.85 + m.bus["verb"]
    mix = hp(mix.T, 28).T
    mix *= 10 ** (-17 / 20) / np.sqrt(np.mean(mix ** 2))  # sit the mix at -17 dBFS RMS before the soft clip
    mix = np.tanh(mix * 1.1) / 1.1
    fade = np.ones(N)
    fade[-int(0.35 * SR):] = np.linspace(1, 0, int(0.35 * SR))
    mix *= fade[:, None]
    return mix


if __name__ == "__main__":
    reel, out = sys.argv[1], sys.argv[2]
    m = Mix()
    {"v1": v1, "v2": v2, "v3": v3, "v4": v4, "v5": v5}[reel](m)
    mix = master(m)
    pcm = (mix * 32767).astype("<i2")
    import wave
    with wave.open(out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    rms = 20 * np.log10(np.sqrt(np.mean(mix ** 2)))
    print(f"{reel}: {out} rms {rms:.1f} dBFS")
