"""Synthesize narration with sherpa-onnx Kokoro and emit timeline.json + narration.wav."""
import sys, os, json, re, numpy as np, soundfile as sf, sherpa_onnx
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from script import SCENES
MODELS, OUT = sys.argv[1], sys.argv[2]
SID = int(os.environ.get("VOICE_SID", 62)); SPEED = float(os.environ.get("VOICE_SPEED", 1.08))
FPS = 30
k = f"{MODELS}/kokoro-multi-lang-v1_1"
tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(
  model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
    model=f"{k}/model.onnx", voices=f"{k}/voices.bin", tokens=f"{k}/tokens.txt",
    data_dir=f"{k}/espeak-ng-data", dict_dir=f"{k}/dict",
    lexicon=f"{k}/lexicon-us-en.txt,{k}/lexicon-zh.txt"), num_threads=4)))
SR = tts.sample_rate
def trim(x, th=0.01):
    idx = np.where(np.abs(x) > th)[0]
    return x if len(idx) == 0 else x[max(0, idx[0]-int(0.03*SR)): idx[-1]+int(0.06*SR)]
def weight(s):  # 用于按比例分配字幕时长
    s = re.sub(r"[，。、：；！？（）,.!?:;()\s]", "", s)
    return max(1, len(re.findall(r"[一-鿿\d]", s)) + 0.45*len(re.findall(r"[A-Za-z]", s)))
LEAD, GAP, SCENE_GAP, TAIL = 0.6, 0.28, 0.55, 1.6
audio = [np.zeros(int(LEAD*SR), np.float32)]; t = LEAD
scenes, subs = [], []
for si, (sid_name, lines) in enumerate(SCENES):
    sc = dict(id=sid_name, start=t, cues=[])
    for li, line in enumerate(lines):
        say = line.get("say", line["sub"].replace("|", ""))
        x = trim(np.array(tts.generate(say, sid=SID, speed=SPEED).samples, np.float32))
        dur = len(x)/SR
        sc["cues"].append(dict(start=t, end=t+dur))
        chunks = line["sub"].split("|"); ws = [weight(c) for c in chunks]; acc = t
        for c, w in zip(chunks, ws):
            d = dur*w/sum(ws); subs.append(dict(text=c, start=acc, end=acc+d)); acc += d
        audio.append(x); t += dur
        g = SCENE_GAP if li == len(lines)-1 else GAP
        audio.append(np.zeros(int(g*SR), np.float32)); t += g
        print(f"[{sid_name}] {say} {dur:.2f}s", flush=True)
    sc["end"] = t; scenes.append(sc)
audio.append(np.zeros(int(TAIL*SR), np.float32)); t += TAIL
wav = np.concatenate(audio); wav = wav/max(1e-6, np.abs(wav).max())*0.89
sf.write(f"{OUT}/narration.wav", wav, SR)
# 每帧音量包络，驱动吉祥物“说话”动画
n = int(np.ceil(len(wav)/SR*FPS)); hop = SR/FPS
env = [float(np.sqrt(np.mean(wav[int(i*hop):int((i+1)*hop)]**2))) if int(i*hop) < len(wav) else 0 for i in range(n)]
m = max(env); env = [round(min(1, e/m*1.6), 3) for e in env]
json.dump(dict(fps=FPS, duration=len(wav)/SR, scenes=scenes, subs=subs, env=env), open(f"{OUT}/timeline.json", "w"), ensure_ascii=False)
print("total", len(wav)/SR)
