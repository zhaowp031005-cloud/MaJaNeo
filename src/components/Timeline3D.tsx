"use client";

import { useEffect, useMemo, useState } from "react";

type TimelineMedia = {
  id: string;
  kind: "IMAGE" | "VIDEO" | "AUDIO";
  url: string | null;
  mime: string;
};

export type TimelinePost = {
  id: string;
  occurredAt: string;
  author: string;
  content: string;
  media: TimelineMedia[];
};

function formatDateTime(locale: string, iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function pickCover(media: TimelineMedia[]) {
  const image = media.find((m) => m.kind === "IMAGE" && m.url);
  if (image) return image;
  const video = media.find((m) => m.kind === "VIDEO" && m.url);
  if (video) return video;
  const audio = media.find((m) => m.kind === "AUDIO" && m.url);
  if (audio) return audio;
  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function TimelinePointCard({
  post,
  index,
  locale,
  onOpen,
}: {
  post: TimelinePost;
  index: number;
  locale: string;
  onOpen: (id: string) => void;
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const depth = Math.min(220, index * 22);
  const offset = index * 92;
  const side = index % 2 === 0 ? -1 : 1;
  const cover = pickCover(post.media);
  const title = formatDateTime(locale, post.occurredAt);
  const preview =
    post.content.length > 48 ? `${post.content.slice(0, 48)}...` : post.content;

  return (
    <button
      type="button"
      onClick={() => onOpen(post.id)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const ry = clamp((px - 0.5) * 22, -11, 11);
        const rx = clamp((0.5 - py) * 18, -9, 9);
        setTilt({
          rx,
          ry,
          gx: Math.round(px * 100),
          gy: Math.round(py * 100),
        });
      }}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 })}
      className="group absolute left-1/2 top-0 -translate-x-1/2"
      style={{
        transform: `translateY(${offset}px) translateX(${side * 120}px) translateZ(-${depth}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="mj-float h-4 w-4 rounded-full border border-white/40 bg-white/20 shadow-[0_0_0_6px_rgba(255,255,255,0.05),0_0_40px_rgba(255,255,255,0.12)] transition group-hover:bg-white/35" />
          <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-xl" />
        </div>

        <div
          className="relative w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d12]/85 p-4 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_30px_80px_-40px_rgba(0,0,0,0.9)] transition duration-200 group-hover:border-white/20 group-hover:bg-[#0c0f16]/95"
          style={{
            transform: `translateZ(26px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-200 group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 45%, rgba(255,255,255,0) 70%)`,
            }}
          />

          <div style={{ transform: "translateZ(36px)" }}>
            <div className="text-xs text-white/50">{title}</div>
            <div className="mt-1 text-sm font-medium text-white/85">{post.author}</div>
          </div>
          <div className="mt-2 text-xs leading-6 text-white/65" style={{ transform: "translateZ(20px)" }}>
            {preview || "（无文字）"}
          </div>

          {cover?.url ? (
            <div
              className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/30"
              style={{ transform: "translateZ(44px)" }}
            >
              {cover.kind === "IMAGE" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover.url} alt="" className="h-28 w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
              ) : cover.kind === "VIDEO" ? (
                <div className="flex h-28 items-center justify-center text-xs text-white/50">Video</div>
              ) : (
                <div className="flex h-28 items-center justify-center text-xs text-white/50">Audio</div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export function Timeline3D({ locale, posts }: { locale: string; posts: TimelinePost[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const orderedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) =>
        new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
    );
  }, [posts]);

  const visiblePosts = useMemo(() => {
    if (orderedPosts.length) return orderedPosts;
    return [
      {
        id: "__empty__",
        occurredAt: new Date().toISOString(),
        author: "MaJaNeo",
        content: "还没有记录。点击右上角 New 开始第一条。",
        media: [],
      } satisfies TimelinePost,
    ];
  }, [orderedPosts]);

  const postById = useMemo(() => {
    const map = new Map<string, TimelinePost>();
    for (const p of visiblePosts) map.set(p.id, p);
    return map;
  }, [visiblePosts]);

  const openPost = openId ? postById.get(openId) ?? null : null;

  useEffect(() => {
    if (!openPost) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openPost]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenId(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-white/70">Timeline</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">Neo</div>
        </div>
        <div className="text-xs text-white/40">{posts.length} posts</div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div
          className="relative h-[65vh] overflow-auto rounded-xl bg-black/20"
          style={{ perspective: "1100px" }}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#07080a]/70 px-4 py-3 backdrop-blur">
            <div className="text-xs text-white/50">
              每个点是一条 Post，点击打开
            </div>
            <div className="text-xs text-white/40">3D</div>
          </div>

          <div className="relative px-6 py-10">
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-white/0 via-white/25 to-white/0"
              style={{ transform: "translateX(-50%) translateZ(-40px)" }}
            />

            <div
              className="relative mx-auto w-full max-w-xl"
              style={{
                transform:
                  "rotateX(55deg) rotateZ(-12deg) translateZ(-40px)",
                transformStyle: "preserve-3d",
              }}
            >
              {visiblePosts.map((p, i) => {
                return (
                  <TimelinePointCard
                    key={p.id}
                    post={p}
                    index={i}
                    locale={locale}
                    onOpen={(id) => setOpenId(id)}
                  />
                );
                })}

              <div
                className="absolute left-1/2 top-0 h-[calc(92px*1)] w-px -translate-x-1/2 bg-white/20"
                style={{ transform: "translateZ(-10px)" }}
              />
            </div>

            <div style={{ height: visiblePosts.length * 92 + 220 }} />
          </div>
        </div>
      </div>

      {openPost ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpenId(null);
          }}
        >
          <div className="w-full max-w-2xl rounded-3xl border border-white/12 bg-[#0b0d12]/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_40px_120px_-60px_rgba(0,0,0,0.9)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-white/50">
                  {formatDateTime(locale, openPost.occurredAt)}
                </div>
                <div className="mt-1 text-base font-semibold text-white/90">
                  {openPost.author}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {openPost.media
                .filter((m) => m.url)
                .slice(0, 1)
                .map((m) => (
                  <div
                    key={m.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-black/30"
                  >
                    {m.kind === "IMAGE" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url ?? ""} alt="" className="w-full object-cover" />
                    ) : m.kind === "VIDEO" ? (
                      <video src={m.url ?? ""} controls className="w-full" />
                    ) : (
                      <div className="p-4">
                        <audio src={m.url ?? ""} controls className="w-full" />
                      </div>
                    )}
                  </div>
                ))}

              <div className="whitespace-pre-wrap text-sm leading-7 text-white/80">
                {openPost.content || "（无文字）"}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
