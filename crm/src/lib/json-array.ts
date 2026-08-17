// SQLite (e o schema compartilhado com PostgreSQL) não usa arrays nativos aqui;
// campos como `produtoInteresse` ficam como String contendo um array JSON.

export function paraArrayJSON(valor: string | null | undefined): string[] {
  if (!valor) return [];
  try {
    const parsed = JSON.parse(valor);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function deArrayParaJSON(valores: string[] | undefined): string | null {
  if (!valores || valores.length === 0) return null;
  return JSON.stringify(valores);
}
