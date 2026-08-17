"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "./item-row";
import { CONDICOES_FRETE } from "@/lib/enums";
import { calcularTotaisCotacao } from "@/lib/cotacao";
import { formatBRL } from "@/lib/format";
import type { CotacaoFormState } from "@/app/actions/cotacoes";
import type { ItemEditavel, ProdutoOpcao } from "./tipos";

type CotacaoExistente = {
  condicaoPagamento: string | null;
  prazoFabricacao: string | null;
  frete: string | null;
  observacoes: string | null;
  validadeDias: number;
  desconto: number;
  itens: {
    produtoId: string | null;
    descricaoLivre: string | null;
    quantidade: number;
    precoUnitario: number;
    desconto: number;
  }[];
};

export function CotacaoBuilder({
  leadId,
  produtos,
  action,
  validadeDiasPadrao,
  cotacao,
}: {
  leadId: string;
  produtos: ProdutoOpcao[];
  action: (prev: CotacaoFormState, formData: FormData) => Promise<CotacaoFormState>;
  validadeDiasPadrao: number;
  cotacao?: CotacaoExistente;
}) {
  const idBase = useId();
  const [state, formAction, pending] = useActionState(action, {});
  const [itens, setItens] = useState<ItemEditavel[]>(() =>
    cotacao && cotacao.itens.length > 0
      ? cotacao.itens.map((item, i) => ({
          chave: `${idBase}-${i}`,
          produtoId: item.produtoId ?? "",
          descricaoLivre: item.descricaoLivre ?? "",
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          desconto: item.desconto,
        }))
      : [novoItem(idBase, 0)]
  );
  const [descontoGeral, setDescontoGeral] = useState(cotacao?.desconto ?? 0);

  useEffect(() => {
    if (state.erro) toast.error(state.erro);
    else if (state.cotacaoId) toast.success("Cotação atualizada.");
  }, [state]);

  const { subtotal, total } = calcularTotaisCotacao(itens, descontoGeral);

  function adicionarItem() {
    setItens((prev) => [...prev, novoItem(idBase, prev.length)]);
  }

  function atualizarItem(chave: string, novo: ItemEditavel) {
    setItens((prev) => prev.map((i) => (i.chave === chave ? novo : i)));
  }

  function removerItem(chave: string) {
    setItens((prev) => (prev.length > 1 ? prev.filter((i) => i.chave !== chave) : prev));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="leadId" value={leadId} />
      <input
        type="hidden"
        name="itensJson"
        value={JSON.stringify(
          itens.map(({ produtoId, descricaoLivre, quantidade, precoUnitario, desconto }) => ({
            produtoId: produtoId || undefined,
            descricaoLivre: descricaoLivre || undefined,
            quantidade,
            precoUnitario,
            desconto,
          }))
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="hidden grid-cols-12 gap-2 px-0 text-xs font-medium text-muted-foreground sm:grid">
            <span className="col-span-4">Produto</span>
            <span className="col-span-2">Quantidade</span>
            <span className="col-span-2">Preço unitário</span>
            <span className="col-span-2">Desconto</span>
            <span className="col-span-1">Total</span>
          </div>
          {itens.map((item) => (
            <ItemRow
              key={item.chave}
              item={item}
              produtos={produtos}
              onChange={(novo) => atualizarItem(item.chave, novo)}
              onRemover={() => removerItem(item.chave)}
            />
          ))}
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={adicionarItem}>
            <Plus />
            Adicionar item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Condições</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="condicaoPagamento">Condição de pagamento</Label>
            <Input
              id="condicaoPagamento"
              name="condicaoPagamento"
              placeholder="ex: 50% entrada + 50% na entrega"
              defaultValue={cotacao?.condicaoPagamento ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prazoFabricacao">Prazo de fabricação</Label>
            <Input
              id="prazoFabricacao"
              name="prazoFabricacao"
              placeholder="ex: 10 dias úteis"
              defaultValue={cotacao?.prazoFabricacao ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="frete">Frete</Label>
            <Select name="frete" defaultValue={cotacao?.frete ?? undefined}>
              <SelectTrigger id="frete">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {CONDICOES_FRETE.map((f) => (
                  <SelectItem key={f} value={f} className="capitalize">
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="validadeDias">Validade (dias)</Label>
            <Input
              id="validadeDias"
              name="validadeDias"
              type="number"
              defaultValue={cotacao?.validadeDias ?? validadeDiasPadrao}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="desconto">Desconto geral (R$)</Label>
            <Input
              id="desconto"
              name="desconto"
              type="number"
              step="0.01"
              value={descontoGeral}
              onChange={(e) => setDescontoGeral(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" name="observacoes" defaultValue={cotacao?.observacoes ?? ""} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-md border border-border bg-secondary/40 px-4 py-3">
        <div className="text-sm text-muted-foreground">
          Subtotal: <span className="font-medium text-foreground">{formatBRL(subtotal)}</span>
          {descontoGeral > 0 && <span> · Desconto: {formatBRL(descontoGeral)}</span>}
        </div>
        <div className="text-lg font-semibold">{formatBRL(total)}</div>
      </div>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Salvando..." : cotacao ? "Salvar alterações" : "Criar cotação"}
      </Button>
    </form>
  );
}

function novoItem(idBase: string, indice: number): ItemEditavel {
  return {
    chave: `${idBase}-novo-${indice}-${Math.random().toString(36).slice(2, 8)}`,
    produtoId: "",
    descricaoLivre: "",
    quantidade: 1,
    precoUnitario: 0,
    desconto: 0,
  };
}
