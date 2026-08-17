"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { calcularFatorPreco } from "@/lib/cotacao";

const schema = z.object({
  razaoSocial: z.string().min(1),
  nomeFantasia: z.string().min(1),
  cnpj: z.string().min(1),
  inscricaoEstadual: z.string().optional(),
  endereco: z.string().min(1),
  telefone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  site: z.string().optional(),
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  pixChave: z.string().optional(),
  whatsappNumero: z.string().min(8),
  rodapePdf: z.string().optional(),
  impostoPercent: z.coerce.number().min(0),
  margemPercent: z.coerce.number().min(0),
  despesasPercent: z.coerce.number().min(0),
  validadeDiasPadrao: z.coerce.number().int().positive(),
});

export type SalvarConfiguracaoState = { erro?: string; sucesso?: boolean };

export async function salvarConfiguracao(
  _prev: SalvarConfiguracaoState,
  formData: FormData
): Promise<SalvarConfiguracaoState> {
  const session = await auth();
  if (!session?.user) return { erro: "Não autenticado." };
  if (session.user.papel !== "admin") return { erro: "Apenas administradores podem editar." };

  const dados = Object.fromEntries(formData.entries());
  const resultado = schema.safeParse(dados);
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    calcularFatorPreco(resultado.data);
  } catch (e) {
    return { erro: e instanceof Error ? e.message : "Percentuais inválidos." };
  }

  await prisma.configuracaoEmpresa.update({
    where: { id: "default" },
    data: resultado.data,
  });

  revalidatePath("/configuracoes");
  return { sucesso: true };
}
