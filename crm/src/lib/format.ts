const FUSO = "America/Sao_Paulo";

export function formatBRL(valor: number | null | undefined) {
  if (valor === null || valor === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

export function formatData(data: Date | string | null | undefined) {
  if (!data) return "—";
  const d = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, dateStyle: "short" }).format(d);
}

export function formatDataHora(data: Date | string | null | undefined) {
  if (!data) return "—";
  const d = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

/** Dias corridos entre a data informada e agora (arredondado para baixo). */
export function diasDesde(data: Date | string | null | undefined) {
  if (!data) return null;
  const d = typeof data === "string" ? new Date(data) : data;
  const diffMs = Date.now() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/** Mantém apenas dígitos — útil para montar números no formato E.164 usado pelo wa.me. */
export function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

/** Monta o link wa.me a partir de um telefone (com ou sem formatação) e uma mensagem opcional. */
export function linkWhatsapp(telefone: string, mensagem?: string) {
  const numero = apenasDigitos(telefone);
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${numero}${texto}`;
}

export function formatTelefone(telefone: string) {
  const d = apenasDigitos(telefone).replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return telefone;
}
