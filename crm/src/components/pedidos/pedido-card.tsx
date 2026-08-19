"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PedidoDetalheDialog } from "./pedido-detalhe-dialog";
import type { PedidoComRelacoes } from "./types";

export function PedidoCard({ pedido }: { pedido: PedidoComRelacoes }) {
  const [aberto, setAberto] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: pedido.id,
  });

  const valor = pedido.cotacao?.total ?? pedido.lead.valorEstimado;

  return (
    <>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={() => !isDragging && setAberto(true)}
        style={{ transform: CSS.Translate.toString(transform) }}
        className={cn(
          "cursor-grab rounded-md border border-border bg-card p-3 text-sm shadow-sm active:cursor-grabbing",
          "flex flex-col gap-1.5 touch-none select-none",
          isDragging && "opacity-50"
        )}
      >
        <p className="font-medium leading-tight">{pedido.lead.empresa}</p>
        <p className="text-xs text-muted-foreground">
          {pedido.cotacao ? pedido.cotacao.numero : "Sem cotação vinculada"}
        </p>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="font-medium">{formatBRL(valor)}</span>
          {pedido.fornecedor ? (
            <Badge variant="secondary" className="text-[10px]">
              {pedido.fornecedor}
            </Badge>
          ) : (
            <span className="text-muted-foreground">sem fornecedor</span>
          )}
        </div>
      </div>
      <PedidoDetalheDialog pedido={pedido} open={aberto} onOpenChange={setAberto} />
    </>
  );
}
