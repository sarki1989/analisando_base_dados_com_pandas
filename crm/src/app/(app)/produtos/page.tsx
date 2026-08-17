import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { ProdutoDialog } from "@/components/produtos/produto-dialog";
import { ProdutosFiltro } from "@/components/produtos/produtos-filtro";

export const metadata = { title: "Produtos — CRM Stokes Brasil" };

export default async function ProdutosPage() {
  const produtos = await prisma.produto.findMany({ orderBy: [{ ativo: "desc" }, { categoria: "asc" }] });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo usado para montar cotações · {produtos.length} itens.
          </p>
        </div>
        <ProdutoDialog />
      </div>

      <Card>
        <CardContent className="pt-4">
          <ProdutosFiltro produtos={produtos} />
        </CardContent>
      </Card>
    </div>
  );
}
