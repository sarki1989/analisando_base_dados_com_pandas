import { describe, expect, it } from "vitest";
import { gerarCodigoClique, detectarDispositivo } from "./codigo-clique";

describe("gerarCodigoClique", () => {
  it("gera código no formato SB-XXXX", () => {
    for (let i = 0; i < 50; i++) {
      expect(gerarCodigoClique()).toMatch(/^SB-[A-Z2-9]{4}$/);
    }
  });

  it("nunca usa caracteres ambíguos (0, O, 1, I)", () => {
    for (let i = 0; i < 50; i++) {
      const sufixo = gerarCodigoClique().slice(3);
      expect(sufixo).not.toMatch(/[0O1I]/);
    }
  });
});

describe("detectarDispositivo", () => {
  it("identifica celular pelo user-agent", () => {
    expect(detectarDispositivo("Mozilla/5.0 (Linux; Android 13; Mobile)")).toBe("celular");
    expect(detectarDispositivo("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")).toBe("celular");
  });

  it("identifica tablet pelo user-agent", () => {
    expect(detectarDispositivo("Mozilla/5.0 (iPad; CPU OS 17_0)")).toBe("tablet");
  });

  it("assume desktop quando não bate com padrões móveis", () => {
    expect(detectarDispositivo("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
  });

  it("retorna desconhecido quando não há user-agent", () => {
    expect(detectarDispositivo(null)).toBe("desconhecido");
  });
});
