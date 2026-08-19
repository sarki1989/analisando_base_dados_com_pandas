import { prisma } from "@/lib/prisma";
import { garantirPedidoParaLead } from "@/app/actions/pedidos";
import { KanbanBoardLoader } from "@/components/pedidos/kanban-board-loader";

export const metadata = { title: "Pedidos — CRM Stokes Brasil" };

export default async function PedidosPage() {
  // Auto-recuperação: um lead pode virar "Ganho" arrastando o card no funil
  // ou por qualquer outro caminho que não passe por moverStatusLead, então
  // cobre o caso de o pedido não ter sido criado na hora.
  const leadsGanhoSemPedido = await prisma.lead.findMany({
    where: { status: "Ganho", pedidos: { none: {} } },
    select: { id: true },
  });
  for (const lead of leadsGanhoSemPedido) {
    await garantirPedidoParaLead(lead.id);
  }

  const pedidos = await prisma.pedido.findMany({
    include: {
      cotacao: { select: { id: true, numero: true, total: true } },
      lead: {
        select: {
          id: true,
          empresa: true,
          nome: true,
          valorEstimado: true,
          telefone: true,
          email: true,
          cotacoes: { select: { id: true, numero: true, status: true, total: true }, orderBy: { emitidaEm: "desc" } },
        },
      },
    },
    orderBy: { atualizadoEm: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe cada venda fechada até a entrega. Arraste os cards para mudar a etapa — o pedido
          entra aqui automaticamente quando o lead vira &quot;Ganho&quot;.
        </p>
      </div>
      <KanbanBoardLoader pedidos={pedidos} />
    </div>
  );
}
