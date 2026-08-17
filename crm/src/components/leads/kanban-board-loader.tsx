"use client";

import dynamic from "next/dynamic";
import type { LeadComRelacoes } from "./types";

// O dnd-kit gera ids internos (aria-describedby) por contador incremental,
// que diverge entre a renderização no servidor e a hidratação no cliente.
// Como o board só existe atrás de login e não precisa de SSR, ele é
// carregado só no cliente para evitar o mismatch de hidratação.
const KanbanBoard = dynamic(() => import("./kanban-board").then((m) => m.KanbanBoard), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-secondary/40" />,
});

export function KanbanBoardLoader({ leads }: { leads: LeadComRelacoes[] }) {
  return <KanbanBoard leads={leads} />;
}
