import { prisma } from "@/lib/prisma";
import { KanbanBoardLoader } from "@/components/leads/kanban-board-loader";
import { NovoLeadDialog } from "@/components/leads/novo-lead-dialog";

export const metadata = { title: "Leads — CRM Stokes Brasil" };

export default async function LeadsPage() {
  const [leads, usuarios] = await Promise.all([
    prisma.lead.findMany({
      include: { responsavel: { select: { id: true, nome: true } } },
      orderBy: { atualizadoEm: "desc" },
    }),
    prisma.usuario.findMany({ where: { ativo: true }, select: { id: true, nome: true } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Leads</h1>
          <p className="text-sm text-muted-foreground">Arraste os cards para mudar a etapa do funil.</p>
        </div>
        <NovoLeadDialog usuarios={usuarios} />
      </div>
      <KanbanBoardLoader leads={leads} />
    </div>
  );
}
