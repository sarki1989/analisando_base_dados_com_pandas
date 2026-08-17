import { z } from "zod";

import { CONDICOES_FRETE, STATUS_COTACAO, MOTIVOS_PERDA } from "@/lib/enums";

export const itemCotacaoSchema = z
  .object({
    produtoId: z.string().optional(),
    descricaoLivre: z.string().optional(),
    quantidade: z.coerce.number().positive("Quantidade deve ser maior que zero"),
    precoUnitario: z.coerce.number().nonnegative(),
    desconto: z.coerce.number().nonnegative().optional().default(0),
  })
  .refine((item) => Boolean(item.produtoId) || Boolean(item.descricaoLivre?.trim()), {
    message: "Informe um produto do catálogo ou uma descrição livre para o item.",
  });

// Selects do Radix sem valor escolhido enviam "" (não ausência do campo) no
// FormData — trata como "não informado" antes de validar contra o enum.
const stringVazioParaUndefined = (v: unknown) => (v === "" ? undefined : v);

export const cotacaoFormSchema = z.object({
  leadId: z.string().min(1),
  condicaoPagamento: z.string().optional(),
  prazoFabricacao: z.string().optional(),
  frete: z.preprocess(stringVazioParaUndefined, z.enum(CONDICOES_FRETE).optional()),
  observacoes: z.string().optional(),
  validadeDias: z.coerce.number().int().positive(),
  desconto: z.coerce.number().nonnegative().optional().default(0),
  itensJson: z.string().min(1),
});

export const itensArraySchema = z.array(itemCotacaoSchema).min(1, "Adicione ao menos um item à cotação.");

export const mudarStatusCotacaoSchema = z.object({
  cotacaoId: z.string().min(1),
  status: z.enum(STATUS_COTACAO),
  motivoPerda: z.enum(MOTIVOS_PERDA).optional(),
});
