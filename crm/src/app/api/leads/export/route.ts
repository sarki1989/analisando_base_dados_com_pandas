import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { paraCsv, paraXlsxBuffer } from "@/lib/export";
import { formatData } from "@/lib/format";
import { paraArrayJSON } from "@/lib/json-array";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const formato = request.nextUrl.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  const leads = await prisma.lead.findMany({
    include: { responsavel: { select: { nome: true } }, atribuicao: { select: { utmCampaign: true, utmSource: true } } },
    orderBy: { criadoEm: "desc" },
  });

  const linhas = leads.map((l) => ({
    Nome: l.nome,
    Empresa: l.empresa,
    CNPJ: l.cnpj ?? "",
    Telefone: l.telefone,
    "E-mail": l.email ?? "",
    Cidade: l.cidade ?? "",
    UF: l.uf ?? "",
    Setor: l.setor,
    "Produtos de interesse": paraArrayJSON(l.produtoInteresse).join("; "),
    Status: l.status,
    "Valor estimado": l.valorEstimado ?? "",
    Responsável: l.responsavel?.nome ?? "",
    Campanha: l.atribuicao?.utmCampaign ?? l.atribuicao?.utmSource ?? "",
    "Criado em": formatData(l.criadoEm),
    "Último contato": formatData(l.ultimoContatoEm),
  }));

  const nomeArquivo = `leads-${new Date().toISOString().slice(0, 10)}`;

  if (formato === "xlsx") {
    const buffer = paraXlsxBuffer(linhas, "Leads");
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
