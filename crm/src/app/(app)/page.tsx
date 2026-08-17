import Link from "next/link";
import { CalendarClock, MousePointerClick, Timer } from "lucide-react";

import { getDashboardData } from "@/lib/dashboard-data";
import { formatBRL, formatDataHora } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertaLeadsParados } from "@/components/dashboard/alerta-leads-parados";
import { LeadsPorSemanaChart } from "@/components/dashboard/leads-por-semana-chart";
import { LeadsPorCampanhaChart } from "@/components/dashboard/leads-por-campanha-chart";
import { FunilChart } from "@/components/dashboard/funil-chart";
import { CotacoesPorMesChart } from "@/components/dashboard/cotacoes-por-mes-chart";

export const metadata = { title: "Dashboard — CRM Stokes Brasil" };

export default async function DashboardPage() {
  const dados = await getDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do funil, cotações e campanhas.</p>
      </div>

      <AlertaLeadsParados leads={dados.leadsEmAlerta} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <CardMetrica titulo="Leads no mês" valor={String(dados.cards.leadsNoMes)} />
        <CardMetrica titulo="Cotações enviadas no mês" valor={String(dados.cards.cotacoesNoMes)} />
        <CardMetrica titulo="Pipeline aberto" valor={formatBRL(dados.cards.totalValorPipeline)} />
        <CardMetrica titulo="Conversão cotação→ganho" valor={`${dados.cards.taxaConversao.toFixed(0)}%`} />
        <CardMetrica titulo="Ticket médio" valor={formatBRL(dados.cards.ticketMedio)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads por semana</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadsPorSemanaChart dados={dados.leadsPorSemana} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads por origem/campanha</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadsPorCampanhaChart dados={dados.leadsPorCampanha} />
            <p className="mt-2 text-xs text-muted-foreground">
              {dados.percentualSemAtribuicao}% dos leads não têm origem de campanha identificada.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funil por etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <FunilChart dados={dados.funil} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cotações emitidas vs. ganhas por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <CotacoesPorMesChart dados={dados.cotacoesPorMes} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ListaCard
          titulo="Follow-ups vencidos"
          icone={<Timer className="size-4" />}
          verTodos="/tarefas"
          vazio="Nenhuma tarefa atrasada."
        >
          {dados.tarefasVencidas.map((t) => (
            <Link
              key={t.id}
              href={t.lead ? `/leads/${t.lead.id}` : "/tarefas"}
              className="flex flex-col gap-0.5 rounded px-2 py-1.5 hover:bg-secondary"
            >
              <span className="text-sm font-medium">{t.titulo}</span>
              <span className="text-xs text-muted-foreground">
                {formatDataHora(t.vencimentoEm)}
                {t.lead ? ` · ${t.lead.empresa}` : ""}
              </span>
            </Link>
          ))}
        </ListaCard>

        <ListaCard
          titulo="Cotações prestes a expirar"
          icone={<CalendarClock className="size-4" />}
          verTodos="/cotacoes"
          vazio="Nenhuma cotação expirando nos próximos dias."
        >
          {dados.cotacoesExpirando.map((c) => (
            <Link
              key={c.id}
              href={`/cotacoes/${c.id}`}
              className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-secondary"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{c.numero}</span>
                <span className="text-xs text-muted-foreground">{c.lead.empresa} · {formatBRL(c.total)}</span>
              </div>
              <Badge variant={c.diasRestantes < 0 ? "destructive" : "warning"}>
                {c.diasRestantes < 0 ? "expirada" : `${c.diasRestantes}d`}
              </Badge>
            </Link>
          ))}
        </ListaCard>

        <ListaCard
          titulo="Cliques de WhatsApp sem lead"
          icone={<MousePointerClick className="size-4" />}
          verTodos="/cliques"
          vazio="Nenhum clique pendente de vínculo."
        >
          {dados.cliquesSemLeadTotal > 0 && (
            <div className="px-2 py-1.5 text-sm">
              <span className="font-medium">{dados.cliquesSemLeadTotal}</span> de {dados.cliquesTotal} cliques
              ainda não viraram lead.{" "}
              <Link href="/cliques" className="text-accent hover:underline">
                Ver cliques
              </Link>
            </div>
          )}
        </ListaCard>
      </div>
    </div>
  );
}

function CardMetrica({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground">{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="text-xl font-semibold">{valor}</CardContent>
    </Card>
  );
}

function ListaCard({
  titulo,
  icone,
  verTodos,
  vazio,
  children,
}: {
  titulo: string;
  icone: React.ReactNode;
  verTodos: string;
  vazio: string;
  children: React.ReactNode;
}) {
  const temConteudo = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          {icone}
          {titulo}
        </CardTitle>
        <Link href={verTodos} className="text-xs text-accent hover:underline">
          Ver todos
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 p-2 pt-0">
        {temConteudo ? children : <p className="px-2 py-1.5 text-sm text-muted-foreground">{vazio}</p>}
      </CardContent>
    </Card>
  );
}
