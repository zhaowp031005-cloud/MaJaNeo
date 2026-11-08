# 口播讲解视频生成器

把口播稿《用 Grok Bot 调用 Claude Code》做成 1920×1080 / 60fps 的讲解视频，画风参考“App 界面 + 黑色圆球吉祥物 + 底部大字幕胶囊”，简洁科技风（Inter / 思源黑体、冷灰 + 靛蓝配色、细描边柔和阴影、网格背景，保留黑球吉祥物作为可爱点缀）；开场是全屏“贴脸大字”吐槽（大字砸屏 + 震屏 + 闪光 + 冲击音效，期间不显示底部字幕）；镜头推拉、重点高亮、合成音效（默认无背景音乐）。教程最后有一页全屏「操作总览」，停留约 3 秒供截图。

## 组成
- `script.py`：分镜与旁白。每个 scene 一个画面；`sub` 里的 `|` 是字幕分段，`say` 是给 TTS 读的文本（处理数字、缩写读法）。
- `tts.py`：离线中文 TTS（sherpa-onnx + Kokoro v1.1-zh，默认男声 `VOICE_SID=62`，语速 `VOICE_SPEED=1.08`），输出 `narration.wav` 与 `timeline.json`（每句/每条字幕时间 + 每帧音量包络，用来驱动吉祥物“说话”）。
- `index.html` / `style.css` / `engine.js`：动画页面。元素用 `data-in="c2+0.3"`（第 2 句开始后 0.3 秒）或 `data-in="s5"`（本场第 5 条字幕）声明出场时间，`window.seek(t)` 逐帧确定性渲染。
  - 镜头：`window.CAMS` 里按场景写 `[时间, 缩放, 焦点x, 焦点y]`，场景切换时自动回到全景。只在单一焦点时推镜，并列排布（多张卡片、步骤、对比）保持全景，保证整排完整可见。
  - 强调：`data-emph`（弹一下 + 光圈）、`data-mk`（荧光笔划线）、`data-burst`（星星彩屑）、`data-hl`（逐行高亮）。
  - 开场全屏场景加 `data-nosub` 隐藏底部字幕；`data-anim="slam"` 为大字砸下动画。
  - 音效：`window.collectSfx()` 从时间轴自动生成音效事件，`data-sfx="ding|nope|none…"` 可覆盖。
- `sfx.py`：用 numpy 合成全部音效（弹出、打字、发送、成功叮、否定、嗖、弹簧、闪光、快门…），输出 `mix.wav`（旁白 + 音效）。默认不加背景音乐；需要时 `BGM=1` 可叠加八音盒 BGM（说话时自动压低）。
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

字体：`npm i @fontsource/noto-sans-sc @fontsource/nunito @fontsource/fredoka @fontsource/zcool-kuaile @fontsource/jetbrains-mono`

换成自己的配音：直接用 `video_silent.mp4` 配音即可，或替换 `narration.wav` 后重新 mux（注意画面节奏按 TTS 时长生成）。

## 素材（不入库）
`video/assets/` 已加入 .gitignore（第三方 logo、人物照片、截图不提交到仓库）。渲染前放入：
- `logo-claude.png` `logo-openai.png` `logo-grok.png` `logo-x.png` `logo-cursor.png`：256×256 圆角图标
- `cutout-a.png` `cutout-b.png`：开场“太不是人了”时弹出的人物抠图（可用 rembg 的 u2net_human_seg 抠）
- `case-claude.jpg` `case-tweets.jpg` `case-openai.jpg`：开场弹出的封号案例截图
