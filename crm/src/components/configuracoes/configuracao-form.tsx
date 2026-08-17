"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { salvarConfiguracao, type SalvarConfiguracaoState } from "@/app/actions/configuracao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ConfiguracaoEmpresa } from "@prisma/client";

const estadoInicial: SalvarConfiguracaoState = {};

export function ConfiguracaoForm({
  config,
  podeEditar,
}: {
  config: ConfiguracaoEmpresa;
  podeEditar: boolean;
}) {
  const [state, formAction, pending] = useActionState(salvarConfiguracao, estadoInicial);

  useEffect(() => {
    if (state.sucesso) toast.success("Configurações salvas.");
    if (state.erro) toast.error(state.erro);
  }, [state]);

  return (
    <form action={formAction} className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
      <Campo label="Nome fantasia" name="nomeFantasia" defaultValue={config.nomeFantasia} disabled={!podeEditar} />
      <Campo label="Razão social" name="razaoSocial" defaultValue={config.razaoSocial} disabled={!podeEditar} />
      <Campo label="CNPJ" name="cnpj" defaultValue={config.cnpj} disabled={!podeEditar} />
      <Campo
        label="Inscrição estadual"
        name="inscricaoEstadual"
        defaultValue={config.inscricaoEstadual ?? ""}
        disabled={!podeEditar}
      />
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="endereco">Endereço</Label>
        <Textarea id="endereco" name="endereco" defaultValue={config.endereco} disabled={!podeEditar} />
      </div>
      <Campo label="Telefone / WhatsApp (exibição)" name="telefone" defaultValue={config.telefone} disabled={!podeEditar} />
      <Campo
        label="Número do WhatsApp (E.164, sem +)"
        name="whatsappNumero"
        defaultValue={config.whatsappNumero}
        disabled={!podeEditar}
      />
      <Campo label="E-mail" name="email" defaultValue={config.email ?? ""} disabled={!podeEditar} />
      <Campo label="Site" name="site" defaultValue={config.site ?? ""} disabled={!podeEditar} />
      <Campo label="Banco" name="banco" defaultValue={config.banco ?? ""} disabled={!podeEditar} />
      <Campo label="Agência" name="agencia" defaultValue={config.agencia ?? ""} disabled={!podeEditar} />
      <Campo label="Conta" name="conta" defaultValue={config.conta ?? ""} disabled={!podeEditar} />
      <Campo label="Chave PIX" name="pixChave" defaultValue={config.pixChave ?? ""} disabled={!podeEditar} />
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="rodapePdf">Rodapé padrão do PDF de cotação</Label>
        <Textarea id="rodapePdf" name="rodapePdf" defaultValue={config.rodapePdf ?? ""} disabled={!podeEditar} />
      </div>

      {podeEditar && (
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      )}
    </form>
  );
}

function Campo({
  label,
  name,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue: string;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} disabled={disabled} />
    </div>
  );
}
