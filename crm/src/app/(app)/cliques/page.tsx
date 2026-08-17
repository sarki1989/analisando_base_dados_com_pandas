import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDataHora } from "@/lib/format";
import { VincularCliqueDialog } from "@/components/cliques/vincular-clique-dialog";

export const metadata = { title: "Cliques sem lead — CRM Stokes Brasil" };

export default async function CliquesPage() {
  const [cliques, totalCliques, leadsSemAtribuicao] = await Promise.all([
    prisma.cliqueWhatsapp.findMany({
      where: { leadId: null },
      orderBy: { criadoEm: "desc" },
      take: 100,
    }),
    prisma.cliqueWhatsapp.count(),
    prisma.lead.findMany({
      where: { atribuicao: null },
      select: { id: true, nome: true, empresa: true },
      orderBy: { criadoEm: "desc" },
      take: 50,
    }),
  ]);

  const percentualSemVinculo = totalCliques > 0 ? Math.round((cliques.length / totalCliques) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Cliques sem lead</h1>
        <p className="text-sm text-muted-foreground">
          Cliques no botão de WhatsApp do site que ainda não viraram (ou não foram vinculados a) um
          lead. {totalCliques > 0 && `${percentualSemVinculo}% dos ${totalCliques} cliques registrados.`}
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Página</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {cliques.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.codigo}</TableCell>
                  <TableCell>{formatDataHora(c.criadoEm)}</TableCell>
                  <TableCell>
                    {c.origem ? (
                      <Badge variant="outline">{c.origem}</Badge>
                    ) : c.utmSource ? (
                      <span>
                        {c.utmSource}
                        {c.utmMedium ? ` / ${c.utmMedium}` : ""}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">orgânico / direto</span>
                    )}
                  </TableCell>
                  <TableCell>{c.utmCampaign || "—"}</TableCell>
                  <TableCell className="capitalize">{c.dispositivo || "—"}</TableCell>
                  <TableCell className="max-w-48 truncate text-xs text-muted-foreground">
                    {c.paginaLanding || "—"}
                  </TableCell>
                  <TableCell>
                    <VincularCliqueDialog cliqueId={c.id} leads={leadsSemAtribuicao} />
                  </TableCell>
                </TableRow>
              ))}
              {cliques.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Nenhum clique pendente. Todos os cliques recentes já viraram lead.
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
