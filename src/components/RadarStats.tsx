"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type RadarDatum = {
  key: string;
  label: string;
  value: number;
  fullMark: number;
};

export function RadarStats({ data }: { data: RadarDatum[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.18)" />
          <PolarAngleAxis dataKey="label" stroke="rgba(255,255,255,0.6)" />
          <Radar
            dataKey="value"
            stroke="rgba(255,255,255,0.9)"
            fill="rgba(255,255,255,0.22)"
            fillOpacity={1}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
            }}
            labelStyle={{ color: "rgba(255,255,255,0.85)" }}
            itemStyle={{ color: "rgba(255,255,255,0.85)" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
