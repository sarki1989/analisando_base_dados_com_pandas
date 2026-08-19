"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { moverStatusPedido } from "@/app/actions/pedidos";
import { STATUS_PEDIDO, type StatusPedido } from "@/lib/enums";
import { KanbanColumn } from "./kanban-column";
import type { PedidoComRelacoes } from "./types";

export function KanbanBoard({ pedidos }: { pedidos: PedidoComRelacoes[] }) {
  const [itens, setItens] = useState(pedidos);
  const [pedidosAnteriores, setPedidosAnteriores] = useState(pedidos);

  if (pedidos !== pedidosAnteriores) {
    setPedidosAnteriores(pedidos);
    setItens(pedidos);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const pedidoId = String(active.id);
    const novoStatus = String(over.id) as StatusPedido;
    const pedido = itens.find((p) => p.id === pedidoId);
    if (!pedido || pedido.status === novoStatus) return;

    setItens((prev) => prev.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p)));

    moverStatusPedido({ pedidoId, status: novoStatus }).catch((e) => {
      toast.error(e instanceof Error ? e.message : "Não foi possível mover o pedido.");
      setItens((prev) => prev.map((p) => (p.id === pedidoId ? pedidos.find((o) => o.id === p.id) ?? p : p)));
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUS_PEDIDO.map((status) => (
          <KanbanColumn key={status} status={status} pedidos={itens.filter((p) => p.status === status)} />
        ))}
      </div>
    </DndContext>
  );
}
