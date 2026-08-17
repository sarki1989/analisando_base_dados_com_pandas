import type { Lead, Usuario } from "@prisma/client";

export type LeadComRelacoes = Lead & {
  responsavel: Pick<Usuario, "id" | "nome"> | null;
};
