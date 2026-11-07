# 口播讲解视频生成器

把口播稿《用 Grok Bot 调用 Claude Code》做成 1920×1080 / 30fps 的讲解视频，画风参考“App 界面 + 黑色圆球吉祥物 + 底部大字幕胶囊”。

## 组成
- `script.py`：分镜与旁白。每个 scene 一个画面；`sub` 里的 `|` 是字幕分段，`say` 是给 TTS 读的文本（处理数字、缩写读法）。
- `tts.py`：离线中文 TTS（sherpa-onnx + Kokoro v1.1-zh，默认男声 `VOICE_SID=62`，语速 `VOICE_SPEED=1.08`），输出 `narration.wav` 与 `timeline.json`（每句/每条字幕时间 + 每帧音量包络，用来驱动吉祥物“说话”）。
- `index.html` / `style.css` / `engine.js`：动画页面。元素用 `data-in="c2+0.3"`（第 2 句开始后 0.3 秒）或 `data-in="s5"`（本场第 5 条字幕）声明出场时间，`window.seek(t)` 逐帧确定性渲染。
- `render.cjs`：Playwright 逐帧截图 → ffmpeg 编码；`--still scene:spec,...` 可只出预览图。
- `make_srt.py`：导出 `subtitles.srt`。
- `build.sh`：一键流水线。

## 依赖
```bash
pip install sherpa-onnx soundfile numpy
# 模型（GitHub release）
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_1.tar.bz2
# 字体
npm i @fontsource/noto-sans-sc @fontsource/inter @fontsource/jetbrains-mono
```
运行：`MODELS=./models FONTS_DIR=./node_modules ./build.sh ./out`

换成自己的配音：直接用 `video_silent.mp4` 配音即可，或替换 `narration.wav` 后重新 mux（注意画面节奏按 TTS 时长生成）。
