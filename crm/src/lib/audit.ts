import { prisma } from "@/lib/prisma";

/** Registra uma ação no log de auditoria. Nunca inclua dados pessoais em `detalhe` (exigência de LGPD). */
export async function registrarAuditoria(params: {
  entidade: string;
  entidadeId: string;
  acao: string;
  detalhe?: string;
  usuarioId: string;
}) {
  await prisma.auditLog.create({ data: params });
}
