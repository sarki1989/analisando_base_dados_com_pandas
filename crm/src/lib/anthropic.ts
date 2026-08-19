// Cliente mínimo da API da Anthropic (Messages API), via fetch nativo — sem
// SDK, para não adicionar dependência a um recurso opcional. Usado pelo
// gerador de mensagens com IA (src/app/actions/mensagens.ts).

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODELO_PADRAO = "claude-haiku-4-5-20251001";

export class AnthropicNaoConfiguradoError extends Error {
  constructor() {
    super(
      "Gerador de mensagens com IA não configurado: defina ANTHROPIC_API_KEY nas variáveis de ambiente do servidor para usar este recurso."
    );
    this.name = "AnthropicNaoConfiguradoError";
  }
}

/** Envia um prompt de turno único para o Claude e retorna o texto da resposta. */
export async function gerarTextoComClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AnthropicNaoConfiguradoError();

  const modelo = process.env.ANTHROPIC_MODEL || MODELO_PADRAO;

  const resposta = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: modelo,
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    throw new Error(`Falha ao gerar mensagem com IA (HTTP ${resposta.status}). ${detalhe.slice(0, 300)}`);
  }

  const dados: { content?: { type: string; text?: string }[] } = await resposta.json();
  const texto = dados.content?.find((bloco) => bloco.type === "text")?.text;
  if (!texto || !texto.trim()) {
    throw new Error("A IA não retornou nenhum texto.");
  }

  return texto.trim();
}
