// Lógica de negócio pura das cotações: numeração, cálculo do fator de preço
// e totais de itens. Mantida sem dependência do Prisma para ficar fácil de
// testar isoladamente.

/** Prefixo de data no formato DDMMAAAA, no fuso America/Sao_Paulo. */
export function prefixoDataCotacao(data: Date): string {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(data);

  const dia = partes.find((p) => p.type === "day")!.value;
  const mes = partes.find((p) => p.type === "month")!.value;
  const ano = partes.find((p) => p.type === "year")!.value;
  return `${dia}${mes}${ano}`;
}

/** Monta o número da cotação: DDMMAAAA-NN (sequencial de 2 dígitos no dia). */
export function montarNumeroCotacao(prefixoData: string, sequencialDoDia: number): string {
  return `${prefixoData}-${String(sequencialDoDia).padStart(2, "0")}`;
}

/** Extrai o número "raiz" (sem sufixo de revisão -R2, -R3...) para agrupar revisões. */
export function numeroRaiz(numero: string): string {
  return numero.replace(/-R\d+$/i, "");
}

/** Monta o número de uma revisão a partir do número raiz. */
export function montarNumeroRevisao(numeroBase: string, revisaoNumero: number): string {
  const raiz = numeroRaiz(numeroBase);
  return revisaoNumero <= 1 ? raiz : `${raiz}-R${revisaoNumero}`;
}

export type ParametrosPreco = {
  impostoPercent: number;
  margemPercent: number;
  despesasPercent: number;
};

/**
 * Fator multiplicador sobre o custo, pelo método do "preço por divisor"
 * usado no Simples Nacional: fator = 1 / (1 - soma das taxas).
 * Com os padrões da Stokes Brasil (4% + 10% + 5% = 19%), o fator é ≈1,2346.
 */
export function calcularFatorPreco({ impostoPercent, margemPercent, despesasPercent }: ParametrosPreco): number {
  const somaPercentuais = (impostoPercent + margemPercent + despesasPercent) / 100;
  if (somaPercentuais >= 1) {
    throw new Error("A soma de imposto + margem + despesas deve ser menor que 100%.");
  }
  return 1 / (1 - somaPercentuais);
}

export function calcularPrecoVenda(custoFornecedor: number, fator: number): number {
  return arredondar(custoFornecedor * fator);
}

export type ItemParaCalculo = {
  quantidade: number;
  precoUnitario: number;
  desconto?: number;
};

/** Total de uma linha de item: quantidade × preço unitário, menos o desconto em R$. */
export function calcularTotalItem({ quantidade, precoUnitario, desconto = 0 }: ItemParaCalculo): number {
  return arredondar(quantidade * precoUnitario - desconto);
}

/** Soma os totais dos itens (subtotal) e aplica o desconto geral da cotação. */
export function calcularTotaisCotacao(itens: ItemParaCalculo[], descontoGeral = 0) {
  const subtotal = arredondar(itens.reduce((acc, item) => acc + calcularTotalItem(item), 0));
  const total = arredondar(subtotal - descontoGeral);
  return { subtotal, total };
}

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}
