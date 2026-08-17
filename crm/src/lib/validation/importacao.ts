import { z } from "zod";

import { SETORES_LEAD } from "@/lib/enums";

export const CAMPOS_IMPORTACAO_LEAD = [
  { chave: "nome", rotulo: "Nome do contato", obrigatorio: true },
  { chave: "empresa", rotulo: "Empresa", obrigatorio: true },
  { chave: "telefone", rotulo: "Telefone", obrigatorio: true },
  { chave: "email", rotulo: "E-mail", obrigatorio: false },
  { chave: "cidade", rotulo: "Cidade", obrigatorio: false },
  { chave: "uf", rotulo: "UF", obrigatorio: false },
  { chave: "setor", rotulo: "Setor", obrigatorio: false },
  { chave: "valorEstimado", rotulo: "Valor estimado", obrigatorio: false },
  { chave: "observacoes", rotulo: "Observações", obrigatorio: false },
] as const;

export const linhaImportacaoSchema = z.object({
  nome: z.string().min(1),
  empresa: z.string().min(1),
  telefone: z.string().min(8),
  email: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  setor: z
    .string()
    .optional()
    .transform((v) => {
      const encontrado = SETORES_LEAD.find((s) => s.toLowerCase() === v?.toLowerCase().trim());
      return encontrado ?? "outro";
    }),
  valorEstimado: z.coerce.number().optional().or(z.nan().transform(() => undefined)),
  observacoes: z.string().optional(),
});

export type LinhaImportacao = z.infer<typeof linhaImportacaoSchema>;
