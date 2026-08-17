import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Dashboard — CRM Stokes Brasil" };

export default async function DashboardPage() {
  const [totalLeads, totalCotacoes, totalProdutos] = await Promise.all([
    prisma.lead.count(),
    prisma.cotacao.count(),
    prisma.produto.count({ where: { ativo: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do funil, cotações e campanhas será construída na Fase 5.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Leads cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totalLeads}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Cotações emitidas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totalCotacoes}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Produtos ativos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totalProdutos}</CardContent>
        </Card>
      </div>
    </div>
  );
}
