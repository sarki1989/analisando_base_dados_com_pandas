import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBRL, formatData } from "@/lib/format";
import { NovaCotacaoDialog } from "@/components/cotacoes/nova-cotacao-dialog";

export const metadata = { title: "Cotações — CRM Stokes Brasil" };

export default async function CotacoesPage() {
  const [cotacoes, leads] = await Promise.all([
    prisma.cotacao.findMany({
      include: { lead: { select: { id: true, empresa: true, nome: true } } },
      orderBy: { emitidaEm: "desc" },
    }),
    prisma.lead.findMany({ select: { id: true, nome: true, empresa: true }, orderBy: { empresa: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Cotações</h1>
          <p className="text-sm text-muted-foreground">{cotacoes.length} cotações emitidas.</p>
        </div>
        <NovaCotacaoDialog leads={leads} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Emitida em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cotacoes.map((c) => (
                <TableRow key={c.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/cotacoes/${c.id}`} className="block font-mono text-xs hover:underline">
                      {c.numero}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/cotacoes/${c.id}`} className="block">
                      {c.lead.empresa}
                    </Link>
                  </TableCell>
                  <TableCell>{formatData(c.emitidaEm)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatBRL(c.total)}</TableCell>
                </TableRow>
              ))}
              {cotacoes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Nenhuma cotação ainda. Crie uma a partir de um lead.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
