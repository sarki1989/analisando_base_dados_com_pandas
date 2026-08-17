import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ leads: [], cotacoes: [] });

  const [leads, cotacoes] = await Promise.all([
    prisma.lead.findMany({
      where: {
        OR: [
          { nome: { contains: q } },
          { empresa: { contains: q } },
          { telefone: { contains: q } },
        ],
      },
      select: { id: true, nome: true, empresa: true, telefone: true, status: true },
      take: 8,
    }),
    prisma.cotacao.findMany({
      where: { numero: { contains: q } },
      select: { id: true, numero: true, status: true, total: true, lead: { select: { empresa: true } } },
      take: 8,
    }),
  ]);

  return NextResponse.json({ leads, cotacoes });
}
