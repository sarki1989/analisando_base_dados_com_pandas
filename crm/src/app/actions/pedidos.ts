"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { registrarAuditoria } from "@/lib/audit";
import { mudarStatusPedidoSchema, editarPedidoSchema } from "@/lib/validation/pedido";

async function usuarioLogado() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  return session.user;
}

/** Escolhe qual cotação do lead serve de referência para o pedido de compra: a aprovada, senão a mais recente já enviada. */
async function melhorCotacaoParaPedido(leadId: string) {
  const cotacoes = await prisma.cotacao.findMany({ where: { leadId }, orderBy: { emitidaEm: "desc" } });
  return (
    cotacoes.find((c) => c.status === "aprovada") ??
    cotacoes.find((c) => c.status !== "rascunho") ??
    cotacoes[0] ??
    null
  );
}

/**
 * Garante que um lead "Ganho" tenha um pedido de compra no Kanban de
 * pós-venda. Idempotente: não cria duplicado se o lead já tiver um.
 * Chamada tanto ao mudar o status do lead quanto como auto-recuperação na
 * página /pedidos (para leads que viraram "Ganho" antes desse recurso
 * existir, ou por qualquer outro caminho que não passe por moverStatusLead).
 */
export async function garantirPedidoParaLead(leadId: string) {
  const existente = await prisma.pedido.findFirst({ where: { leadId } });
  if (existente) return existente;

  const cotacao = await melhorCotacaoParaPedido(leadId);
  return prisma.pedido.create({ data: { leadId, cotacaoId: cotacao?.id ?? null } });
}

export async function moverStatusPedido(input: unknown) {
  await usuarioLogado();
  const parsed = mudarStatusPedidoSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const { pedidoId, status } = parsed.data;
  await prisma.pedido.update({ where: { id: pedidoId }, data: { status } });

  revalidatePath("/pedidos");
}

export async function editarPedido(input: unknown) {
  const usuario = await usuarioLogado();
  const parsed = editarPedidoSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const { pedidoId, ...dados } = parsed.data;

  const pedido = await prisma.pedido.findUniqueOrThrow({ where: { id: pedidoId } });

  if (dados.cotacaoId) {
    const cotacao = await prisma.cotacao.findUnique({ where: { id: dados.cotacaoId } });
    if (!cotacao || cotacao.leadId !== pedido.leadId) {
      throw new Error("Essa cotação não pertence a este lead.");
    }
  }

  await prisma.pedido.update({
    where: { id: pedidoId },
    data: {
      cotacaoId: dados.cotacaoId ?? null,
      fornecedor: dados.fornecedor || null,
      numeroPedidoFornecedor: dados.numeroPedidoFornecedor || null,
      transportadora: dados.transportadora || null,
      codigoRastreio: dados.codigoRastreio || null,
      observacoes: dados.observacoes || null,
    },
  });

  await registrarAuditoria({
    entidade: "Pedido",
    entidadeId: pedidoId,
    acao: "pedido_atualizado",
    usuarioId: usuario.id,
  });

  revalidatePath("/pedidos");
}
