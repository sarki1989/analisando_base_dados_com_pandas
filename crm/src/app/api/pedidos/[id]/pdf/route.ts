import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PedidoPdfDocument } from "@/lib/pdf/pedido-pdf";

export const runtime = "nodejs";

export async function GET(_request: Request, props: RouteContext<"/api/pedidos/[id]/pdf">) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await props.params;

  const [pedido, config] = await Promise.all([
    prisma.pedido.findUnique({
      where: { id },
      include: {
        cotacao: { include: { itens: { include: { produto: true }, orderBy: { ordem: "asc" } } } },
      },
    }),
    prisma.configuracaoEmpresa.findUniqueOrThrow({ where: { id: "default" } }),
  ]);

  if (!pedido) notFound();

  if (!pedido.fornecedor) {
    return NextResponse.json(
      { erro: "Informe o fornecedor no pedido antes de gerar o documento de compra." },
      { status: 400 }
    );
  }

  if (!pedido.cotacao || pedido.cotacao.itens.length === 0) {
    return NextResponse.json(
      { erro: "Este pedido não tem uma cotação com itens vinculada — sem itens, não há o que pedir ao fornecedor." },
      { status: 400 }
    );
  }

  const buffer = await renderToBuffer(
    PedidoPdfDocument({
      pedido: {
        fornecedor: pedido.fornecedor,
        numeroPedidoFornecedor: pedido.numeroPedidoFornecedor,
        observacoes: pedido.observacoes,
        criadoEm: pedido.criadoEm,
      },
      cotacaoNumero: pedido.cotacao.numero,
      itens: pedido.cotacao.itens.map((item) => ({
        sku: item.produto?.sku ?? null,
        descricao: item.produto ? item.produto.descricao : item.descricaoLivre || "Item",
        quantidade: item.quantidade,
        unidade: item.produto?.unidade || "un",
        custoUnitario: item.produto?.custoFornecedor ?? null,
      })),
      empresa: config,
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="pedido-compra-${pedido.cotacao.numero}.pdf"`,
    },
  });
}
