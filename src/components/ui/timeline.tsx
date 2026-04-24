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
              "linear-gradient(to bottom, rgba(168,85,247,0) 0%, rgba(168,85,247,0.85) 45%, rgba(59,130,246,0.85) 100%)",
            boxShadow: "0 0 18px rgba(168,85,247,0.45)",
          }}
        />

        <div className="space-y-10">
          {normalized.map((item, index) => (
            <div key={`${item.title}-${index}`} className="relative">
              <div className="grid grid-cols-[92px_32px_1fr] items-start gap-4">
                <div className="shrink-0 text-right text-sm font-semibold text-white/70">
                  {item._showTitle ? item.title : null}
                </div>

                <button
                  type="button"
                  onClick={() => onSelect?.(index)}
                  className="group relative mt-0.5 h-8 w-8"
                  style={{ justifySelf: "center" }}
                >
                  <div className="relative h-8 w-8">
                    <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/20 shadow-[0_0_0_6px_rgba(255,255,255,0.05),0_0_40px_rgba(255,255,255,0.12)] transition group-hover:bg-white/35" />
                    <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-xl" />
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
