import { describe, expect, it } from "vitest";
import { paraArrayJSON, deArrayParaJSON } from "./json-array";

describe("deArrayParaJSON / paraArrayJSON", () => {
  it("faz o round-trip de um array de strings", () => {
    const original = ["coroa HQ", "barrilete NQ"];
    expect(paraArrayJSON(deArrayParaJSON(original))).toEqual(original);
  });

  it("retorna null ao serializar um array vazio ou indefinido", () => {
    expect(deArrayParaJSON([])).toBeNull();
    expect(deArrayParaJSON(undefined)).toBeNull();
  });

  it("retorna array vazio ao desserializar null/indefinido/lixo", () => {
    expect(paraArrayJSON(null)).toEqual([]);
    expect(paraArrayJSON(undefined)).toEqual([]);
    expect(paraArrayJSON("não é json")).toEqual([]);
    expect(paraArrayJSON('{"não":"é array"}')).toEqual([]);
  });
});
