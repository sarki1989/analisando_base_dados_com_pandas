"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "./tag-input";
import { SETORES_LEAD, UFS_BRASIL } from "@/lib/enums";
import { paraArrayJSON } from "@/lib/json-array";
import type { FormState } from "@/app/actions/leads";
import type { LeadComRelacoes } from "./types";

type Usuario = { id: string; nome: string };

export function LeadForm({
  action,
  usuarios,
  lead,
  onSucesso,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  usuarios: Usuario[];
  lead?: LeadComRelacoes;
  onSucesso?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);

  useEffect(() => {
    if (state.sucesso) {
      toast.success(lead ? "Lead atualizado." : "Lead criado.");
      onSucesso?.();
    }
    if (state.erro) toast.error(state.erro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Campo label="Nome do contato" name="nome" defaultValue={lead?.nome} required />
      <Campo label="Empresa" name="empresa" defaultValue={lead?.empresa} required />
      <Campo label="CNPJ" name="cnpj" defaultValue={lead?.cnpj ?? ""} />
      <Campo label="Telefone (WhatsApp)" name="telefone" defaultValue={lead?.telefone} placeholder="+5511999999999" required />
      <Campo label="E-mail" name="email" type="email" defaultValue={lead?.email ?? ""} />
      <Campo label="Cidade" name="cidade" defaultValue={lead?.cidade ?? ""} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="uf">UF</Label>
        <Select name="uf" defaultValue={lead?.uf ?? undefined}>
          <SelectTrigger id="uf">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {UFS_BRASIL.map((uf) => (
              <SelectItem key={uf} value={uf}>
                {uf}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="setor">Setor</Label>
        <Select name="setor" defaultValue={lead?.setor ?? SETORES_LEAD[0]}>
          <SelectTrigger id="setor">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SETORES_LEAD.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Campo
        label="Valor estimado (R$)"
        name="valorEstimado"
        type="number"
        step="0.01"
        defaultValue={lead?.valorEstimado ?? ""}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="responsavelId">Responsável</Label>
        <Select name="responsavelId" defaultValue={lead?.responsavelId ?? undefined}>
          <SelectTrigger id="responsavelId">
            <SelectValue placeholder="Selecione" />
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

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label>Produtos de interesse</Label>
        <TagInput
          name="produtoInteresse"
          defaultValue={paraArrayJSON(lead?.produtoInteresse)}
          placeholder="ex: coroa HQ, barrilete NQ — Enter para adicionar"
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" defaultValue={lead?.observacoes ?? ""} />
      </div>

      <div className="flex items-center gap-2 sm:col-span-2">
        <Checkbox id="consentimentoLgpd" name="consentimentoLgpd" defaultChecked={lead?.consentimentoLgpd} />
        <Label htmlFor="consentimentoLgpd" className="font-normal">
          Cliente consentiu com o uso dos dados para contato comercial (LGPD)
        </Label>
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : lead ? "Salvar alterações" : "Criar lead"}
        </Button>
      </div>
    </form>
  );
}

function Campo({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  step?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        step={step}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        required={required}
      />
    </div>
  );
}
