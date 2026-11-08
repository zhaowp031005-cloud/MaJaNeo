"""合成音效 + 背景音乐，并与旁白混音。

用法: python3 sfx.py <buildDir>
输入: narration.wav, events.json（render.cjs --events 导出）, timeline.json
输出: sfx.wav（仅音效）, mix.wav（旁白 + 音效）；设置 BGM=1 时额外叠加闪避后的八音盒背景音乐并输出 bgm.wav
所有声音都用 numpy 实时合成，不依赖外部素材。
"""
import sys, os, json, subprocess, numpy as np, soundfile as sf

B = sys.argv[1]
SR = 48000
rng = np.random.default_rng(7)


# ---------------- 基础工具 ----------------
def tt(d): return np.arange(int(d * SR)) / SR

def env(n, a=0.003, tau=0.08):
    t = np.arange(n) / SR
    e = np.exp(-t / tau)
    na = max(1, int(a * SR)); e[:na] *= np.linspace(0, 1, na)
    return e

def chirp(f0, f1, d, curve=1.0):
    t = tt(d); k = (t / d) ** curve
    f = f0 + (f1 - f0) * k
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))

def noise(d): return rng.standard_normal(int(d * SR))

def norm(x, peak):
    m = np.abs(x).max()
    return x / m * peak if m > 0 else x

def tone(f, d, tau=0.3, partials=((1, 1),), a=0.004):
    t = tt(d); y = sum(g * np.sin(2 * np.pi * f * h * t) for h, g in partials)
    return y * env(len(t), a, tau)


# ---------------- 音效库（可爱向） ----------------
def s_pop():
    p = rng.choice([520, 600, 680, 780, 880])
    y = chirp(p * 1.9, p, 0.09, 0.5) * env(int(0.09 * SR), 0.002, 0.035)
    return norm(y, 0.33)

def s_soft():
    p = rng.choice([420, 470, 520])
    return norm(chirp(p * 1.5, p, 0.07, 0.5) * env(int(0.07 * SR), 0.002, 0.025), 0.16)

def s_msg():
    a = tone(660, 0.12, 0.05, ((1, 1), (2, .2))); b = tone(990, 0.16, 0.07, ((1, 1), (2, .2)))
    y = np.zeros(int(0.24 * SR)); y[:len(a)] += a; y[int(0.07 * SR):int(0.07 * SR) + len(b)] += b
    return norm(y, 0.3)

def s_send():
    y = chirp(480, 1500, 0.16, 1.6) * env(int(0.16 * SR), 0.004, 0.09)
    y += 0.3 * band(noise(0.16), 2000, 8000) * np.linspace(0, 1, int(0.16 * SR)) * env(int(0.16 * SR), 0.01, 0.06)
    return norm(y, 0.3)

def s_whoosh(d=0.5, lo=250, hi=3500, peak=0.22):
    n = noise(d); n = band(n, lo, hi)
    t = tt(d); shape = np.sin(np.pi * (t / d) ** 0.8) ** 2
    # 简单的“扫频”感：后半段叠加更高频
    hi_part = band(noise(d), hi * 0.8, hi * 2.2) * (t / d) ** 2
    return norm(n * shape + 0.4 * hi_part * shape, peak)

def s_zoomin(): return s_whoosh(0.45, 150, 1600, 0.13)
def s_zoomout(): return s_whoosh(0.4, 120, 1100, 0.09)

def s_swish(): return s_whoosh(0.22, 1500, 7000, 0.10)
def s_marker(): return s_whoosh(0.2, 2500, 9000, 0.07)

def bell(f, d=0.6, tau=0.28):
    return tone(f, d, tau, ((1, 1), (2.76, .25), (5.4, .08)), 0.002)

def s_ding():
    a = bell(1318.5); b = bell(1975.5, 0.7, 0.35)
    y = np.zeros(int(0.85 * SR)); y[:len(a)] += a; o = int(0.09 * SR); y[o:o + len(b)] += b
    return norm(y, 0.30)

