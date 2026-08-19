import type { Pedido, Cotacao, Lead } from "@prisma/client";

export type PedidoComRelacoes = Pedido & {
  cotacao: Pick<Cotacao, "id" | "numero" | "total"> | null;
  lead: Pick<Lead, "id" | "empresa" | "nome" | "valorEstimado" | "telefone" | "email"> & {
    cotacoes: Pick<Cotacao, "id" | "numero" | "status" | "total">[];
  };
};
