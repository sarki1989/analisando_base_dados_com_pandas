import { z } from "zod";

import { CATEGORIAS_PRODUTO } from "@/lib/enums";

export const produtoSchema = z.object({
  sku: z.string().min(1, "Informe o SKU"),
  descricao: z.string().min(1, "Informe a descrição"),
  categoria: z.enum(CATEGORIAS_PRODUTO),
  diametro: z.string().optional(),
  unidade: z.string().min(1),
  custoFornecedor: z.coerce.number().nonnegative().optional().or(z.nan().transform(() => undefined)),
  precoBase: z.coerce.number().nonnegative(),
});

export type ProdutoInput = z.infer<typeof produtoSchema>;
