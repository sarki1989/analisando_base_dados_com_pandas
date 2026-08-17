"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { COR_GRAFITE, COR_GRADE, COR_TEXTO_MUTED } from "./chart-colors";

export function FunilChart({ dados }: { dados: { etapa: string; quantidade: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={dados} margin={{ top: 8, right: 8, left: -20, bottom: 24 }}>
        <CartesianGrid stroke={COR_GRADE} vertical={false} />
        <XAxis
          dataKey="etapa"
          tick={{ fontSize: 10, fill: COR_TEXTO_MUTED }}
          axisLine={{ stroke: COR_GRADE }}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: COR_TEXTO_MUTED }} axisLine={false} tickLine={false} width={28} />
        <Tooltip formatter={(v) => [String(v), "Leads"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Bar dataKey="quantidade" name="Leads" fill={COR_GRAFITE} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
