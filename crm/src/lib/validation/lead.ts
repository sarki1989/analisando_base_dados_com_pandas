import { z } from "zod";

import { MOTIVOS_PERDA, SETORES_LEAD, STATUS_LEAD } from "@/lib/enums";

export const leadSchema = z.object({
  nome: z.string().min(1, "Informe o nome do contato"),
  empresa: z.string().min(1, "Informe a empresa"),
  cnpj: z.string().optional(),
  telefone: z.string().min(8, "Informe um telefone válido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  setor: z.enum(SETORES_LEAD),
  produtoInteresse: z.array(z.string()).optional(),
  valorEstimado: z.coerce.number().nonnegative().optional().or(z.nan().transform(() => undefined)),
  observacoes: z.string().optional(),
  consentimentoLgpd: z.boolean().default(false),
  responsavelId: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const moverStatusSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum(STATUS_LEAD),
  motivoPerda: z.enum(MOTIVOS_PERDA).optional(),
});

export const interacaoSchema = z.object({
  leadId: z.string().min(1),
  tipo: z.string().min(1),
  direcao: z.string().min(1),
  resumo: z.string().min(1, "Descreva a interação"),
});

export const tarefaSchema = z.object({
  leadId: z.string().optional(),
  titulo: z.string().min(1, "Informe o título"),
  descricao: z.string().optional(),
  vencimentoEm: z.string().min(1, "Informe o vencimento"),
  prioridade: z.string().min(1),
  responsavelId: z.string().min(1, "Informe o responsável"),
});