def s_chime():
    y = np.zeros(int(0.8 * SR))
    for i, f in enumerate([1046.5, 1318.5, 1568.0]):
        b = bell(f, 0.5, 0.2); o = int(i * 0.06 * SR); y[o:o + len(b)] += b
    return norm(y, 0.22)

def s_nope():
    def sq(f, d):
        t = tt(d); y = np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 3 * f * t) + .12 * np.sin(2 * np.pi * 5 * f * t)
        return y * env(len(t), 0.004, 0.06)
    a = sq(784, 0.11); b = sq(587, 0.16)
    y = np.zeros(int(0.3 * SR)); y[:len(a)] += a; o = int(0.11 * SR); y[o:o + len(b)] += b
    return norm(y, 0.22)

def s_strike():  # 划掉：短促“唰”
    return s_whoosh(0.18, 1200, 5000, 0.12)

def s_alert():
    y = np.zeros(int(0.5 * SR))
    for i in range(2):
        b = tone(880, 0.18, 0.08, ((1, 1), (2, .3))); o = int(i * 0.16 * SR); y[o:o + len(b)] += b
    return norm(y, 0.22)

def s_uhoh():
    a = tone(520, 0.18, 0.12, ((1, 1), (2, .15)), 0.01); b = tone(400, 0.26, 0.15, ((1, 1), (2, .15)), 0.01)
    y = np.zeros(int(0.46 * SR)); y[:len(a)] += a; o = int(0.2 * SR); y[o:o + len(b)] += b
    return norm(y, 0.16)

def s_boing():
    t = tt(0.5); f = 180 + 520 * (1 - np.exp(-t / 0.08)) + 60 * np.sin(2 * np.pi * 18 * t) * np.exp(-t / 0.2)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.003, 0.18)
    return norm(y, 0.26)

def s_twinkle():
    y = np.zeros(int(0.6 * SR))
    for i in range(5):
        f = rng.uniform(2200, 4200); b = tone(f, 0.12, 0.04); o = int(i * 0.07 * SR); y[o:o + len(b)] += b * (1 - i * .12)
    return norm(y, 0.11)

def s_sparkle():
    y = np.zeros(int(0.9 * SR))
    for i in range(9):
        f = rng.uniform(1800, 4800); b = tone(f, 0.18, 0.06); o = int(rng.uniform(0, .55) * SR); y[o:o + len(b)] += b
    return norm(y, 0.16)

def s_shutter():
    y = np.zeros(int(0.25 * SR))
    for o in (0, 0.075):
        c = band(noise(0.035), 800, 7000) * env(int(0.035 * SR), 0.001, 0.008)
        i = int(o * SR); y[i:i + len(c)] += c
    return norm(y, 0.42)

def s_click():
    return norm(band(noise(0.02), 1500, 6000) * env(int(0.02 * SR), 0.0005, 0.004), 0.25)

def key_click():
    c = band(noise(0.018), 1800, 8000) * env(int(0.018 * SR), 0.0005, 0.004)
    c += 0.3 * tone(rng.uniform(1800, 2600), 0.018, 0.005)
    return norm(c, rng.uniform(0.05, 0.09))

def tick():
    return tone(2000, 0.02, 0.006) * 0.08

def rise(d):
    t = tt(d); f = 380 + 520 * (t / d)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.6
    return y * 0.05

def s_slam():  # 大字砸下：低频“咚”+ 冲击噪声
    t = tt(0.35); f = 40 + 120 * np.exp(-t / 0.04)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.12)
    hit = band(noise(0.35), 80, 3000) * env(len(t), 0.0005, 0.03)
    return norm(body + 0.5 * hit, 0.55)

def s_boom():  # 更重的冲击（配红色大字）
    t = tt(0.7); f = 32 + 140 * np.exp(-t / 0.05)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.25)
    rumble = band(noise(0.7), 40, 900) * env(len(t), 0.002, 0.18)
    crack = band(noise(0.7), 1500, 8000) * env(len(t), 0.0005, 0.02)
    return norm(body + 0.6 * rumble + 0.35 * crack, 0.6)


