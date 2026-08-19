import { describe, expect, it } from "vitest";
import { montarPromptMensagem, extrairMensagemEmail, extrairMensagem } from "./mensagens";

const ctxBase = {
  leadNome: "João Silva",
  leadEmpresa: "Geo Sondagens Ltda",
  cotacaoNumero: "16082026-01",
  cotacaoTotal: 12500,
  cotacaoValidadeDias: 15,
  diasParado: null,
};

describe("montarPromptMensagem", () => {
  it("inclui nome, empresa e número da cotação no prompt de enviar_proposta", () => {
    const prompt = montarPromptMensagem("enviar_proposta", "whatsapp", ctxBase);
    expect(prompt).toContain("João Silva");
    expect(prompt).toContain("Geo Sondagens Ltda");
    expect(prompt).toContain("16082026-01");
    expect(prompt).toContain("R$");
  });

  it("menciona dias parado no prompt de retomar_contato quando informado", () => {
    const prompt = montarPromptMensagem("retomar_contato", "whatsapp", { ...ctxBase, diasParado: 7 });
    expect(prompt).toContain("há 7 dia(s)");
  });

  it("não quebra sem número de cotação", () => {
    const prompt = montarPromptMensagem("retomar_contato", "whatsapp", {
      leadNome: "Maria",
      leadEmpresa: "Poços SA",
      cotacaoNumero: null,
      cotacaoTotal: null,
      cotacaoValidadeDias: null,
      diasParado: 3,
    });
    expect(prompt).toContain("negociação com este cliente está parada");
    expect(prompt).not.toContain("undefined");
  });

  it("inclui status do pedido e rastreio no prompt de pedido_confirmado", () => {
    const prompt = montarPromptMensagem("pedido_confirmado", "whatsapp", {
      ...ctxBase,
      pedidoStatus: "Em trânsito",
      transportadora: "Jamef",
      codigoRastreio: "JM123456789BR",
    });
    expect(prompt).toContain("Em trânsito");
    expect(prompt).toContain("Jamef");
    expect(prompt).toContain("JM123456789BR");
  });

  it("pedido_confirmado não quebra sem status/transportadora/rastreio", () => {
    const prompt = montarPromptMensagem("pedido_confirmado", "whatsapp", {
      leadNome: "Maria",
      leadEmpresa: "Poços SA",
      cotacaoNumero: null,
      cotacaoTotal: null,
      cotacaoValidadeDias: null,
      diasParado: null,
      pedidoStatus: null,
      transportadora: null,
      codigoRastreio: null,
    });
    expect(prompt).toContain("em andamento");
    expect(prompt).not.toContain("undefined");
    expect(prompt).not.toContain("null");
  });

  it("pede formato ASSUNTO/CORPO só para e-mail", () => {
    const promptEmail = montarPromptMensagem("enviar_proposta", "email", ctxBase);
    const promptWhatsapp = montarPromptMensagem("enviar_proposta", "whatsapp", ctxBase);
    expect(promptEmail).toContain("ASSUNTO:");
    expect(promptEmail).toContain("CORPO:");
    expect(promptWhatsapp).not.toContain("ASSUNTO:");
    expect(promptWhatsapp).toContain("WhatsApp");
  });
});

describe("extrairMensagemEmail", () => {
  it("separa assunto e corpo no formato esperado", () => {
    const texto = "ASSUNTO: Proposta comercial Stokes Brasil\nCORPO:\nOlá João,\n\nSegue nossa proposta.\n\nAbraço,\nStokes";
    const { assunto, corpo } = extrairMensagemEmail(texto);
    expect(assunto).toBe("Proposta comercial Stokes Brasil");
    expect(corpo).toBe("Olá João,\n\nSegue nossa proposta.\n\nAbraço,\nStokes");
  });

  it("cai para o texto inteiro como corpo quando o formato não bate", () => {
    const texto = "Olá! Segue a proposta em anexo.";
    const { assunto, corpo } = extrairMensagemEmail(texto);
    expect(assunto).toBeNull();
    expect(corpo).toBe(texto);
  });
});

describe("extrairMensagem", () => {
  it("usa o texto puro como corpo para whatsapp", () => {
    const { assunto, corpo } = extrairMensagem("whatsapp", "  Oi, tudo bem?  ");
    expect(assunto).toBeNull();
    expect(corpo).toBe("Oi, tudo bem?");
  });

  it("delega para extrairMensagemEmail no canal email", () => {
    const texto = "ASSUNTO: Oi\nCORPO:\nMensagem";
    const { assunto, corpo } = extrairMensagem("email", texto);
    expect(assunto).toBe("Oi");
    expect(corpo).toBe("Mensagem");
  });
});
