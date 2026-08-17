"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { COR_GRAFITE, COR_GRADE, COR_TEXTO_MUTED } from "./chart-colors";

export function LeadsPorCampanhaChart({ dados }: { dados: { campanha: string; leads: number }[] }) {
  if (dados.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Sem leads com origem registrada ainda.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={dados} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={COR_GRADE} horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: COR_TEXTO_MUTED }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="campanha"
          width={110}
          tick={{ fontSize: 11, fill: COR_TEXTO_MUTED }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip formatter={(v) => [String(v), "Leads"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Bar dataKey="leads" name="Leads" fill={COR_GRAFITE} radius={[0, 4, 4, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
