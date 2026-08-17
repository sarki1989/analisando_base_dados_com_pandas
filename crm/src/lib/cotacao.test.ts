import { describe, expect, it } from "vitest";
import {
  prefixoDataCotacao,
  montarNumeroCotacao,
  numeroRaiz,
  montarNumeroRevisao,
  calcularFatorPreco,
  calcularPrecoVenda,
  calcularTotalItem,
  calcularTotaisCotacao,
} from "./cotacao";

describe("numeração de cotação", () => {
  it("formata o prefixo de data como DDMMAAAA no fuso de São Paulo", () => {
    // meio-dia UTC cai no mesmo dia em São Paulo (UTC-3), sem ambiguidade
    const data = new Date("2026-08-16T12:00:00Z");
    expect(prefixoDataCotacao(data)).toBe("16082026");
  });

  it("monta o número com sequencial de 2 dígitos", () => {
    expect(montarNumeroCotacao("16082026", 1)).toBe("16082026-01");
    expect(montarNumeroCotacao("16082026", 12)).toBe("16082026-12");
  });

  it("extrai o número raiz removendo sufixo de revisão", () => {
    expect(numeroRaiz("16082026-01")).toBe("16082026-01");
    expect(numeroRaiz("16082026-01-R2")).toBe("16082026-01");
    expect(numeroRaiz("16082026-01-R10")).toBe("16082026-01");
  });

  it("monta o número de revisão a partir da raiz", () => {
    expect(montarNumeroRevisao("16082026-01", 1)).toBe("16082026-01");
    expect(montarNumeroRevisao("16082026-01", 2)).toBe("16082026-01-R2");
    expect(montarNumeroRevisao("16082026-01-R2", 3)).toBe("16082026-01-R3");
  });
});

describe("calcularFatorPreco", () => {
  it("reproduz o fator padrão da Stokes Brasil (4% + 10% + 5%)", () => {
    const fator = calcularFatorPreco({ impostoPercent: 4, margemPercent: 10, despesasPercent: 5 });
    expect(fator).toBeCloseTo(1.2346, 4);
  });

  it("aumenta o fator quando os percentuais sobem", () => {
    const fatorBase = calcularFatorPreco({ impostoPercent: 4, margemPercent: 10, despesasPercent: 5 });
    const fatorMaior = calcularFatorPreco({ impostoPercent: 4, margemPercent: 20, despesasPercent: 5 });
    expect(fatorMaior).toBeGreaterThan(fatorBase);
  });

  it("rejeita quando a soma dos percentuais chega a 100% ou mais", () => {
    expect(() => calcularFatorPreco({ impostoPercent: 50, margemPercent: 40, despesasPercent: 10 })).toThrow();
  });
});

describe("calcularPrecoVenda", () => {
  it("aplica o fator sobre o custo e arredonda em 2 casas", () => {
    expect(calcularPrecoVenda(380, 1.2346)).toBeCloseTo(469.15, 2);
  });
});

describe("totais de itens", () => {
  it("calcula o total de um item com desconto", () => {
    expect(calcularTotalItem({ quantidade: 3, precoUnitario: 100, desconto: 20 })).toBe(280);
  });

  it("calcula o total de um item sem desconto", () => {
    expect(calcularTotalItem({ quantidade: 2, precoUnitario: 49.9 })).toBeCloseTo(99.8, 2);
  });

  it("soma o subtotal dos itens e aplica o desconto geral da cotação", () => {
    const itens = [
      { quantidade: 2, precoUnitario: 100 }, // 200
      { quantidade: 1, precoUnitario: 50, desconto: 5 }, // 45
    ];
    const { subtotal, total } = calcularTotaisCotacao(itens, 25);
    expect(subtotal).toBe(245);
    expect(total).toBe(220);
  });

  it("retorna zero quando não há itens", () => {
    expect(calcularTotaisCotacao([])).toEqual({ subtotal: 0, total: 0 });
  });
});
