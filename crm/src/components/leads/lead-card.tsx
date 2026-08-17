"use client";

import { useRouter } from "next/navigation";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { Badge } from "@/components/ui/badge";
import { formatBRL, diasDesde } from "@/lib/format";
import { paraArrayJSON } from "@/lib/json-array";
import { cn } from "@/lib/utils";
import type { LeadComRelacoes } from "./types";

const ETAPAS_COM_ALERTA = new Set(["Cotação enviada", "Em negociação"]);

export function LeadCard({ lead }: { lead: LeadComRelacoes }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const produtos = paraArrayJSON(lead.produtoInteresse);
  const diasParado = diasDesde(lead.ultimoContatoEm ?? lead.atualizadoEm);
  const emAlerta =
    ETAPAS_COM_ALERTA.has(lead.status) && diasParado !== null && diasParado > 3;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => !isDragging && router.push(`/leads/${lead.id}`)}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "cursor-grab rounded-md border border-border bg-card p-3 text-sm shadow-sm active:cursor-grabbing",
        "flex flex-col gap-1.5 touch-none select-none",
        emAlerta && "border-l-4 border-l-destructive",
        isDragging && "opacity-50"
      )}
    >
      <p className="font-medium leading-tight">{lead.empresa}</p>
      <p className="text-xs text-muted-foreground">{lead.nome}</p>
      {produtos.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {produtos.slice(0, 3).map((p) => (
            <Badge key={p} variant="secondary" className="text-[10px]">
              {p}
            </Badge>
          ))}
        </div>
      )}
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="font-medium">{formatBRL(lead.valorEstimado)}</span>
        {diasParado !== null && (
          <span className={cn("text-muted-foreground", emAlerta && "font-medium text-destructive")}>
            {diasParado === 0 ? "hoje" : `${diasParado}d parado`}
          </span>
        )}
      </div>
    </div>
  );
}
