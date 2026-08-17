"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  prefixoDataCotacao,
  montarNumeroCotacao,
  montarNumeroRevisao,
  numeroRaiz,
  calcularTotaisCotacao,
} from "@/lib/cotacao";
import {
  cotacaoFormSchema,
  itensArraySchema,
  mudarStatusCotacaoSchema,
} from "@/lib/validation/cotacao";
import { registrarAuditoria } from "@/lib/audit";

async function usuarioLogado() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  return session.user;
}

export type CotacaoFormState = { erro?: string; cotacaoId?: string };

async function proximoNumeroDoDia(): Promise<string> {
  const prefixo = prefixoDataCotacao(new Date());
  const totalHoje = await prisma.cotacao.count({
    where: { numero: { startsWith: `${prefixo}-` }, revisaoNumero: 1 },
  });
  return montarNumeroCotacao(prefixo, totalHoje + 1);
}

async function criarComNumeroUnico(dados: {
  leadId: string;
  usuarioId: string;
  condicaoPagamento?: string;
  prazoFabricacao?: string;
  frete?: string;
  observacoes?: string;
  validadeDias: number;
  subtotal: number;
  desconto: number;
  total: number;
  itens: { produtoId?: string; descricaoLivre?: string; quantidade: number; precoUnitario: number; desconto: number; total: number }[];
}) {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const numero = await proximoNumeroDoDia();
    try {
      return await prisma.cotacao.create({
        data: {
          numero,
          leadId: dados.leadId,
          usuarioId: dados.usuarioId,
          condicaoPagamento: dados.condicaoPagamento,
          prazoFabricacao: dados.prazoFabricacao,
          frete: dados.frete,
          observacoes: dados.observacoes,
          validadeDias: dados.validadeDias,
          subtotal: dados.subtotal,
          desconto: dados.desconto,
          total: dados.total,
          itens: {
            create: dados.itens.map((item, ordem) => ({ ...item, ordem })),
          },
        },
      });
    } catch (e) {
      const colisao = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
      if (!colisao) throw e;
    }
  }
  throw new Error("Não foi possível gerar um número de cotação único. Tente novamente.");
}

export async function criarCotacao(_prev: CotacaoFormState, formData: FormData): Promise<CotacaoFormState> {
  const usuario = await usuarioLogado();

  const parsed = cotacaoFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  let itensBrutos: unknown;
  try {
    itensBrutos = JSON.parse(parsed.data.itensJson);
  } catch {
    return { erro: "Itens inválidos." };
  }
  const itensParsed = itensArraySchema.safeParse(itensBrutos);
  if (!itensParsed.success) return { erro: itensParsed.error.issues[0]?.message ?? "Itens inválidos." };

  const itensComTotal = itensParsed.data.map((item) => ({
    ...item,
    total: item.quantidade * item.precoUnitario - (item.desconto ?? 0),
  }));
  const { subtotal, total } = calcularTotaisCotacao(itensParsed.data, parsed.data.desconto);

  const cotacao = await criarComNumeroUnico({
    leadId: parsed.data.leadId,
    usuarioId: usuario.id,
    condicaoPagamento: parsed.data.condicaoPagamento,
    prazoFabricacao: parsed.data.prazoFabricacao,
    frete: parsed.data.frete,
    observacoes: parsed.data.observacoes,
    validadeDias: parsed.data.validadeDias,
    subtotal,
    desconto: parsed.data.desconto ?? 0,
    total,
    itens: itensComTotal,
  });

  await registrarAuditoria({
    entidade: "Cotacao",
    entidadeId: cotacao.id,
    acao: "cotacao_criada",
    detalhe: cotacao.numero,
    usuarioId: usuario.id,
  });

  revalidatePath("/cotacoes");
  revalidatePath(`/leads/${parsed.data.leadId}`);
  redirect(`/cotacoes/${cotacao.id}`);
}

export async function atualizarCotacao(cotacaoId: string, _prev: CotacaoFormState, formData: FormData): Promise<CotacaoFormState> {
  const usuario = await usuarioLogado();

  const existente = await prisma.cotacao.findUniqueOrThrow({ where: { id: cotacaoId } });
  if (existente.status !== "rascunho") {
    return { erro: "Só é possível editar cotações em rascunho. Duplique para criar uma revisão." };
  }

  const parsed = cotacaoFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  let itensBrutos: unknown;
  try {
    itensBrutos = JSON.parse(parsed.data.itensJson);
  } catch {
    return { erro: "Itens inválidos." };
  }
  const itensParsed = itensArraySchema.safeParse(itensBrutos);
  if (!itensParsed.success) return { erro: itensParsed.error.issues[0]?.message ?? "Itens inválidos." };

  const itensComTotal = itensParsed.data.map((item, ordem) => ({
    ...item,
    total: item.quantidade * item.precoUnitario - (item.desconto ?? 0),
    ordem,
  }));
  const { subtotal, total } = calcularTotaisCotacao(itensParsed.data, parsed.data.desconto);

  await prisma.$transaction([
    prisma.itemCotacao.deleteMany({ where: { cotacaoId } }),
    prisma.cotacao.update({
      where: { id: cotacaoId },
      data: {
        condicaoPagamento: parsed.data.condicaoPagamento,
        prazoFabricacao: parsed.data.prazoFabricacao,
        frete: parsed.data.frete,
        observacoes: parsed.data.observacoes,
        validadeDias: parsed.data.validadeDias,
        subtotal,
        desconto: parsed.data.desconto ?? 0,
        total,
        itens: { create: itensComTotal },
      },
    }),
  ]);

  await registrarAuditoria({
    entidade: "Cotacao",
    entidadeId: cotacaoId,
    acao: "cotacao_atualizada",
    usuarioId: usuario.id,
  });

  revalidatePath(`/cotacoes/${cotacaoId}`);
  revalidatePath("/cotacoes");
  return { cotacaoId };
}

