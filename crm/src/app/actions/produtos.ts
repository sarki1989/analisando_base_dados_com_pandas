"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { produtoSchema } from "@/lib/validation/produto";
import { calcularFatorPreco, calcularPrecoVenda } from "@/lib/cotacao";
import type { FormState } from "./leads";

async function usuarioLogado() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  return session.user;
}

async function salvarProduto(_prev: FormState, formData: FormData): Promise<FormState> {
  await usuarioLogado();

  const parsed = produtoSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const produtoId = formData.get("produtoId");
  const dados = parsed.data;

  try {
    if (typeof produtoId === "string" && produtoId) {
      await prisma.produto.update({ where: { id: produtoId }, data: dados });
    } else {
      await prisma.produto.create({ data: dados });
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { erro: "Já existe um produto com esse SKU." };
    }
    throw e;
  }

  revalidatePath("/produtos");
  return { sucesso: true };
}

export { salvarProduto };

export async function alternarAtivoProduto(produtoId: string, ativo: boolean) {
  await usuarioLogado();
  await prisma.produto.update({ where: { id: produtoId }, data: { ativo } });
  revalidatePath("/produtos");
}

export async function excluirProduto(produtoId: string) {
  await usuarioLogado();
  const emUso = await prisma.itemCotacao.count({ where: { produtoId } });
  if (emUso > 0) {
    throw new Error("Este produto já foi usado em cotações — desative em vez de excluir.");
  }
  await prisma.produto.delete({ where: { id: produtoId } });
  revalidatePath("/produtos");
}

/** Recalcula o precoBase de todos os produtos ativos a partir do custo e do fator configurado. */
export async function recalcularPrecosCatalogo() {
  const usuario = await usuarioLogado();
  if (usuario.papel !== "admin") throw new Error("Apenas administradores podem recalcular preços.");

  const config = await prisma.configuracaoEmpresa.findUniqueOrThrow({ where: { id: "default" } });
  const fator = calcularFatorPreco(config);

  const produtos = await prisma.produto.findMany({ where: { custoFornecedor: { not: null } } });

  await prisma.$transaction(
    produtos.map((p) =>
      prisma.produto.update({
        where: { id: p.id },
        data: { precoBase: calcularPrecoVenda(p.custoFornecedor!, fator) },
      })
    )
  );

  revalidatePath("/produtos");
  revalidatePath("/configuracoes");
}
