"use client";

import React, { createContext, useContext, useMemo, useRef, useState } from "react";

type Tilt = { rx: number; ry: number };

const CardTiltContext = createContext<Tilt>({ rx: 0, ry: 0 });

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toPx(value: number | string | undefined) {
  if (value === undefined) return undefined;
  if (typeof value === "number") return `${value}px`;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
  return trimmed;
}

export function CardContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState<Tilt>({ rx: 0, ry: 0 });

  const value = useMemo(() => tilt, [tilt]);

  return (
    <CardTiltContext.Provider value={value}>
      <div
        ref={ref}
        className={className}
        onMouseMove={(e) => {
          const el = ref.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;
          const py = (e.clientY - rect.top) / rect.height;
          const ry = clamp((px - 0.5) * 18, -10, 10);
          const rx = clamp((0.5 - py) * 14, -8, 8);
          setTilt({ rx, ry });
        }}
        onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
        style={{ perspective: "1200px" }}
      >
        {children}
      </div>
    </CardTiltContext.Provider>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const tilt = useContext(CardTiltContext);

  return (
    <div
      className={className}
      style={{
        transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 160ms ease",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

export function CardItem({
  as,
  translateZ,
  style,
  ...props
}: {
  as?: React.ElementType;
  translateZ?: number | string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  const Comp = as ?? "div";
  const z = toPx(translateZ) ?? "0px";

  return (
    <Comp
      {...props}
      style={{
        ...(style ?? {}),
        transform: `translateZ(${z})`,
        transformStyle: "preserve-3d",
      }}
    />
  );
}
