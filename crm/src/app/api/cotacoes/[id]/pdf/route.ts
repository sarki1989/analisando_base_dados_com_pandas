import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CotacaoPdfDocument } from "@/lib/pdf/cotacao-pdf";

export const runtime = "nodejs";

export async function GET(_request: Request, props: RouteContext<"/api/cotacoes/[id]/pdf">) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await props.params;

  const [cotacao, config] = await Promise.all([
    prisma.cotacao.findUnique({
      where: { id },
      include: {
        lead: true,
        itens: { include: { produto: true }, orderBy: { ordem: "asc" } },
      },
    }),
    prisma.configuracaoEmpresa.findUniqueOrThrow({ where: { id: "default" } }),
  ]);

  if (!cotacao) notFound();

  const buffer = await renderToBuffer(
    CotacaoPdfDocument({
      cotacao,
      lead: cotacao.lead,
      empresa: config,
      itens: cotacao.itens.map((item) => ({
        descricao: item.produto ? `${item.produto.sku} — ${item.produto.descricao}` : item.descricaoLivre || "Item",
        quantidade: item.quantidade,
        unidade: item.produto?.unidade || "un",
        precoUnitario: item.precoUnitario,
        desconto: item.desconto,
        total: item.total,
      })),
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="cotacao-${cotacao.numero}.pdf"`,
    },
  });
}
