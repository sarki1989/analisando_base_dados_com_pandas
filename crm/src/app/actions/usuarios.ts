"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { usuarioSchema } from "@/lib/validation/usuario";
import type { FormState } from "./leads";

async function usuarioAdminLogado() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  if (session.user.papel !== "admin") throw new Error("Apenas administradores podem gerenciar usuários.");
  return session.user;
}

/** Garante que sempre sobre ao menos um administrador ativo no sistema. */
async function garantirAdminRestante(usuarioIdExcluido: string) {
  const outrosAdminsAtivos = await prisma.usuario.count({
    where: { papel: "admin", ativo: true, id: { not: usuarioIdExcluido } },
  });
  if (outrosAdminsAtivos === 0) {
    throw new Error("É preciso manter ao menos um administrador ativo.");
  }
}

export async function salvarUsuario(_prev: FormState, formData: FormData): Promise<FormState> {
  await usuarioAdminLogado();

  const parsed = usuarioSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const usuarioId = formData.get("usuarioId");
  const { senha, ...dados } = parsed.data;

  try {
    if (typeof usuarioId === "string" && usuarioId) {
      const atual = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
      if (atual.papel === "admin" && atual.ativo && dados.papel !== "admin") {
        await garantirAdminRestante(usuarioId);
      }

      await prisma.usuario.update({
        where: { id: usuarioId },
        data: { ...dados, ...(senha ? { senhaHash: await bcrypt.hash(senha, 10) } : {}) },
      });
    } else {
      if (!senha) return { erro: "Informe uma senha para o novo usuário." };
      await prisma.usuario.create({ data: { ...dados, senhaHash: await bcrypt.hash(senha, 10) } });
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { erro: "Já existe um usuário com esse e-mail." };
    }
    throw e;
  }

  revalidatePath("/configuracoes");
  return { sucesso: true };
}

export async function alternarAtivoUsuario(usuarioId: string, ativo: boolean) {
  const admin = await usuarioAdminLogado();

  if (!ativo) {
    if (usuarioId === admin.id) {
      throw new Error("Você não pode desativar sua própria conta.");
    }
    const alvo = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
    if (alvo.papel === "admin") {
      await garantirAdminRestante(usuarioId);
    }
  }

  await prisma.usuario.update({ where: { id: usuarioId }, data: { ativo } });
  revalidatePath("/configuracoes");
}
