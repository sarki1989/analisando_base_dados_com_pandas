import { z } from "zod";

import { SETORES_LEAD } from "@/lib/enums";

/**
 * Payload aceito pelo endpoint público POST /api/leads/inbound
 * (formulário do site Wix, Zapier, etc). Nomes em snake_case para bater
 * com o que ferramentas de automação normalmente enviam.
 */
export const inboundLeadSchema = z.object({
  nome: z.string().min(1),
  empresa: z.string().min(1),
  telefone: z.string().min(8),
  email: z.string().email().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  setor: z.enum(SETORES_LEAD).optional().default("outro"),
  produto_interesse: z.array(z.string()).optional(),
  observacoes: z.string().optional(),
  consentimento_lgpd: z.boolean().optional().default(false),

  gclid: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  pagina_landing: z.string().optional(),
  referrer: z.string().optional(),
});

export type InboundLeadInput = z.infer<typeof inboundLeadSchema>;
