import {
  startOfMonth,
  startOfWeek,
  subWeeks,
  addWeeks,
  format,
  subMonths,
  addMonths,
  endOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import { prisma } from "@/lib/prisma";
import { ETAPAS_FUNIL, STATUS_LEAD } from "@/lib/enums";
import { horasAtras } from "@/lib/format";

const ETAPAS_ATIVAS = ETAPAS_FUNIL as readonly string[];

export async function getDashboardData() {
  const agora = new Date();
  const inicioMes = startOfMonth(agora);

  const [
    leadsNoMes,
    cotacoesNoMes,
    leadsAbertos,
    cotacoesAprovadas,
    cotacoesNaoRascunho,
    leadsTotal,
    leadsPorStatus,
    tarefasVencidas,
    cotacoesTodas,
    cliquesSemLeadTotal,
    cliquesTotal,
    leadsComAtribuicao,
  ] = await Promise.all([
    prisma.lead.count({ where: { criadoEm: { gte: inicioMes } } }),
    prisma.cotacao.count({ where: { emitidaEm: { gte: inicioMes }, status: { not: "rascunho" } } }),
    prisma.lead.findMany({
      where: { status: { in: ETAPAS_ATIVAS as string[] } },
      select: { valorEstimado: true },
    }),
    prisma.cotacao.findMany({ where: { status: "aprovada" }, select: { total: true } }),
    prisma.cotacao.count({ where: { status: { not: "rascunho" } } }),
    prisma.lead.count(),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
    prisma.tarefa.findMany({
      where: { concluidaEm: null, vencimentoEm: { lt: agora } },
      include: { lead: { select: { id: true, empresa: true } } },
      orderBy: { vencimentoEm: "asc" },
      take: 8,
    }),
    prisma.cotacao.findMany({
      where: { status: { notIn: ["aprovada", "perdida"] } },
      select: { id: true, numero: true, emitidaEm: true, validadeDias: true, total: true, lead: { select: { empresa: true } } },
    }),
    prisma.cliqueWhatsapp.count({ where: { leadId: null } }),
    prisma.cliqueWhatsapp.count(),
    prisma.lead.findMany({
      where: { atribuicao: { isNot: null } },
      select: { atribuicao: { select: { utmCampaign: true, utmSource: true } } },
    }),
  ]);

  const totalValorPipeline = leadsAbertos.reduce((acc, l) => acc + (l.valorEstimado ?? 0), 0);
  const taxaConversao = cotacoesNaoRascunho > 0 ? (cotacoesAprovadas.length / cotacoesNaoRascunho) * 100 : 0;
  const ticketMedio =
    cotacoesAprovadas.length > 0
      ? cotacoesAprovadas.reduce((acc, c) => acc + c.total, 0) / cotacoesAprovadas.length
      : 0;

  // Leads sem interação há mais de 3 dias em "Cotação enviada" ou "Em negociação".
  const leadsEmAlerta = await prisma.lead.findMany({
    where: {
      status: { in: ["Cotação enviada", "Em negociação"] },
      OR: [
        { ultimoContatoEm: { lt: horasAtras(72) } },
        { ultimoContatoEm: null, atualizadoEm: { lt: horasAtras(72) } },
      ],
    },
    select: { id: true, empresa: true, nome: true, status: true, ultimoContatoEm: true, atualizadoEm: true },
    orderBy: { atualizadoEm: "asc" },
  });

  // Cotações prestes a expirar (validade < 3 dias), calculado em memória pois validade é derivada.
  const cotacoesExpirando = cotacoesTodas
    .map((c) => {
      const validade = new Date(c.emitidaEm);
      validade.setDate(validade.getDate() + c.validadeDias);
      const diasRestantes = Math.ceil((validade.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));
      return { ...c, diasRestantes };
    })
    .filter((c) => c.diasRestantes <= 3)
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
    .slice(0, 8);

  // Leads por semana (últimas 8 semanas)
  const inicioJanela = startOfWeek(subWeeks(agora, 7), { weekStartsOn: 1 });
  const leadsRecentes = await prisma.lead.findMany({
    where: { criadoEm: { gte: inicioJanela } },
    select: { criadoEm: true },
  });
  const semanas: { semana: string; leads: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const inicioSemana = startOfWeek(addWeeks(inicioJanela, i), { weekStartsOn: 1 });
    const fimSemana = addWeeks(inicioSemana, 1);
    const count = leadsRecentes.filter((l) => l.criadoEm >= inicioSemana && l.criadoEm < fimSemana).length;
    semanas.push({ semana: format(inicioSemana, "dd/MM", { locale: ptBR }), leads: count });
  }

  // Leads por origem/campanha
  const contagemCampanha = new Map<string, number>();
  for (const l of leadsComAtribuicao) {
    const chave = l.atribuicao?.utmCampaign || l.atribuicao?.utmSource || "outra origem";
    contagemCampanha.set(chave, (contagemCampanha.get(chave) ?? 0) + 1);
  }
  const leadsPorCampanha = [...contagemCampanha.entries()]
    .map(([campanha, leads]) => ({ campanha, leads }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 6);
  const percentualSemAtribuicao =
    leadsTotal > 0 ? Math.round(((leadsTotal - leadsComAtribuicao.length) / leadsTotal) * 100) : 0;

  // Funil por etapa
  const contagemPorStatus = new Map(leadsPorStatus.map((g) => [g.status, g._count]));
  const funil = STATUS_LEAD.filter((s) => s !== "Ganho" && s !== "Perdido").map((status) => ({
    etapa: status,
    quantidade: contagemPorStatus.get(status) ?? 0,
  }));

  // Cotações emitidas vs. ganhas por mês (últimos 6 meses)
  const meses: { mes: string; emitidas: number; ganhas: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const refMes = subMonths(startOfMonth(agora), i);
    const inicio = refMes;
    const fim = i === 0 ? addMonths(refMes, 1) : endOfMonth(refMes);
    const [emitidas, ganhas] = await Promise.all([
      prisma.cotacao.count({ where: { emitidaEm: { gte: inicio, lt: fim }, status: { not: "rascunho" } } }),
      prisma.cotacao.count({ where: { emitidaEm: { gte: inicio, lt: fim }, status: "aprovada" } }),
    ]);
    meses.push({ mes: format(refMes, "MMM", { locale: ptBR }), emitidas, ganhas });
  }

  return {
    cards: {
      leadsNoMes,
      cotacoesNoMes,
      totalValorPipeline,
      taxaConversao,
      ticketMedio,
    },
    leadsEmAlerta,
    cotacoesExpirando,
    tarefasVencidas,
    leadsPorSemana: semanas,
    leadsPorCampanha,
    percentualSemAtribuicao,
    funil,
    cotacoesPorMes: meses,
    cliquesSemLeadTotal,
    cliquesTotal,
  };
}