LIB = dict(pop=s_pop, soft=s_soft, msg=s_msg, send=s_send, whoosh=s_whoosh, zoomin=s_zoomin, zoomout=s_zoomout,
           swish=s_swish, marker=s_marker, ding=s_ding, chime=s_chime, nope=s_nope, strike=s_strike, alert=s_alert,
           uhoh=s_uhoh, boing=s_boing, slam=s_slam, boom=s_boom, twinkle=s_twinkle, sparkle=s_sparkle, shutter=s_shutter, click=s_click)


def build_sfx(events, dur):
    out = np.zeros(int((dur + 2) * SR))
    def add(x, t):
        i = int(max(0, t) * SR); j = min(len(out), i + len(x)); out[i:j] += x[:j - i]
    last = {}
    for e in events:
        k, t = e["k"], e["t"]
        # 同类音效太密时去重（避免一排元素同时弹出时糊成一片）
        gap = {'pop': .09, 'soft': .12, 'marker': .25, 'chime': .3, 'zoomin': .5, 'zoomout': .5, 'whoosh': .5}.get(k, .05)
        if t - last.get(k, -9) < gap: continue
        last[k] = t
        if k == 'keys':
            d, n = e.get('d', 1), e.get('n', 10)
            rate = min(14, n / max(d, .1)); m = int(d * rate)
            for i in range(m): add(key_click(), t + i / rate + rng.uniform(-.012, .012))
        elif k == 'count':
            d = e.get('d', 1.6); x = 0.0
            while x < d:
                add(tick(), t + x); x += 0.03 + 0.12 * (x / d) ** 2
        elif k == 'rise':
            add(rise(max(.2, e.get('d', 1))), t)
        elif k in LIB:
            add(LIB[k](), t)
    return out


# ---------------- 背景音乐：八音盒 + 软贝斯 + 沙锤 ----------------
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)

def musicbox(f, d=1.2):
    t = tt(d)
    y = np.sin(2 * np.pi * f * t) + .22 * np.sin(2 * np.pi * 2 * f * t) + .06 * np.sin(2 * np.pi * 4.2 * f * t) * np.exp(-t / .05)
    return y * env(len(t), 0.002, 0.45)

