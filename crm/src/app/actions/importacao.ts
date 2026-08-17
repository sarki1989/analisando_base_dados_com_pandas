"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { linhaImportacaoSchema } from "@/lib/validation/importacao";

export type ResultadoImportacao = { criados: number; ignorados: number; erros: string[] };

export async function importarLeadsCsv(linhas: unknown[]): Promise<ResultadoImportacao> {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");

  let criados = 0;
  const erros: string[] = [];

  for (const [i, linha] of linhas.entries()) {
    const parsed = linhaImportacaoSchema.safeParse(linha);
    if (!parsed.success) {
      erros.push(`Linha ${i + 1}: ${parsed.error.issues[0]?.message ?? "dados inválidos"}`);
      continue;
    }

    await prisma.lead.create({
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        origem: "importação CSV",
        responsavelId: session.user.id,
      },
    });
    criados++;
  }

  revalidatePath("/leads");
  return { criados, ignorados: erros.length, erros: erros.slice(0, 10) };
}
