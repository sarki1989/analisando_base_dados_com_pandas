"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { moverStatusLead } from "@/app/actions/leads";
import { STATUS_LEAD, type StatusLead, type MotivoPerda } from "@/lib/enums";
import { MotivoPerdaDialog } from "./motivo-perda-dialog";

export function StatusChanger({ leadId, statusAtual }: { leadId: string; statusAtual: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pedirMotivo, setPedirMotivo] = useState(false);

  function mudar(status: StatusLead, motivoPerda?: MotivoPerda) {
    startTransition(async () => {
      try {
        await moverStatusLead({ leadId, status, motivoPerda });
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Não foi possível mudar o status.");
      }
    });
  }

  return (
    <>
      <Select
        value={statusAtual}
        disabled={pending}
        onValueChange={(v) => {
          if (v === "Perdido") setPedirMotivo(true);
          else mudar(v as StatusLead);
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_LEAD.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <MotivoPerdaDialog
        open={pedirMotivo}
        onCancelar={() => setPedirMotivo(false)}
        onConfirmar={(motivo) => {
          setPedirMotivo(false);
          mudar("Perdido", motivo);
        }}
      />
    </>
  );
}
