// Lógica pura do gerador de mensagens com IA: monta o prompt enviado ao
// Claude e interpreta a resposta. Sem Prisma aqui de propósito — quem busca
// os dados do lead/cotação é src/app/actions/mensagens.ts. As mensagens
// geradas são sempre rascunho: o usuário revisa e copia/cola ou abre o
// WhatsApp/e-mail já preenchido — nada é enviado automaticamente pelo sistema.

export const TIPOS_MENSAGEM = ["enviar_proposta", "retomar_contato"] as const;
export type TipoMensagem = (typeof TIPOS_MENSAGEM)[number];

export const ROTULOS_TIPO_MENSAGEM: Record<TipoMensagem, string> = {
  enviar_proposta: "Enviar proposta",
  retomar_contato: "Retomar contato (negociação parada)",
};

export const CANAIS_MENSAGEM = ["whatsapp", "email"] as const;
export type CanalMensagem = (typeof CANAIS_MENSAGEM)[number];

export const ROTULOS_CANAL_MENSAGEM: Record<CanalMensagem, string> = {
  whatsapp: "WhatsApp",
  email: "E-mail",
};

export type ContextoMensagem = {
  leadNome: string;
  leadEmpresa: string;
  cotacaoNumero?: string | null;
  cotacaoTotal?: number | null;
  cotacaoValidadeDias?: number | null;
  diasParado?: number | null;
};

const persona =
  "Você escreve mensagens comerciais em nome de um vendedor da Stokes Brasil, empresa revendedora de " +
  "ferramentas diamantadas para sondagem (coroas, calibradores, barriletes) que atende clientes de " +
  "sondagem geotécnica, mineração, construção civil e poços.";

function formatBRLServidor(valor: number | null | undefined) {
  if (valor === null || valor === undefined) return null;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function descreverSituacao(tipo: TipoMensagem, ctx: ContextoMensagem): string {
  const total = formatBRLServidor(ctx.cotacaoTotal);

  if (tipo === "enviar_proposta") {
    const detalhesCotacao = ctx.cotacaoNumero
      ? `A cotação ${ctx.cotacaoNumero}${total ? `, no valor de ${total},` : ""}${
          ctx.cotacaoValidadeDias ? ` válida por ${ctx.cotacaoValidadeDias} dias,` : ""
        } acabou de ser gerada para este cliente.`
      : "Uma proposta comercial acabou de ser gerada para este cliente.";
    return `${detalhesCotacao} Escreva uma mensagem de acompanhamento avisando que a proposta está pronta e reforçando disponibilidade para tirar dúvidas.`;
  }

  const detalhesCotacao = ctx.cotacaoNumero
    ? `A cotação ${ctx.cotacaoNumero}${total ? `, no valor de ${total},` : ""} foi enviada${
        ctx.diasParado != null ? ` há ${ctx.diasParado} dia(s)` : ""
      } e o cliente não deu retorno desde então.`
    : `A negociação com este cliente está parada${ctx.diasParado != null ? ` há ${ctx.diasParado} dia(s)` : ""}.`;
  return `${detalhesCotacao} Escreva uma mensagem educada para retomar o contato, sem soar insistente, perguntando se ainda há interesse ou se falta alguma informação.`;
}

/** Monta o prompt de turno único enviado ao Claude para o tipo/canal escolhidos. */
export function montarPromptMensagem(tipo: TipoMensagem, canal: CanalMensagem, ctx: ContextoMensagem): string {
  const situacao = descreverSituacao(tipo, ctx);
  const destinatario = `O cliente se chama ${ctx.leadNome}, da empresa ${ctx.leadEmpresa}.`;

  const instrucoesFormato =
    canal === "email"
      ? "Responda em português do Brasil, EXATAMENTE neste formato, sem nenhum texto antes ou depois:\n" +
        "ASSUNTO: <linha única com o assunto do e-mail>\n" +
        "CORPO:\n" +
        "<corpo do e-mail, com saudação e despedida, em tom profissional e cordial>"
      : "Responda em português do Brasil, com o texto pronto para copiar e colar no WhatsApp: direto, cordial, " +
        "sem formalidade excessiva, sem saudações longas, no máximo 4-5 frases curtas. Não use markdown nem " +
        "aspas ao redor da mensagem — apenas o texto puro da mensagem.";

  return `${persona}\n\n${destinatario} ${situacao}\n\n${instrucoesFormato}`;
}

export type MensagemGerada = { assunto: string | null; corpo: string };

/** Extrai assunto/corpo de uma resposta no formato "ASSUNTO: ...\nCORPO:\n...". */
export function extrairMensagemEmail(texto: string): MensagemGerada {
  const match = texto.match(/ASSUNTO:\s*(.+?)\s*\n+CORPO:\s*\n?([\s\S]+)/i);
  if (!match) return { assunto: null, corpo: texto.trim() };
  return { assunto: match[1].trim(), corpo: match[2].trim() };
}

/** Interpreta a resposta da IA de acordo com o canal escolhido. */
export function extrairMensagem(canal: CanalMensagem, texto: string): MensagemGerada {
  if (canal === "email") return extrairMensagemEmail(texto);
  return { assunto: null, corpo: texto.trim() };
}
