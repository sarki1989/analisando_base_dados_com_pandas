"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { tarefaSchema } from "@/lib/validation/lead";
import type { FormState } from "./leads";

async function usuarioLogado() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  return session.user;
}

export async function criarTarefa(_prev: FormState, formData: FormData): Promise<FormState> {
  await usuarioLogado();

  const raw = Object.fromEntries(formData.entries());
  const parsed = tarefaSchema.safeParse(raw);
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const { vencimentoEm, leadId, ...resto } = parsed.data;

  await prisma.tarefa.create({
    data: {
      ...resto,
      leadId: leadId || null,
      vencimentoEm: new Date(vencimentoEm),
    },
  });

  revalidatePath("/tarefas");
  if (leadId) revalidatePath(`/leads/${leadId}`);
  return { sucesso: true };
}

export async function concluirTarefa(tarefaId: string, concluida: boolean) {
  await usuarioLogado();

  const tarefa = await prisma.tarefa.update({
    where: { id: tarefaId },
    data: { concluidaEm: concluida ? new Date() : null },
  });

  revalidatePath("/tarefas");
  if (tarefa.leadId) revalidatePath(`/leads/${tarefa.leadId}`);
}

export async function excluirTarefa(tarefaId: string) {
  await usuarioLogado();

  const tarefa = await prisma.tarefa.delete({ where: { id: tarefaId } });

  revalidatePath("/tarefas");
  if (tarefa.leadId) revalidatePath(`/leads/${tarefa.leadId}`);
}
