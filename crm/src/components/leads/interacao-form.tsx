"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registrarInteracao } from "@/app/actions/leads";
import { TIPOS_INTERACAO, DIRECOES_INTERACAO } from "@/lib/enums";

export function InteracaoForm({ leadId }: { leadId: string }) {
  const [state, formAction, pending] = useActionState(registrarInteracao, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.sucesso) {
      formRef.current?.reset();
      toast.success("Interação registrada.");
    }
    if (state.erro) toast.error(state.erro);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="leadId" value={leadId} />
      <div className="flex gap-2">
        <Select name="tipo" defaultValue="whatsapp">
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIPOS_INTERACAO.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select name="direcao" defaultValue="saída">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIRECOES_INTERACAO.map((d) => (
              <SelectItem key={d} value={d} className="capitalize">
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea name="resumo" placeholder="O que foi conversado?" required />
      <Button type="submit" disabled={pending} size="sm" className="self-start">
        {pending ? "Registrando..." : "Registrar interação"}
      </Button>
    </form>
  );
}
