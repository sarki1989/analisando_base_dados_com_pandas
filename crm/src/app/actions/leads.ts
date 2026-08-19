"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { registrarAuditoria } from "@/lib/audit";
import { deArrayParaJSON } from "@/lib/json-array";
import { leadSchema, moverStatusSchema, interacaoSchema } from "@/lib/validation/lead";
import { garantirPedidoParaLead } from "@/app/actions/pedidos";

async function usuarioLogado() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  return session.user;
}

export type FormState = { erro?: string; sucesso?: boolean };

export async function criarLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const usuario = await usuarioLogado();

  const raw = Object.fromEntries(formData.entries());
  const parsed = leadSchema.safeParse({
    ...raw,
    produtoInteresse: formData.getAll("produtoInteresse"),
    consentimentoLgpd: formData.get("consentimentoLgpd") === "on",
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { produtoInteresse, codigoClique, ...dados } = parsed.data;

  const clique = codigoClique
    ? await prisma.cliqueWhatsapp.findUnique({ where: { codigo: codigoClique.trim().toUpperCase() } })
    : null;

  if (codigoClique && !clique) {
    return { erro: `Nenhum clique encontrado com o código "${codigoClique}".` };
  }
  if (clique?.leadId) {
    return { erro: "Este código de clique já está vinculado a outro lead." };
  }

  const lead = await prisma.lead.create({
    data: {
      ...dados,
      email: dados.email || null,
      produtoInteresse: deArrayParaJSON(produtoInteresse),
      responsavelId: dados.responsavelId || usuario.id,
      origem: clique ? "WhatsApp (site)" : undefined,
      ...(clique && {
        atribuicao: {
          create: {
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
        },
      }),
    },
  });

  if (clique) {
    await prisma.cliqueWhatsapp.update({
      where: { id: clique.id },
      data: { leadId: lead.id, vinculadoEm: new Date() },
    });
  }

  await registrarAuditoria({
    entidade: "Lead",
    entidadeId: lead.id,
    acao: "lead_criado",
    usuarioId: usuario.id,
  });

  revalidatePath("/leads");
  return { sucesso: true };
}

export async function atualizarLead(leadId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const usuario = await usuarioLogado();

  const raw = Object.fromEntries(formData.entries());
  const parsed = leadSchema.safeParse({
    ...raw,
    produtoInteresse: formData.getAll("produtoInteresse"),
    consentimentoLgpd: formData.get("consentimentoLgpd") === "on",
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { produtoInteresse, ...dados } = parsed.data;

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      ...dados,
      email: dados.email || null,
      produtoInteresse: deArrayParaJSON(produtoInteresse),
    },
  });

  await registrarAuditoria({
    entidade: "Lead",
    entidadeId: leadId,
    acao: "lead_atualizado",
    usuarioId: usuario.id,
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  return { sucesso: true };
}

export async function moverStatusLead(input: unknown) {
  const usuario = await usuarioLogado();
  const parsed = moverStatusSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const { leadId, status, motivoPerda } = parsed.data;

  if (status === "Perdido" && !motivoPerda) {
    throw new Error("Informe o motivo da perda.");
  }

  const leadAnterior = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status,
      motivoPerda: status === "Perdido" ? motivoPerda : null,
    },
  });

  await registrarAuditoria({
    entidade: "Lead",
    entidadeId: leadId,
    acao: "status_alterado",
    detalhe: `${leadAnterior.status} -> ${status}`,
    usuarioId: usuario.id,
  });

  if (status === "Ganho") {
    await garantirPedidoParaLead(leadId);
    revalidatePath("/pedidos");
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
}

export async function excluirLead(leadId: string) {
  const usuario = await usuarioLogado();
  if (usuario.papel !== "admin") throw new Error("Apenas administradores podem excluir leads.");

  // Exclusão definitiva (LGPD): remove o lead e todos os registros pessoais associados.
  await prisma.$transaction([
    prisma.interacao.deleteMany({ where: { leadId } }),
    prisma.tarefa.deleteMany({ where: { leadId } }),
    prisma.atribuicao.deleteMany({ where: { leadId } }),
    prisma.cliqueWhatsapp.updateMany({ where: { leadId }, data: { leadId: null } }),
    prisma.lead.delete({ where: { id: leadId } }),
  ]);

  await registrarAuditoria({
    entidade: "Lead",
    entidadeId: leadId,
    acao: "lead_excluido_lgpd",
    usuarioId: usuario.id,
  });

  revalidatePath("/leads");
  redirect("/leads");
}

export async function registrarInteracao(_prev: FormState, formData: FormData): Promise<FormState> {
  const usuario = await usuarioLogado();

  const parsed = interacaoSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  await prisma.interacao.create({
    data: { ...parsed.data, usuarioId: usuario.id },
  });

  await prisma.lead.update({
    where: { id: parsed.data.leadId },
    data: { ultimoContatoEm: new Date() },
  });

  revalidatePath(`/leads/${parsed.data.leadId}`);
  revalidatePath("/leads");
  return { sucesso: true };
}

/** Abre o WhatsApp do lead e já registra a interação de saída correspondente. */
export async function registrarAberturaWhatsapp(leadId: string) {
  const usuario = await usuarioLogado();

  await prisma.interacao.create({
    data: {
      leadId,
      tipo: "whatsapp",
      direcao: "saída",
      resumo: "WhatsApp aberto a partir do CRM.",
      usuarioId: usuario.id,
    },
  });

  await prisma.lead.update({ where: { id: leadId }, data: { ultimoContatoEm: new Date() } });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
}
