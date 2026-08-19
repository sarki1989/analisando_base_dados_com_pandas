import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Download } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatData, formatTelefone } from "@/lib/format";
import { paraArrayJSON } from "@/lib/json-array";
import { StatusChanger } from "@/components/leads/status-changer";
import { WhatsappButton } from "@/components/leads/whatsapp-button";
import { EditarLeadDialog } from "@/components/leads/editar-lead-dialog";
import { ExcluirLeadButton } from "@/components/leads/excluir-lead-button";
import { GeradorMensagemDialog } from "@/components/leads/gerador-mensagem-dialog";
import { InteracaoForm } from "@/components/leads/interacao-form";
import { InteracoesTimeline } from "@/components/leads/interacoes-timeline";
import { TarefaForm } from "@/components/tarefas/tarefa-form";
import { TarefaItem } from "@/components/tarefas/tarefa-item";

export default async function LeadDetalhePage(props: PageProps<"/leads/[id]">) {
  const { id } = await props.params;

  const [lead, usuarios, session] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        responsavel: { select: { id: true, nome: true } },
        atribuicao: true,
        interacoes: { include: { usuario: { select: { nome: true } } }, orderBy: { data: "desc" } },
        tarefas: {
          include: { responsavel: { select: { nome: true } }, lead: { select: { id: true, empresa: true } } },
          orderBy: { vencimentoEm: "asc" },
        },
        cotacoes: { orderBy: { emitidaEm: "desc" } },
      },
    }),
    prisma.usuario.findMany({ where: { ativo: true }, select: { id: true, nome: true } }),
    auth(),
  ]);

  if (!lead) notFound();

  const produtos = paraArrayJSON(lead.produtoInteresse);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/leads" className="mb-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Voltar ao funil
          </Link>
          <h1 className="text-xl font-semibold">{lead.empresa}</h1>
          <p className="text-sm text-muted-foreground">
            {lead.nome} · {formatTelefone(lead.telefone)}
            {lead.email ? ` · ${lead.email}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChanger leadId={lead.id} statusAtual={lead.status} />
          <WhatsappButton leadId={lead.id} telefone={lead.telefone} />
          <GeradorMensagemDialog
            leadId={lead.id}
            telefone={lead.telefone}
            email={lead.email}
            tipoInicial={
              ["Cotação enviada", "Em negociação"].includes(lead.status) ? "retomar_contato" : "enviar_proposta"
            }
          />
          <EditarLeadDialog lead={lead} usuarios={usuarios} />
          {session?.user.papel === "admin" && <ExcluirLeadButton leadId={lead.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do lead</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <Linha label="Setor" valor={<span className="capitalize">{lead.setor}</span>} />
            <Linha label="Cidade/UF" valor={[lead.cidade, lead.uf].filter(Boolean).join(" / ") || "—"} />
            <Linha label="CNPJ" valor={lead.cnpj || "—"} />
            <Linha label="Valor estimado" valor={formatBRL(lead.valorEstimado)} />
            <Linha label="Responsável" valor={lead.responsavel?.nome ?? "—"} />
            <Linha label="Criado em" valor={formatData(lead.criadoEm)} />
            <Linha label="Último contato" valor={formatData(lead.ultimoContatoEm)} />
            {lead.motivoPerda && <Linha label="Motivo da perda" valor={<span className="capitalize">{lead.motivoPerda}</span>} />}
            {produtos.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {produtos.map((p) => (
                  <Badge key={p} variant="secondary">
                    {p}
                  </Badge>
                ))}
              </div>
            )}
            {lead.observacoes && (
              <p className="pt-2 whitespace-pre-wrap text-muted-foreground">{lead.observacoes}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Origem</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {lead.atribuicao ? (
              <>
                <Linha label="Campanha" valor={lead.atribuicao.utmCampaign || "—"} />
                <Linha label="Origem/Mídia" valor={[lead.atribuicao.utmSource, lead.atribuicao.utmMedium].filter(Boolean).join(" / ") || "—"} />
                <Linha label="Termo" valor={lead.atribuicao.utmTerm || "—"} />
                <Linha label="Página" valor={lead.atribuicao.paginaLanding || "—"} />
              </>
            ) : (
              <p className="text-muted-foreground">
                Sem atribuição vinculada. Assim que a captura por WhatsApp estiver ativa (Fase 3), será
                possível vincular este lead a um clique.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Cotações</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href={`/cotacoes/nova?leadId=${lead.id}`}>
                <Plus />
                Nova
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {lead.cotacoes.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma cotação ainda.</p>
            ) : (
              lead.cotacoes.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-secondary">
                  <Link href={`/cotacoes/${c.id}`} className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="font-mono text-xs">{c.numero}</span>
                    <span className="font-medium">{formatBRL(c.total)}</span>
                    <Badge variant="outline" className="capitalize">
                      {c.status}
                    </Badge>
                  </Link>
                  {c.status !== "rascunho" && (
                    <a
                      href={`/api/cotacoes/${c.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Baixar a proposta comercial (PDF)"
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <Download className="size-4" />
                    </a>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interações</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <InteracaoForm leadId={lead.id} />
            <InteracoesTimeline interacoes={lead.interacoes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tarefas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {session?.user && (
              <TarefaForm leadId={lead.id} usuarios={usuarios} usuarioAtualId={session.user.id} />
            )}
            <div className="flex flex-col gap-2">
              {lead.tarefas.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma tarefa para este lead.</p>
              )}
              {lead.tarefas.map((t) => (
                <TarefaItem key={t.id} tarefa={t} mostrarLead={false} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Linha({ label, valor }: { label: string; valor: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{valor}</span>
    </div>
  );
}