def build_bgm(dur):
    bpm = 100; beat = 60 / bpm; bar = 4 * beat
    out = np.zeros(int((dur + 3) * SR))
    def add(x, t, g):
        i = int(t * SR); j = min(len(out), i + len(x))
        if i < len(out): out[i:j] += g * x[:j - i]
    # C - G - Am - F（MIDI 和弦）
    prog = [[60, 64, 67], [55, 59, 62, 67], [57, 60, 64], [53, 57, 60, 65]]
    patA = [0, 1, 2, 3, 2, 1, 2, 1]; patB = [0, 2, 1, 3, 0, 2, 3, 2]
    nbar = int(dur / bar) + 2
    pad_cache = {}
    for b in range(nbar):
        t0 = b * bar; ch = prog[b % 4]
        tones = sorted(ch + [ch[0] + 12])
        pat = patA if (b // 4) % 2 == 0 else patB
        for i, idx in enumerate(pat):
            m = tones[idx % len(tones)] + 12
            add(musicbox(NOTE(m)), t0 + i * beat / 2, .22 if i % 2 == 0 else .16)
        # 每 8 小节加一句铃声小旋律
        if b % 8 in (3, 7):
            for i, m in enumerate([ch[-1] + 24, ch[1] + 24, ch[0] + 24]):
                add(bell(NOTE(m), .8, .3), t0 + 2 * beat + i * beat / 2, .07)
        # 贝斯（第 1、3 拍）
        root = ch[0] - 24
        for k in (0, 2):
            tb = tt(beat * 1.6); bass = (np.sin(2 * np.pi * NOTE(root) * tb) + .3 * np.sin(2 * np.pi * NOTE(root) * 2 * tb)) * env(len(tb), .01, .45)
            add(bass, t0 + k * beat, .22)
            # 轻柔“咚”
            kd = tt(.18); kick = np.sin(2 * np.pi * np.cumsum(110 * np.exp(-kd / .04) + 45) / SR) * env(len(kd), .001, .06)
            add(kick, t0 + k * beat, .18)
        # 沙锤：反拍八分音符
        for i in range(8):
            if i % 2 == 1:
                sh = band(noise(.05), 5000, 12000) * env(int(.05 * SR), .002, .015)
                add(sh, t0 + i * beat / 2, .05)
        # 柔和和弦铺底
        key = tuple(ch)
        if key not in pad_cache:
            tp = tt(bar); pad = sum(np.sin(2 * np.pi * NOTE(m) * tp) for m in ch)
            a = np.minimum(1, tp / .6) * np.minimum(1, (bar - tp) / .5)
            pad_cache[key] = band(pad * a, 80, 1200)
        add(pad_cache[key], t0, .035)
    out = out[:int(dur * SR)]
    fade_in, fade_out = int(1.5 * SR), int(3 * SR)
    out[:fade_in] *= np.linspace(0, 1, fade_in); out[-fade_out:] *= np.linspace(1, 0, fade_out)
    return out


def limit(x, thr=0.36, att_ms=1.5, rel_ms=90):
    """音效总线软限幅：多个音效叠在一起时不盖过旁白。"""
    a = np.abs(x); g = np.ones_like(x); s = 0.0
    att, rel = np.exp(-1 / (att_ms / 1000 * SR / 24)), np.exp(-1 / (rel_ms / 1000 * SR / 24))
    for i in range(0, len(x), 24):
        v = a[i:i + 24].max(); s = v if v > s else rel * s + (1 - rel) * v  # 瞬时起控
        g[i:i + 24] = min(1.0, thr / s) if s > 0 else 1.0
    return x * g


def main():
    tl = json.load(open(f"{B}/timeline.json")); ev = json.load(open(f"{B}/events.json"))
    dur = tl["duration"]
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{B}/narration.wav", "-ar", str(SR), "-ac", "1", f"{B}/narration48.wav"], check=True)
    voice, _ = sf.read(f"{B}/narration48.wav", dtype="float64")
    n = len(voice)
    sfx = limit(build_sfx(ev, dur)[:n])
    sf.write(f"{B}/sfx.wav", sfx.astype(np.float32), SR)
    if os.environ.get("BGM", "0") != "1":  # 默认不加背景音乐：只有旁白 + 音效（BGM=1 可开启）
        mix = norm(voice + sfx * 0.85, 0.95)
        sf.write(f"{B}/mix.wav", mix.astype(np.float32), SR)
        print("mixed (no BGM)", round(n / SR, 2), "s, events:", len(ev))
        return
    bgm = build_bgm(dur)[:n]
    bgm = np.pad(bgm, (0, n - len(bgm)))
    # 旁白闪避：说话时背景音乐压低
    w = int(.02 * SR); e = np.sqrt(np.convolve(voice ** 2, np.ones(w) / w, mode="same"))
    g = np.clip(e / 0.03, 0, 1)
    # 平滑：快压慢放
    sm = np.empty_like(g); s = 0.0
    att, rel = np.exp(-1 / (0.03 * SR)), np.exp(-1 / (0.45 * SR))
    for i in range(0, n, 48):  # 1ms 步进以加速
        v = g[i]; s = att * s + (1 - att) * v if v > s else rel * s + (1 - rel) * v
        sm[i:i + 48] = s
    duck = 1 - 0.55 * sm
    bgm_level = norm(bgm, 1) * 10 ** (-21 / 20)
    mix = voice + sfx * 0.85 + bgm_level * duck
    mix = norm(mix, 0.95)
    sf.write(f"{B}/bgm.wav", (bgm_level * duck).astype(np.float32), SR)
    sf.write(f"{B}/mix.wav", mix.astype(np.float32), SR)
    print("mixed", round(n / SR, 2), "s, events:", len(ev))


if __name__ == "__main__":
    main()
