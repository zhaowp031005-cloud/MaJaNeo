"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";
import type { TimelinePost } from "@/components/Timeline3D";

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

function getYear(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "----";
  return String(d.getFullYear());
}

function pickCoverUrl(post: TimelinePost) {
  const image = post.media.find((m) => m.kind === "IMAGE" && m.url);
  if (image?.url) return image.url;
  const video = post.media.find((m) => m.kind === "VIDEO" && m.url);
  if (video?.url) return video.url;
  const audio = post.media.find((m) => m.kind === "AUDIO" && m.url);
  if (audio?.url) return audio.url;
  return null;
}

export function TimelineAceternity({
  locale,
  posts,
  enableDelete,
}: {
  locale: string;
  posts: TimelinePost[];
  enableDelete?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [lineProgress, setLineProgress] = useState<string>("0%");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const timelineData: TimelineEntry[] = useMemo(() => {
    return visiblePosts.map((p) => ({ title: getYear(p.occurredAt) }));
  }, [visiblePosts]);

  const postById = useMemo(() => {
    const map = new Map<string, TimelinePost>();
    for (const p of visiblePosts) map.set(p.id, p);
    return map;
  }, [visiblePosts]);

  const orderedIds = useMemo(() => visiblePosts.map((p) => p.id), [visiblePosts]);

  const openPost = openId ? postById.get(openId) ?? null : null;
  const openCover = openPost ? pickCoverUrl(openPost) : null;
  const canDelete = enableDelete !== false;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    function update() {
      raf = 0;
      const node = scrollRef.current;
      if (!node) return;
      const max = node.scrollHeight - node.clientHeight;
      const p = max <= 0 ? 1 : node.scrollTop / max;
      const pct = `${Math.round(p * 1000) / 10}%`;
      setLineProgress(pct);
    }
    function onScroll() {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    }
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

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
        <div ref={scrollRef} className="relative h-[70vh] overflow-auto rounded-xl bg-black/20">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#07080a]/70 px-4 py-3 backdrop-blur">
            <div className="text-xs text-white/50">Timeline</div>
            <div className="text-xs text-white/40">Years</div>
          </div>

          <div
            className="relative w-full overflow-clip px-4 py-6"
            style={{ ["--mj-line-progress" as string]: lineProgress }}
          >
            <Timeline
              data={timelineData}
              onSelect={(index) => {
                const id = orderedIds[index];
                if (id) setOpenId(id);
              }}
              className="relative w-full"
            />
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
          <CardContainer className="w-full max-w-2xl">
            <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-3xl p-6 border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-neutral-600 dark:text-white"
                  >
                    {openPost.author}
                  </CardItem>
                  <CardItem
                    as="div"
                    translateZ="40"
                    className="mt-1 text-xs text-neutral-500 dark:text-neutral-300"
                  >
                    {formatDateTime(locale, openPost.occurredAt)}
                  </CardItem>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  className="rounded-full border border-black/[0.1] bg-white/80 px-3 py-1.5 text-sm text-neutral-700 hover:bg-white dark:border-white/[0.15] dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
                >
                  Close
                </button>
              </div>

              <CardItem
                as="p"
                translateZ="60"
                className="mt-3 whitespace-pre-wrap text-neutral-600 text-sm leading-7 dark:text-neutral-300"
              >
                {openPost.content || "（无文字）"}
              </CardItem>

              {openCover ? (
                <CardItem translateZ="100" className="w-full mt-4">
                  <img
                    src={openCover}
                    height="1000"
                    width="1000"
                    className="h-60 w-full object-cover rounded-2xl group-hover/card:shadow-xl"
                    alt=""
                  />
                </CardItem>
              ) : null}

              <div className="flex justify-between items-center mt-6 gap-3">
                {canDelete ? (
                  <CardItem
                    translateZ={20}
                    as="button"
                    disabled={isDeleting}
                    onClick={async () => {
                      if (isDeleting) return;
                      const ok = window.confirm("确定要删除这条记录吗？删除后不可恢复。");
                      if (!ok) return;
                      setIsDeleting(true);
                      try {
                        const res = await fetch(`/api/posts?id=${encodeURIComponent(openPost.id)}`, {
                          method: "DELETE",
                        });
                        if (!res.ok) {
                          const payload = (await res.json().catch(() => null)) as
                            | { error?: string }
                            | null;
                          const msg =
                            payload?.error === "db_unavailable"
                              ? "数据库暂不可用，稍后再试。"
                              : "删除失败，请稍后再试。";
                          window.alert(msg);
                          return;
                        }
                        setOpenId(null);
                        window.location.reload();
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 text-xs font-bold hover:bg-red-500/15 disabled:opacity-50 dark:text-red-300"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </CardItem>
                ) : (
                  <div />
                )}
                <CardItem
                  translateZ={20}
                  as="button"
                  onClick={() => setOpenId(null)}
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
                >
                  Done
                </CardItem>
              </div>
            </CardBody>
          </CardContainer>
        </div>
      ) : null}
    </div>
  );
}
