"use client";

import { Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatBRL } from "@/lib/format";
import { calcularTotalItem } from "@/lib/cotacao";
import { cn } from "@/lib/utils";
import type { ItemEditavel, ProdutoOpcao } from "./tipos";

export function ItemRow({
  item,
  index,
  produtos,
  onChange,
  onRemover,
}: {
  item: ItemEditavel;
  index: number;
  produtos: ProdutoOpcao[];
  onChange: (item: ItemEditavel) => void;
  onRemover: () => void;
}) {
  const total = calcularTotalItem(item);

  function selecionarProduto(produtoId: string) {
    if (produtoId === "__livre__") {
      onChange({ ...item, produtoId: "" });
      return;
    }
    const produto = produtos.find((p) => p.id === produtoId);
    onChange({
      ...item,
      produtoId,
      descricaoLivre: "",
      precoUnitario: produto?.precoBase ?? item.precoUnitario,
    });
  }

  return (
    <div
      className={cn(
        "grid grid-cols-12 items-start gap-2 rounded-md px-2 py-2",
        index % 2 === 1 && "bg-secondary/40"
      )}
    >
      <div className="col-span-12 flex flex-col gap-1 sm:col-span-4">
        <Select value={item.produtoId || "__livre__"} onValueChange={selecionarProduto}>
          <SelectTrigger>
            <SelectValue placeholder="Produto do catálogo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__livre__">Descrição livre (sob encomenda)</SelectItem>
            {produtos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.sku} — {p.descricao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!item.produtoId && (
          <Input
            placeholder="Descreva o item"
            value={item.descricaoLivre}
            onChange={(e) => onChange({ ...item, descricaoLivre: e.target.value })}
          />
        )}
      </div>
      <div className="col-span-4 sm:col-span-2">
        <Input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Qtd."
          value={item.quantidade}
          onChange={(e) => onChange({ ...item, quantidade: Number(e.target.value) || 0 })}
        />
      </div>
      <div className="col-span-4 sm:col-span-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="Preço un."
          value={item.precoUnitario}
          onChange={(e) => onChange({ ...item, precoUnitario: Number(e.target.value) || 0 })}
        />
      </div>
      <div className="col-span-4 sm:col-span-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="Desconto"
          value={item.desconto}
          onChange={(e) => onChange({ ...item, desconto: Number(e.target.value) || 0 })}
        />
      </div>
      <div className="col-span-10 flex items-center text-sm font-medium sm:col-span-1">{formatBRL(total)}</div>
      <div className="col-span-2 flex justify-end sm:col-span-1">
        <Button type="button" variant="ghost" size="icon" onClick={onRemover}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
