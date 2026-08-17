import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { criarCotacao } from "@/app/actions/cotacoes";
import { CotacaoBuilder } from "@/components/cotacoes/cotacao-builder";

export const metadata = { title: "Nova cotação — CRM Stokes Brasil" };

export default async function NovaCotacaoPage(props: PageProps<"/cotacoes/nova">) {
  const { leadId } = await props.searchParams;
  const id = typeof leadId === "string" ? leadId : undefined;
  if (!id) notFound();

  const [lead, produtos, config] = await Promise.all([
    prisma.lead.findUnique({ where: { id } }),
    prisma.produto.findMany({ where: { ativo: true }, orderBy: { descricao: "asc" } }),
    prisma.configuracaoEmpresa.findUniqueOrThrow({ where: { id: "default" } }),
  ]);

  if (!lead) notFound();

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div>
        <Link
          href={`/leads/${lead.id}`}
          className="mb-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Voltar para {lead.empresa}
        </Link>
        <h1 className="text-xl font-semibold">Nova cotação</h1>
        <p className="text-sm text-muted-foreground">
          Para {lead.empresa} — {lead.nome}
        </p>
      </div>

      <CotacaoBuilder
        leadId={lead.id}
        produtos={produtos}
        action={criarCotacao}
        validadeDiasPadrao={config.validadeDiasPadrao}
      />
    </div>
  );
}
