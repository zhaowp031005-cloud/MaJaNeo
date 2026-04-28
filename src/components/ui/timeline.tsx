"use client";

import React, { useMemo } from "react";

export type TimelineEntry = {
  title: string;
  content?: React.ReactNode;
};

export function Timeline({
  data,
  onSelect,
  className,
}: {
  data: TimelineEntry[];
  onSelect?: (index: number) => void;
  className?: string;
}) {
  const normalized = useMemo(() => {
    return data.map((item, i) => {
      const prevTitle = i > 0 ? data[i - 1]?.title : null;
      const showTitle = prevTitle !== item.title;
      return { ...item, _showTitle: showTitle };
    });
  }, [data]);

  return (
    <div className={className}>
      <div className="relative">
        <div
          className="pointer-events-none absolute left-[124px] top-0 h-full w-px bg-white/12"
          style={{ transform: "translateX(-50%)" }}
        />
        <div
          className="pointer-events-none absolute left-[124px] top-0 w-px"
          style={{
            transform: "translateX(-50%)",
            height: "var(--mj-line-progress, 0%)",
            background:
              "linear-gradient(to bottom, rgba(216,182,122,0) 0%, rgba(216,182,122,0.88) 40%, rgba(145,185,255,0.92) 100%)",
            boxShadow: "0 0 20px rgba(145,185,255,0.4)",
          }}
        />

        <div className="space-y-10">
          {normalized.map((item, index) => (
            <div key={`${item.title}-${index}`} className="relative">
              <div className="grid grid-cols-[92px_32px_1fr] items-start gap-4">
                <div className="shrink-0 text-right text-sm font-semibold tracking-[0.16em] text-[var(--mj-text-soft)]">
                  {item._showTitle ? item.title : null}
                </div>

                <button
                  type="button"
                  onClick={() => onSelect?.(index)}
                  className="group relative mt-0.5 h-8 w-8"
                  style={{ justifySelf: "center" }}
                >
                  <div className="relative h-8 w-8">
                    <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(241,211,157,0.75)] bg-[rgba(216,182,122,0.28)] shadow-[0_0_0_6px_rgba(216,182,122,0.08),0_0_38px_rgba(145,185,255,0.24)] transition group-hover:scale-110 group-hover:bg-[rgba(241,211,157,0.5)]" />
                    <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(145,185,255,0.12)] blur-xl" />
                  </div>
                </button>

                {item.content ? <div>{item.content}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
