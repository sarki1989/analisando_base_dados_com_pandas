"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function usuarioLogado() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  return session.user;
}

/** Vincula um clique de WhatsApp a um lead existente, preenchendo a Atribuição dele. */
export async function vincularCliqueALead(cliqueId: string, leadId: string) {
  await usuarioLogado();

  const clique = await prisma.cliqueWhatsapp.findUniqueOrThrow({ where: { id: cliqueId } });
  const atribuicaoExistente = await prisma.atribuicao.findUnique({ where: { leadId } });

  if (atribuicaoExistente) {
    throw new Error("Este lead já tem uma atribuição vinculada.");
  }

  await prisma.$transaction([
    prisma.atribuicao.create({
      data: {
        leadId,
        gclid: clique.gclid,
        utmSource: clique.utmSource,
        utmMedium: clique.utmMedium,
        utmCampaign: clique.utmCampaign,
        utmTerm: clique.utmTerm,
        utmContent: clique.utmContent,
        paginaLanding: clique.paginaLanding,
        referrer: clique.referrer,
        dispositivo: clique.dispositivo,
        primeiroCliqueEm: clique.criadoEm,
        cliqueWhatsappId: clique.id,
      },
    }),
    prisma.cliqueWhatsapp.update({
      where: { id: cliqueId },
      data: { leadId, vinculadoEm: new Date() },
    }),
  ]);

  revalidatePath("/cliques");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
}