export async function mudarStatusCotacao(input: unknown) {
  const usuario = await usuarioLogado();
  const parsed = mudarStatusCotacaoSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const { cotacaoId, status, motivoPerda } = parsed.data;
  if (status === "perdida" && !motivoPerda) throw new Error("Informe o motivo da perda.");

  const cotacao = await prisma.cotacao.update({
    where: { id: cotacaoId },
    data: { status, motivoPerda: status === "perdida" ? motivoPerda : null },
  });

  // Acompanha o funil do lead quando a cotação avança de fase.
  if (status === "enviada") {
    const lead = await prisma.lead.findUniqueOrThrow({ where: { id: cotacao.leadId } });
    const aindaNoInicio = ["Novo", "Contato feito", "Qualificado"].includes(lead.status);
    if (aindaNoInicio) {
      await prisma.lead.update({ where: { id: lead.id }, data: { status: "Cotação enviada" } });
    }
  } else if (status === "em negociação") {
    const lead = await prisma.lead.findUniqueOrThrow({ where: { id: cotacao.leadId } });
    if (lead.status === "Cotação enviada") {
      await prisma.lead.update({ where: { id: lead.id }, data: { status: "Em negociação" } });
    }
  } else if (status === "aprovada") {
    await prisma.lead.update({ where: { id: cotacao.leadId }, data: { status: "Ganho" } });
  }

  await registrarAuditoria({
    entidade: "Cotacao",
    entidadeId: cotacaoId,
    acao: "status_alterado",
    detalhe: status,
    usuarioId: usuario.id,
  });

  revalidatePath(`/cotacoes/${cotacaoId}`);
  revalidatePath("/cotacoes");
  revalidatePath(`/leads/${cotacao.leadId}`);
  revalidatePath("/leads");
}

export async function duplicarCotacao(cotacaoId: string) {
  const usuario = await usuarioLogado();

  const original = await prisma.cotacao.findUniqueOrThrow({
    where: { id: cotacaoId },
    include: { itens: true },
  });

  const raiz = numeroRaiz(original.numero);
  const maiorRevisao = await prisma.cotacao.aggregate({
    where: { numero: { startsWith: raiz } },
    _max: { revisaoNumero: true },
  });
  const proximaRevisao = (maiorRevisao._max.revisaoNumero ?? original.revisaoNumero) + 1;

  const nova = await prisma.cotacao.create({
    data: {
      numero: montarNumeroRevisao(raiz, proximaRevisao),
      leadId: original.leadId,
      usuarioId: usuario.id,
      status: "rascunho",
      validadeDias: original.validadeDias,
      condicaoPagamento: original.condicaoPagamento,
      prazoFabricacao: original.prazoFabricacao,
      frete: original.frete,
      observacoes: original.observacoes,
      subtotal: original.subtotal,
      desconto: original.desconto,
      total: original.total,
      revisaoDeId: original.id,
      revisaoNumero: proximaRevisao,
      itens: {
        create: original.itens.map((item) => ({
          produtoId: item.produtoId,
          descricaoLivre: item.descricaoLivre,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          desconto: item.desconto,
          total: item.total,
          ordem: item.ordem,
        })),
      },
    },
  });

  await registrarAuditoria({
    entidade: "Cotacao",
    entidadeId: nova.id,
    acao: "cotacao_duplicada",
    detalhe: `a partir de ${original.numero}`,
    usuarioId: usuario.id,
  });

  revalidatePath("/cotacoes");
  revalidatePath(`/leads/${original.leadId}`);
  redirect(`/cotacoes/${nova.id}`);
}

export async function excluirCotacao(cotacaoId: string) {
  await usuarioLogado();

  const cotacao = await prisma.cotacao.findUniqueOrThrow({ where: { id: cotacaoId } });
  if (cotacao.status !== "rascunho") {
    throw new Error("Só é possível excluir cotações em rascunho.");
  }

  await prisma.cotacao.delete({ where: { id: cotacaoId } });
  revalidatePath("/cotacoes");
  revalidatePath(`/leads/${cotacao.leadId}`);
  redirect(`/leads/${cotacao.leadId}`);
}
