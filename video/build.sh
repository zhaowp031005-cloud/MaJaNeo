#!/usr/bin/env bash
# 一键生成讲解视频。用法：MODELS=<模型目录> FONTS_DIR=<node_modules> ./build.sh <输出目录>
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; OUT="${1:?output dir}"; mkdir -p "$OUT"
python3 -I "$HERE/tts.py" "$MODELS" "$OUT"
python3 -I "$HERE/make_srt.py" "$OUT/timeline.json" "$OUT/subtitles.srt"
FONTS_DIR="$FONTS_DIR" node "$HERE/render.cjs" "$OUT" --workers "${WORKERS:-4}"
cd "$OUT"
ffmpeg -y -loglevel error -f concat -safe 0 -i parts.txt -c copy video_silent.mp4
ffmpeg -y -loglevel error -i video_silent.mp4 -i narration.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart explainer.mp4
echo "done: $OUT/explainer.mp4"
