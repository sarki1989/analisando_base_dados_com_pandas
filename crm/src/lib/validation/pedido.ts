import { z } from "zod";

import { STATUS_PEDIDO } from "@/lib/enums";

const stringVazioParaUndefined = (v: unknown) => (v === "" ? undefined : v);

export const mudarStatusPedidoSchema = z.object({
  pedidoId: z.string().min(1),
  status: z.enum(STATUS_PEDIDO),
});

export const editarPedidoSchema = z.object({
  pedidoId: z.string().min(1),
  cotacaoId: z.preprocess(stringVazioParaUndefined, z.string().optional()),
  fornecedor: z.string().optional(),
  numeroPedidoFornecedor: z.string().optional(),
  transportadora: z.string().optional(),
  codigoRastreio: z.string().optional(),
  observacoes: z.string().optional(),
});
