"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { salvarConfiguracao, type SalvarConfiguracaoState } from "@/app/actions/configuracao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { calcularFatorPreco } from "@/lib/cotacao";
import { RecalcularPrecosButton } from "./recalcular-precos-button";
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
  const [percentuais, setPercentuais] = useState({
    impostoPercent: config.impostoPercent,
    margemPercent: config.margemPercent,
    despesasPercent: config.despesasPercent,
  });

  const fator = useMemo(() => {
    try {
      return calcularFatorPreco(percentuais);
    } catch {
      return null;
    }
  }, [percentuais]);

  useEffect(() => {
    if (state.sucesso) toast.success("Configurações salvas.");
    if (state.erro) toast.error(state.erro);
  }, [state]);

  function atualizarPercentual(campo: keyof typeof percentuais, valor: string) {
    setPercentuais((prev) => ({ ...prev, [campo]: Number(valor) || 0 }));
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-6">
        <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>

        <Card className="max-w-2xl bg-secondary/40">
          <CardHeader>
            <CardTitle className="text-base">Calculadora de preço</CardTitle>
            <CardDescription>
              Preço de venda = custo do fornecedor × fator. Fator = 1 / (1 − soma dos percentuais).
              Salve as alterações antes de recalcular o catálogo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Campo
                label="Imposto (%)"
                name="impostoPercent"
                type="number"
                step="0.01"
                defaultValue={config.impostoPercent}
                disabled={!podeEditar}
                onChange={(v) => atualizarPercentual("impostoPercent", v)}
              />
              <Campo
                label="Margem (%)"
                name="margemPercent"
                type="number"
                step="0.01"
                defaultValue={config.margemPercent}
                disabled={!podeEditar}
                onChange={(v) => atualizarPercentual("margemPercent", v)}
              />
              <Campo
                label="Despesas fixas (%)"
                name="despesasPercent"
                type="number"
                step="0.01"
                defaultValue={config.despesasPercent}
                disabled={!podeEditar}
                onChange={(v) => atualizarPercentual("despesasPercent", v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Fator resultante</p>
                <p className="text-lg font-semibold">{fator ? fator.toFixed(4) : "inválido"}</p>
              </div>
              {podeEditar && <RecalcularPrecosButton />}
            </div>
            <Campo
              label="Validade padrão da cotação (dias)"
              name="validadeDiasPadrao"
              type="number"
              defaultValue={config.validadeDiasPadrao}
              disabled={!podeEditar}
            />
          </CardContent>
        </Card>

        {podeEditar && (
          <div>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

function Campo({
  label,
  name,
  defaultValue,
  disabled,
  type = "text",
  step,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  disabled: boolean;
  type?: string;
  step?: string;
  onChange?: (valor: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </div>
  );
}
