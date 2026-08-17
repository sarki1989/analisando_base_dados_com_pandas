"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { criarTarefa } from "@/app/actions/tarefas";
import { PRIORIDADES_TAREFA } from "@/lib/enums";

type Usuario = { id: string; nome: string };

export function TarefaForm({
  leadId,
  usuarios,
  usuarioAtualId,
  onSucesso,
}: {
  leadId?: string;
  usuarios: Usuario[];
  usuarioAtualId: string;
  onSucesso?: () => void;
}) {
  const [state, formAction, pending] = useActionState(criarTarefa, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.sucesso) {
      formRef.current?.reset();
      toast.success("Tarefa criada.");
      onSucesso?.();
    }
    if (state.erro) toast.error(state.erro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      {leadId && <input type="hidden" name="leadId" value={leadId} />}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="titulo">Título</Label>
        <Input id="titulo" name="titulo" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" name="descricao" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vencimentoEm">Vencimento</Label>
          <Input id="vencimentoEm" name="vencimentoEm" type="datetime-local" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prioridade">Prioridade</Label>
          <Select name="prioridade" defaultValue="média">
            <SelectTrigger id="prioridade">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORIDADES_TAREFA.map((p) => (
                <SelectItem key={p} value={p} className="capitalize">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="responsavelId">Responsável</Label>
        <Select name="responsavelId" defaultValue={usuarioAtualId}>
          <SelectTrigger id="responsavelId">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {usuarios.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Criando..." : "Criar tarefa"}
      </Button>
    </form>
  );
}
