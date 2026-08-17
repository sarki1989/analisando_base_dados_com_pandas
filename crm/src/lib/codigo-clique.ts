// Alfabeto sem caracteres ambíguos (sem 0/O, 1/I) para ficar fácil de digitar
// no WhatsApp a partir do código impresso na mensagem pré-preenchida.
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function gerarCodigoClique() {
  let sufixo = "";
  for (let i = 0; i < 4; i++) {
    sufixo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return `SB-${sufixo}`;
}

/** Detecção simples de dispositivo a partir do User-Agent, só para relatórios — não crítico. */
export function detectarDispositivo(userAgent: string | null) {
  if (!userAgent) return "desconhecido";
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone/.test(ua)) return "celular";
  if (/ipad|tablet/.test(ua)) return "tablet";
  return "desktop";
}
