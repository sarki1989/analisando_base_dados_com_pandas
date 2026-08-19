import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { atualizarCotacao } from "@/app/actions/cotacoes";
import { formatBRL, formatData, diasAte } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { CotacaoStatusChanger } from "@/components/cotacoes/cotacao-status-changer";
import { CotacaoBuilder } from "@/components/cotacoes/cotacao-builder";
import { CotacaoView } from "@/components/cotacoes/cotacao-view";
import { EnviarWhatsappButton } from "@/components/cotacoes/enviar-whatsapp-button";
import { BaixarPdfButton, DuplicarCotacaoButton, ExcluirCotacaoButton } from "@/components/cotacoes/cotacao-actions";
import { GeradorMensagemDialog } from "@/components/leads/gerador-mensagem-dialog";

export default async function CotacaoDetalhePage(props: PageProps<"/cotacoes/[id]">) {
  const { id } = await props.params;

  const [cotacao, produtos, config] = await Promise.all([
    prisma.cotacao.findUnique({
      where: { id },
      include: {
        lead: true,
        itens: { include: { produto: true }, orderBy: { ordem: "asc" } },
      },
    }),
    prisma.produto.findMany({ where: { ativo: true }, orderBy: { descricao: "asc" } }),
    prisma.configuracaoEmpresa.findUniqueOrThrow({ where: { id: "default" } }),
  ]);

  if (!cotacao) notFound();

  const ehRascunho = cotacao.status === "rascunho";
  const validade = new Date(cotacao.emitidaEm);
  validade.setDate(validade.getDate() + cotacao.validadeDias);
  const diasParaExpirar = diasAte(validade);

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/leads/${cotacao.lead.id}`}
            className="mb-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> {cotacao.lead.empresa}
          </Link>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            {cotacao.numero}
            {cotacao.revisaoNumero > 1 && <Badge variant="outline">revisão {cotacao.revisaoNumero}</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground">
            Emitida em {formatData(cotacao.emitidaEm)} · Válida até {formatData(validade)}
            {!ehRascunho && diasParaExpirar >= 0 && diasParaExpirar <= 3 && (
              <span className="ml-1 font-medium text-destructive">(expira em {diasParaExpirar}d)</span>
            )}
            {" · "}
            {formatBRL(cotacao.total)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CotacaoStatusChanger cotacaoId={cotacao.id} statusAtual={cotacao.status} />
          <EnviarWhatsappButton
            telefone={cotacao.lead.telefone}
            numero={cotacao.numero}
            total={cotacao.total}
            validadeDias={cotacao.validadeDias}
          />
          <BaixarPdfButton cotacaoId={cotacao.id} />
          {!ehRascunho && (
            <GeradorMensagemDialog
              leadId={cotacao.lead.id}
              telefone={cotacao.lead.telefone}
              email={cotacao.lead.email}
              tipoInicial="enviar_proposta"
            />
          )}
          <DuplicarCotacaoButton cotacaoId={cotacao.id} />
          {ehRascunho && <ExcluirCotacaoButton cotacaoId={cotacao.id} />}
        </div>
      </div>

      {ehRascunho ? (
        <CotacaoBuilder
          leadId={cotacao.lead.id}
          produtos={produtos}
          action={atualizarCotacao.bind(null, cotacao.id)}
          validadeDiasPadrao={config.validadeDiasPadrao}
          cotacao={{
            condicaoPagamento: cotacao.condicaoPagamento,
            prazoFabricacao: cotacao.prazoFabricacao,
            frete: cotacao.frete,
            observacoes: cotacao.observacoes,
            validadeDias: cotacao.validadeDias,
            desconto: cotacao.desconto,
            itens: cotacao.itens.map((item) => ({
              produtoId: item.produtoId,
              descricaoLivre: item.descricaoLivre,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
              desconto: item.desconto,
            })),
          }}
        />
      ) : (
        <CotacaoView
          itens={cotacao.itens.map((item) => ({
            id: item.id,
            descricao: item.produto ? `${item.produto.sku} — ${item.produto.descricao}` : item.descricaoLivre || "Item",
            quantidade: item.quantidade,
            unidade: item.produto?.unidade || "un",
            precoUnitario: item.precoUnitario,
            desconto: item.desconto,
            total: item.total,
          }))}
          condicaoPagamento={cotacao.condicaoPagamento}
          prazoFabricacao={cotacao.prazoFabricacao}
          frete={cotacao.frete}
          observacoes={cotacao.observacoes}
          subtotal={cotacao.subtotal}
          desconto={cotacao.desconto}
          total={cotacao.total}
        />
      )}
    </div>
  );
}
