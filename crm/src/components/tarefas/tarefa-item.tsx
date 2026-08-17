"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { concluirTarefa, excluirTarefa } from "@/app/actions/tarefas";
import { formatDataHora } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TarefaComRelacoes = {
  id: string;
  titulo: string;
  descricao: string | null;
  vencimentoEm: Date;
  concluidaEm: Date | null;
  prioridade: string;
  responsavel: { nome: string };
  lead: { id: string; empresa: string } | null;
};

export function TarefaItem({ tarefa, mostrarLead = true }: { tarefa: TarefaComRelacoes; mostrarLead?: boolean }) {
  const [pending, startTransition] = useTransition();
  const concluida = !!tarefa.concluidaEm;
  const atrasada = !concluida && new Date(tarefa.vencimentoEm) < new Date();

  return (
    <div className="flex items-start gap-3 rounded-md border border-border p-3">
      <Checkbox
        checked={concluida}
        disabled={pending}
        onCheckedChange={(v) => startTransition(() => concluirTarefa(tarefa.id, v === true))}
        className="mt-0.5"
      />
      <div className="flex-1">
        <p className={cn("text-sm font-medium", concluida && "text-muted-foreground line-through")}>
          {tarefa.titulo}
        </p>
        {tarefa.descricao && <p className="text-xs text-muted-foreground">{tarefa.descricao}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className={cn(atrasada && "font-medium text-destructive")}>
            {formatDataHora(tarefa.vencimentoEm)}
          </span>
          <Badge variant="outline" className="capitalize">
            {tarefa.prioridade}
          </Badge>
          <span>{tarefa.responsavel.nome}</span>
          {mostrarLead && tarefa.lead && (
            <Link href={`/leads/${tarefa.lead.id}`} className="text-accent hover:underline">
              {tarefa.lead.empresa}
            </Link>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        disabled={pending}
        onClick={() => startTransition(() => excluirTarefa(tarefa.id))}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
