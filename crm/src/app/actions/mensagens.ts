"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { gerarTextoComClaude } from "@/lib/anthropic";
import { diasDesde } from "@/lib/format";
import {
  montarPromptMensagem,
  extrairMensagem,
  type TipoMensagem,
  type CanalMensagem,
  type MensagemGerada,
} from "@/lib/mensagens";

async function usuarioLogado() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  return session.user;
}

/**
 * Gera, com IA, um rascunho de mensagem (WhatsApp ou e-mail) para um lead —
 * sempre para o usuário revisar e copiar/colar. Nada é enviado
 * automaticamente pelo sistema.
 */
export async function gerarMensagem({
  leadId,
  tipo,
  canal,
}: {
  leadId: string;
  tipo: TipoMensagem;
  canal: CanalMensagem;
}): Promise<MensagemGerada> {
  await usuarioLogado();

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      cotacoes: { orderBy: { emitidaEm: "desc" } },
      pedidos: { orderBy: { atualizadoEm: "desc" }, take: 1 },
    },
  });
  if (!lead) throw new Error("Lead não encontrado.");

  const pedido = lead.pedidos[0];
  const cotacao =
    tipo === "retomar_contato"
      ? lead.cotacoes.find((c) => c.status === "enviada" || c.status === "em negociação") ?? lead.cotacoes[0]
      : tipo === "pedido_confirmado"
        ? lead.cotacoes.find((c) => c.id === pedido?.cotacaoId) ?? lead.cotacoes[0]
        : lead.cotacoes.find((c) => c.status !== "rascunho") ?? lead.cotacoes[0];

  const prompt = montarPromptMensagem(tipo, canal, {
    leadNome: lead.nome,
    leadEmpresa: lead.empresa,
    cotacaoNumero: cotacao?.numero ?? null,
    cotacaoTotal: cotacao?.total ?? null,
    cotacaoValidadeDias: cotacao?.validadeDias ?? null,
    diasParado: tipo === "retomar_contato" ? diasDesde(cotacao?.emitidaEm ?? lead.ultimoContatoEm) : null,
    pedidoStatus: tipo === "pedido_confirmado" ? (pedido?.status ?? null) : null,
    transportadora: tipo === "pedido_confirmado" ? (pedido?.transportadora ?? null) : null,
    codigoRastreio: tipo === "pedido_confirmado" ? (pedido?.codigoRastreio ?? null) : null,
  });

  const texto = await gerarTextoComClaude(prompt);
  return extrairMensagem(canal, texto);
}
