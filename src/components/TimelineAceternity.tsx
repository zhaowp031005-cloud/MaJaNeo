"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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

function pickFeatureMedia(post: TimelinePost) {
  const image = post.media.find((m) => m.kind === "IMAGE" && m.url);
  if (image?.url) return image;
  const video = post.media.find((m) => m.kind === "VIDEO" && m.url);
  if (video?.url) return video;
  const audio = post.media.find((m) => m.kind === "AUDIO" && m.url);
  if (audio?.url) return audio;
  return null;
}

function mediaLabel(kind: string) {
  if (kind === "VIDEO") return "typeVideo";
  if (kind === "AUDIO") return "typeAudio";
  return "typeImage";
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
  const t = useTranslations("timeline");
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
        author: t("emptyAuthor"),
        title: "",
        content: t("emptyContent"),
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
  const featureMedia = openPost ? pickFeatureMedia(openPost) : null;
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
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <div className="mj-eyebrow">{t("eyebrow")}</div>
          <div className="mj-title mt-3 text-4xl sm:text-5xl">{t("title")}</div>
          <p className="mt-3 text-sm leading-7 text-[var(--mj-text-muted)]">{t("description")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="mj-stat-chip rounded-full px-4 py-2 text-xs tracking-[0.18em]">
            {t("count", { count: posts.length })}
          </div>
        </div>
      </div>

      <div className="mj-shell mt-8 rounded-[2rem] p-4 sm:p-6">
        <div ref={scrollRef} className="relative h-[72vh] overflow-auto rounded-[1.5rem] border border-white/8 bg-[rgba(5,8,14,0.52)]">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[rgba(7,8,11,0.72)] px-5 py-4 backdrop-blur-xl">
            <div className="mj-kicker text-[10px]">{t("stickyTitle")}</div>
            <div className="text-xs tracking-[0.18em] text-[var(--mj-text-soft)]">{t("stickyYears")}</div>
          </div>

          <div
            className="relative w-full overflow-clip px-4 py-8 sm:px-8"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 sm:p-6 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpenId(null);
          }}
        >
          <CardContainer className="w-full max-w-4xl">
            <CardBody className="relative grid w-full gap-6 rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)),rgba(8,11,18,0.95)] p-5 shadow-[0_32px_90px_-40px_rgba(0,0,0,0.95)] sm:grid-cols-[1.05fr_0.95fr] sm:p-7">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardItem
                      as="div"
                      translateZ="28"
                      className="mj-eyebrow"
                    >
                      {formatDateTime(locale, openPost.occurredAt)}
                    </CardItem>
                    <CardItem
                      translateZ="48"
                      className="mj-title mt-3 text-3xl text-[var(--mj-text)] sm:text-4xl"
                    >
                      {openPost.title || openPost.author}
                    </CardItem>
                    <CardItem
                      as="div"
                      translateZ="36"
                      className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[var(--mj-text-soft)]"
                    >
                      {openPost.author}
                    </CardItem>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenId(null)}
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-sm text-[var(--mj-text-muted)] hover:bg-white/10 hover:text-[var(--mj-text)]"
                  >
                    {t("close")}
                  </button>
                </div>

                <CardItem
                  as="p"
                  translateZ="60"
                  className="mt-6 whitespace-pre-wrap text-sm leading-8 text-[var(--mj-text-muted)] sm:text-[15px]"
                >
                  {openPost.content || t("noText")}
                </CardItem>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="mj-panel rounded-2xl px-4 py-3">
                    <div className="mj-kicker text-[10px]">{t("mediaLabel")}</div>
                    <div className="mt-2 text-lg font-semibold text-[var(--mj-text)]">
                      {openPost.media.length}
                    </div>
                  </div>
                  <div className="mj-panel rounded-2xl px-4 py-3">
                    <div className="mj-kicker text-[10px]">{t("yearLabel")}</div>
                    <div className="mt-2 text-lg font-semibold text-[var(--mj-text)]">
                      {getYear(openPost.occurredAt)}
                    </div>
                  </div>
                  <div className="mj-panel rounded-2xl px-4 py-3">
                    <div className="mj-kicker text-[10px]">{t("typeLabel")}</div>
                    <div className="mt-2 text-lg font-semibold text-[var(--mj-text)]">
                      {featureMedia ? t(mediaLabel(featureMedia.kind)) : t("typeText")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="relative min-h-72 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.04)]">
                  {featureMedia?.kind === "IMAGE" && featureMedia.url ? (
                    <CardItem as="div" translateZ="90" className="relative h-full min-h-72 w-full">
                      <Image
                        src={featureMedia.url}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover"
                      />
                    </CardItem>
                  ) : featureMedia?.kind === "VIDEO" ? (
                    <CardItem
                      as="div"
                      translateZ="90"
                      className="flex h-full min-h-72 flex-col justify-between bg-[linear-gradient(135deg,rgba(145,185,255,0.16),rgba(216,182,122,0.1))] p-6"
                    >
                      <div className="mj-kicker text-[10px]">{t("featuredLabel")}</div>
                      <div className="mj-title text-4xl">{t("featuredVideoTitle")}</div>
                      <div className="text-sm text-[var(--mj-text-muted)]">
                        {t("featuredVideoDesc")}
                      </div>
                    </CardItem>
                  ) : featureMedia?.kind === "AUDIO" ? (
                    <CardItem
                      as="div"
                      translateZ="90"
                      className="flex h-full min-h-72 flex-col justify-between bg-[linear-gradient(135deg,rgba(216,182,122,0.14),rgba(255,255,255,0.02))] p-6"
                    >
                      <div className="mj-kicker text-[10px]">{t("featuredLabel")}</div>
                      <div className="mj-title text-4xl">{t("featuredAudioTitle")}</div>
                      <div className="text-sm text-[var(--mj-text-muted)]">
                        {t("featuredAudioDesc")}
                      </div>
                    </CardItem>
                  ) : (
                    <CardItem
                      as="div"
                      translateZ="90"
                      className="flex h-full min-h-72 flex-col justify-between bg-[radial-gradient(circle_at_top,rgba(145,185,255,0.18),transparent_42%),rgba(255,255,255,0.03)] p-6"
                    >
                      <div className="mj-kicker text-[10px]">{t("featuredLabel")}</div>
                      <div className="mj-title text-4xl">{t("featuredTextTitle")}</div>
                      <div className="text-sm text-[var(--mj-text-muted)]">
                        {t("featuredTextDesc")}
                      </div>
                    </CardItem>
                  )}
                </div>

                <div className="mj-panel rounded-[1.5rem] p-4">
                  <div className="mj-kicker text-[10px]">{t("detailTitle")}</div>
                  <div className="mt-3 space-y-2 text-sm text-[var(--mj-text-muted)]">
                    <div className="flex items-center justify-between gap-3">
                      <span>{t("detailAuthor")}</span>
                      <span className="text-[var(--mj-text)]">{openPost.author}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>{t("detailDate")}</span>
                      <span className="text-[var(--mj-text)]">{formatDateTime(locale, openPost.occurredAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>{t("detailAssets")}</span>
                      <span className="text-[var(--mj-text)]">{openPost.media.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-3">
                  {canDelete ? (
                    <CardItem
                      translateZ={20}
                      as="button"
                      disabled={isDeleting}
                      onClick={async () => {
                        if (isDeleting) return;
                        const ok = window.confirm(t("deleteConfirm"));
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
                                ? t("deleteDbError")
                                : t("deleteError");
                            window.alert(msg);
                            return;
                          }
                          setOpenId(null);
                          window.location.reload();
                        } finally {
                          setIsDeleting(false);
                        }
                      }}
                      className="rounded-full border border-red-400/25 bg-red-400/10 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-red-200 disabled:opacity-50"
                    >
                      {isDeleting ? t("deleting") : t("delete")}
                    </CardItem>
                  ) : (
                    <div />
                  )}
                  <CardItem
                    translateZ={20}
                    as="button"
                    onClick={() => setOpenId(null)}
                    className="mj-button-primary rounded-full px-5 py-2 text-xs font-semibold tracking-[0.16em]"
                  >
                    {t("done")}
                  </CardItem>
                </div>
              </div>
            </CardBody>
          </CardContainer>
        </div>
      ) : null}
    </div>
  );
}
