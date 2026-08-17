import * as XLSX from "xlsx";

/** Gera um arquivo XLSX (buffer) a partir de uma lista de objetos simples. */
export function paraXlsxBuffer(linhas: Record<string, unknown>[], nomeAba = "Dados"): Buffer {
  const planilha = XLSX.utils.json_to_sheet(linhas);
  const livro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(livro, planilha, nomeAba);
  return XLSX.write(livro, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

/** Gera um CSV (string, separado por vírgula, com BOM para abrir corretamente no Excel). */
export function paraCsv(linhas: Record<string, unknown>[]): string {
  if (linhas.length === 0) return "";
  const colunas = Object.keys(linhas[0]);
  const escapar = (valor: unknown) => {
    const texto = valor === null || valor === undefined ? "" : String(valor);
    return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  const cabecalho = colunas.join(",");
  const corpo = linhas.map((linha) => colunas.map((c) => escapar(linha[c])).join(","));
  return "﻿" + [cabecalho, ...corpo].join("\n");
}
