"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mudarStatusCotacao } from "@/app/actions/cotacoes";
import { STATUS_COTACAO, type StatusCotacao, type MotivoPerda } from "@/lib/enums";
import { MotivoPerdaDialog } from "@/components/leads/motivo-perda-dialog";

export function CotacaoStatusChanger({ cotacaoId, statusAtual }: { cotacaoId: string; statusAtual: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pedirMotivo, setPedirMotivo] = useState(false);

  function mudar(status: StatusCotacao, motivoPerda?: MotivoPerda) {
    startTransition(async () => {
      try {
        await mudarStatusCotacao({ cotacaoId, status, motivoPerda });
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
          if (v === "perdida") setPedirMotivo(true);
          else mudar(v as StatusCotacao);
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_COTACAO.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">
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
          mudar("perdida", motivo);
        }}
      />
    </>
  );
}
