"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { salvarProduto } from "@/app/actions/produtos";
import { CATEGORIAS_PRODUTO, DIAMETROS_SONDAGEM } from "@/lib/enums";
import type { Produto } from "@prisma/client";

export function ProdutoForm({ produto, onSucesso }: { produto?: Produto; onSucesso?: () => void }) {
  const [state, formAction, pending] = useActionState(salvarProduto, {});

  useEffect(() => {
    if (state.sucesso) {
      toast.success(produto ? "Produto atualizado." : "Produto criado.");
      onSucesso?.();
    }
    if (state.erro) toast.error(state.erro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {produto && <input type="hidden" name="produtoId" value={produto.id} />}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" name="sku" defaultValue={produto?.sku} required />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Input id="descricao" name="descricao" defaultValue={produto?.descricao} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="categoria">Categoria</Label>
        <Select name="categoria" defaultValue={produto?.categoria ?? CATEGORIAS_PRODUTO[0]}>
          <SelectTrigger id="categoria">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIAS_PRODUTO.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="diametro">Diâmetro</Label>
        <Select name="diametro" defaultValue={produto?.diametro ?? undefined}>
          <SelectTrigger id="diametro">
            <SelectValue placeholder="N/A" />
          </SelectTrigger>
          <SelectContent>
            {DIAMETROS_SONDAGEM.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="unidade">Unidade</Label>
        <Input id="unidade" name="unidade" defaultValue={produto?.unidade ?? "un"} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="custoFornecedor">Custo do fornecedor (R$)</Label>
        <Input
          id="custoFornecedor"
          name="custoFornecedor"
          type="number"
          step="0.01"
          defaultValue={produto?.custoFornecedor ?? ""}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="precoBase">Preço de venda (R$)</Label>
        <Input
          id="precoBase"
          name="precoBase"
          type="number"
          step="0.01"
          defaultValue={produto?.precoBase ?? ""}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : produto ? "Salvar alterações" : "Criar produto"}
        </Button>
      </div>
    </form>
  );
}
