"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

import { COR_GRAFITE, COR_AMBAR, COR_GRADE, COR_TEXTO_MUTED } from "./chart-colors";

export function CotacoesPorMesChart({
  dados,
}: {
  dados: { mes: string; emitidas: number; ganhas: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={dados} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={COR_GRADE} vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: COR_TEXTO_MUTED }} axisLine={{ stroke: COR_GRADE }} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: COR_TEXTO_MUTED }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="emitidas" name="Emitidas" fill={COR_GRAFITE} radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="ganhas" name="Ganhas" fill={COR_AMBAR} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
