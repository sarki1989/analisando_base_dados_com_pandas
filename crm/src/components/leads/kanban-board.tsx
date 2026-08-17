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

import { moverStatusLead } from "@/app/actions/leads";
import { STATUS_LEAD, type StatusLead, type MotivoPerda } from "@/lib/enums";
import { KanbanColumn } from "./kanban-column";
import { MotivoPerdaDialog } from "./motivo-perda-dialog";
import type { LeadComRelacoes } from "./types";

export function KanbanBoard({ leads }: { leads: LeadComRelacoes[] }) {
  const [itens, setItens] = useState(leads);
  const [leadsAnteriores, setLeadsAnteriores] = useState(leads);
  const [pendente, setPendente] = useState<{ leadId: string; statusAnterior: StatusLead } | null>(null);

  // Ressincroniza o estado local quando o servidor manda uma lista nova de leads
  // (padrão recomendado pelo React para ajustar estado a partir de props, sem useEffect).
  if (leads !== leadsAnteriores) {
    setLeadsAnteriores(leads);
    setItens(leads);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  async function aplicarMudanca(leadId: string, novoStatus: StatusLead, motivoPerda?: MotivoPerda) {
    try {
      await moverStatusLead({ leadId, status: novoStatus, motivoPerda });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível mover o lead.");
      setItens((prev) => prev.map((l) => (l.id === leadId ? leads.find((o) => o.id === l.id) ?? l : l)));
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const novoStatus = String(over.id) as StatusLead;
    const lead = itens.find((l) => l.id === leadId);
    if (!lead || lead.status === novoStatus) return;

    const statusAnterior = lead.status as StatusLead;
    setItens((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: novoStatus } : l)));

    if (novoStatus === "Perdido") {
      setPendente({ leadId, statusAnterior });
      return;
    }

    aplicarMudanca(leadId, novoStatus);
  }

  function cancelarPerda() {
    if (!pendente) return;
    setItens((prev) =>
      prev.map((l) => (l.id === pendente.leadId ? { ...l, status: pendente.statusAnterior } : l))
    );
    setPendente(null);
  }

  function confirmarPerda(motivo: MotivoPerda) {
    if (!pendente) return;
    aplicarMudanca(pendente.leadId, "Perdido", motivo);
    setPendente(null);
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STATUS_LEAD.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={itens.filter((l) => l.status === status)}
            />
          ))}
        </div>
      </DndContext>

      <MotivoPerdaDialog
        open={pendente !== null}
        onCancelar={cancelarPerda}
        onConfirmar={confirmarPerda}
      />
    </>
  );
}
