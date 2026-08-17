import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { paraCsv, paraXlsxBuffer } from "@/lib/export";
import { formatData } from "@/lib/format";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const formato = request.nextUrl.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  const cotacoes = await prisma.cotacao.findMany({
    include: { lead: { select: { empresa: true, nome: true } } },
    orderBy: { emitidaEm: "desc" },
  });

  const linhas = cotacoes.map((c) => ({
    Número: c.numero,
    Cliente: c.lead.empresa,
    Contato: c.lead.nome,
    Status: c.status,
    "Emitida em": formatData(c.emitidaEm),
    "Validade (dias)": c.validadeDias,
    Subtotal: c.subtotal,
    Desconto: c.desconto,
    Total: c.total,
    "Condição de pagamento": c.condicaoPagamento ?? "",
    "Prazo de fabricação": c.prazoFabricacao ?? "",
    Frete: c.frete ?? "",
    "Motivo da perda": c.motivoPerda ?? "",
  }));

  const nomeArquivo = `cotacoes-${new Date().toISOString().slice(0, 10)}`;

  if (formato === "xlsx") {
    const buffer = paraXlsxBuffer(linhas, "Cotações");
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nomeArquivo}.xlsx"`,
      },
    });
  }

  const csv = paraCsv(linhas);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomeArquivo}.csv"`,
    },
  });
}
