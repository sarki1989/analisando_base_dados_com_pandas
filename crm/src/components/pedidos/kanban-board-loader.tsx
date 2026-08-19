"use client";

import dynamic from "next/dynamic";
import type { PedidoComRelacoes } from "./types";

// Mesmo motivo do Kanban de leads: ids internos do dnd-kit divergem entre
// SSR e hidratação, então o board só é montado no cliente.
const KanbanBoard = dynamic(() => import("./kanban-board").then((m) => m.KanbanBoard), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-secondary/40" />,
});

export function KanbanBoardLoader({ pedidos }: { pedidos: PedidoComRelacoes[] }) {
  return <KanbanBoard pedidos={pedidos} />;
}
