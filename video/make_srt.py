"""timeline.json -> subtitles.srt"""
import json, sys
tl = json.load(open(sys.argv[1])); out = open(sys.argv[2], "w", encoding="utf-8")
f = lambda t: f"{int(t//3600):02d}:{int(t%3600//60):02d}:{int(t%60):02d},{int(t*1000%1000):03d}"
for i, s in enumerate(tl["subs"], 1):
    out.write(f"{i}\n{f(s['start'])} --> {f(s['end'])}\n{s['text'].rstrip('，。；：、')}\n\n")
