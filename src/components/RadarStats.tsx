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
          <PolarGrid stroke="rgba(255,255,255,0.11)" />
          <PolarAngleAxis dataKey="label" stroke="rgba(244,237,226,0.58)" tick={{ fontSize: 12 }} />
          <Radar
            dataKey="value"
            stroke="rgba(216,182,122,0.95)"
            fill="rgba(145,185,255,0.22)"
            fillOpacity={1}
            dot={{ r: 3, fill: "rgba(241,211,157,0.96)", strokeWidth: 0 }}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(10,14,22,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              boxShadow: "0 18px 42px -22px rgba(0,0,0,0.9)",
            }}
            labelStyle={{ color: "rgba(244,237,226,0.72)" }}
            itemStyle={{ color: "rgba(244,237,226,0.96)" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
