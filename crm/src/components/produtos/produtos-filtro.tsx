"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBRL } from "@/lib/format";
import { ProdutoDialog } from "./produto-dialog";
import { ProdutoRowActions } from "./produto-row-actions";
import type { Produto } from "@prisma/client";

export function ProdutosFiltro({ produtos }: { produtos: Produto[] }) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return produtos;
    return produtos.filter((p) =>
      [p.sku, p.descricao, p.categoria, p.diametro ?? ""].some((campo) =>
        campo.toLowerCase().includes(termo)
      )
    );
  }, [produtos, busca]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por SKU, descrição, categoria ou Ø..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-8"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Ø</TableHead>
            <TableHead>Unid.</TableHead>
            <TableHead>Custo</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtrados.map((p) => (
            <TableRow key={p.id} className={!p.ativo ? "opacity-50" : undefined}>
              <TableCell className="font-mono text-xs">{p.sku}</TableCell>
              <TableCell>{p.descricao}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {p.categoria}
                </Badge>
              </TableCell>
              <TableCell>{p.diametro || "—"}</TableCell>
              <TableCell>{p.unidade}</TableCell>
              <TableCell>{formatBRL(p.custoFornecedor)}</TableCell>
              <TableCell className="font-medium">{formatBRL(p.precoBase)}</TableCell>
              <TableCell>
                <ProdutoRowActions produto={p} />
              </TableCell>
              <TableCell>
                <ProdutoDialog produto={p} />
              </TableCell>
            </TableRow>
          ))}
          {filtrados.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                Nenhum produto encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
