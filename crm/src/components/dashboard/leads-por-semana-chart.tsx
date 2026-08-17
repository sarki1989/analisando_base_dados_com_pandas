"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { COR_AMBAR, COR_GRADE, COR_TEXTO_MUTED } from "./chart-colors";

export function LeadsPorSemanaChart({ dados }: { dados: { semana: string; leads: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={dados} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={COR_GRADE} vertical={false} />
        <XAxis dataKey="semana" tick={{ fontSize: 11, fill: COR_TEXTO_MUTED }} axisLine={{ stroke: COR_GRADE }} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: COR_TEXTO_MUTED }} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          formatter={(v) => [String(v), "Leads"]}
          labelFormatter={(l) => `Semana de ${l}`}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Line type="monotone" dataKey="leads" name="Leads" stroke={COR_AMBAR} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
