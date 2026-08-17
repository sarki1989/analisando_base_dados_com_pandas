"use client";

import { useDroppable } from "@dnd-kit/core";

import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { LeadCard } from "./lead-card";
import type { LeadComRelacoes } from "./types";

export function KanbanColumn({
  status,
  leads,
}: {
  status: string;
  leads: LeadComRelacoes[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const total = leads.reduce((acc, l) => acc + (l.valorEstimado ?? 0), 0);

  return (
    <div className="flex w-64 shrink-0 flex-col rounded-lg bg-secondary/40">
      <div className="flex items-center justify-between px-3 py-2">
        <div>
          <p className="text-sm font-semibold">{status}</p>
          <p className="text-xs text-muted-foreground">
            {leads.length} · {formatBRL(total)}
          </p>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto p-2 pt-0 transition-colors",
          isOver && "bg-accent/10"
        )}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}
