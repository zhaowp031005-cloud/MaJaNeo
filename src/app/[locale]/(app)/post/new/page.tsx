"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { labelForLocale, statDimensions, type StatDimensionKey } from "@/shared/stats";

type StatEventDraft = { dimension: StatDimensionKey; delta: number; reason: string };

export default function NewPostPage() {
  const locale = useLocale();
  const router = useRouter();

  const [author, setAuthor] = useState<"MANTING" | "JANO" | "FAMILY">("FAMILY");
  const [occurredAt, setOccurredAt] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  });
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const timePickerRef = useRef<HTMLDivElement | null>(null);

  const occurredParts = useMemo(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(occurredAt);
    if (!m) {
      const d = new Date();
      return {
        y: d.getFullYear(),
        mo: d.getMonth() + 1,
        da: d.getDate(),
        hh: d.getHours(),
        mm: d.getMinutes(),
      };
    }
    return {
      y: Number(m[1]),
      mo: Number(m[2]),
      da: Number(m[3]),
      hh: Number(m[4]),
      mm: Number(m[5]),
    };
  }, [occurredAt]);

  const yearOptions = useMemo(() => {
    const now = new Date();
    const base = now.getFullYear();
    const start = Math.min(base - 2, occurredParts.y - 1);
    const end = Math.max(base + 2, occurredParts.y + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [occurredParts.y]);

  const dayOptions = useMemo(() => {
    const max = new Date(occurredParts.y, occurredParts.mo, 0).getDate();
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [occurredParts.y, occurredParts.mo]);

  useEffect(() => {
    if (!timePickerOpen) return;
    function onMouseDown(e: MouseEvent) {
      const root = timePickerRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) setTimePickerOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setTimePickerOpen(false);
    }
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [timePickerOpen]);

  function updateOccurredDate(next: { y?: number; mo?: number; da?: number; hh?: number; mm?: number }) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = next.y ?? occurredParts.y;
    const mo = next.mo ?? occurredParts.mo;
    const max = new Date(y, mo, 0).getDate();
    const daRaw = next.da ?? occurredParts.da;
    const da = Math.min(Math.max(1, daRaw), max);
    const hh = next.hh ?? occurredParts.hh;
    const mm = next.mm ?? occurredParts.mm;
    setOccurredAt(`${y}-${pad(mo)}-${pad(da)}T${pad(hh)}:${pad(mm)}`);
  }
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [drafts, setDrafts] = useState<StatEventDraft[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftMap = useMemo(() => {
    const map = new Map<StatDimensionKey, StatEventDraft>();
    for (const d of drafts) map.set(d.dimension, d);
    return map;
  }, [drafts]);

  async function generateSuggestions() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("analyze_failed");
      const json = (await res.json()) as { suggestions: StatEventDraft[] };
      setDrafts(json.suggestions);
    } catch {
      setError("结算生成失败，请重试");
    } finally {
      setBusy(false);
    }
  }

  function setDelta(dim: StatDimensionKey, delta: number) {
    setDrafts((prev) => {
      const next = prev.filter((p) => p.dimension !== dim);
      const base = draftMap.get(dim) ?? { dimension: dim, delta: 0, reason: "手动调整" };
      next.push({ ...base, delta });
      return next;
    });
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("author", author);
      form.set("occurredAt", new Date(occurredAt).toISOString());
      form.set("content", content);
      if (drafts.length) {
        form.set(
          "statEventsJson",
          JSON.stringify(drafts.filter((d) => Number.isFinite(d.delta) && d.delta !== 0))
        );
      }
      for (const f of files) form.append("media", f);

      const res = await fetch("/api/posts", { method: "POST", body: form });
      if (!res.ok) throw new Error("create_failed");
      router.push("/timeline");
    } catch {
      setError("发布失败，请检查内容或稍后再试");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="text-sm font-medium text-white/70">New Post</div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm text-white/70">
              Author
              <select
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                value={author}
                onChange={(e) => setAuthor(e.target.value as typeof author)}
              >
                <option value="MANTING">Manting</option>
                <option value="JANO">Jano</option>
                <option value="FAMILY">Family</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm text-white/70">
              Time
              <div ref={timePickerRef} className="grid gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!occurredAt) {
                      const d = new Date();
                      const pad = (n: number) => String(n).padStart(2, "0");
                      setOccurredAt(
                        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
                          d.getHours()
                        )}:${pad(d.getMinutes())}`
                      );
                    }
                    setTimePickerOpen((v) => !v);
                  }}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                >
                  <span>
                    {String(occurredParts.y).padStart(4, "0")}/
                    {String(occurredParts.mo).padStart(2, "0")}/
                    {String(occurredParts.da).padStart(2, "0")}{" "}
                    {String(occurredParts.hh).padStart(2, "0")}:
                    {String(occurredParts.mm).padStart(2, "0")}
                  </span>
                  <span className="text-white/50">▾</span>
                </button>

                {timePickerOpen ? (
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      <label className="grid gap-1 text-xs text-white/60">
                        年
                        <select
                          className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none"
                          value={occurredParts.y}
                          onChange={(e) => updateOccurredDate({ y: Number(e.target.value) })}
                        >
                          {yearOptions.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="grid gap-1 text-xs text-white/60">
                        月
                        <select
                          className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none"
                          value={occurredParts.mo}
                          onChange={(e) => updateOccurredDate({ mo: Number(e.target.value) })}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>
                              {String(m).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="grid gap-1 text-xs text-white/60">
                        日
                        <select
                          className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none"
                          value={occurredParts.da}
                          onChange={(e) => updateOccurredDate({ da: Number(e.target.value) })}
                        >
                          {dayOptions.map((d) => (
                            <option key={d} value={d}>
                              {String(d).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                ) : null}
              </div>
            </label>

            <label className="grid gap-1 text-sm text-white/70">
              Content
              <textarea
                className="min-h-32 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下今天的成长记录（支持中/英/德）"
              />
            </label>

            <label className="grid gap-1 text-sm text-white/70">
              Media
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                className="block w-full text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
              <div className="text-xs text-white/40">
                {files.length ? `${files.length} 个文件` : "可上传照片/视频/语音"}
              </div>
            </label>

            {error ? <div className="text-sm text-red-300">{error}</div> : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={generateSuggestions}
                disabled={busy || !content.trim()}
                className="rounded-full border border-white/15 bg-transparent px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                生成结算
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={busy || !content.trim()}
                className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                发布
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-medium text-white/70">结算（可调整）</div>
          <div className="mt-4 space-y-4">
            {statDimensions.map((d) => {
              const draft = draftMap.get(d.key);
              const delta = draft?.delta ?? 0;
              return (
                <div key={d.key} className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-white/80">
                      {labelForLocale(d, locale)}
                    </div>
                    <div className="text-white/60">
                      {delta > 0 ? "+" : ""}
                      {delta}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={-2}
                    max={5}
                    step={1}
                    value={delta}
                    onChange={(e) => setDelta(d.key, Number(e.target.value))}
                  />
                  <div className="text-xs text-white/40">
                    {draft?.reason ?? "未结算"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
