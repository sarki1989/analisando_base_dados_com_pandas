import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfiguracaoForm } from "@/components/configuracoes/configuracao-form";
import { UsuarioDialog } from "@/components/configuracoes/usuario-dialog";
import { UsuarioRowActions } from "@/components/configuracoes/usuario-row-actions";
import { formatDataHora } from "@/lib/format";

export const metadata = { title: "Configurações — CRM Stokes Brasil" };

export default async function ConfiguracoesPage() {
  const session = await auth();
  const ehAdmin = session?.user.papel === "admin";

  const [config, auditoria, usuarios] = await Promise.all([
    prisma.configuracaoEmpresa.findUniqueOrThrow({ where: { id: "default" } }),
    ehAdmin
      ? prisma.auditLog.findMany({
          include: { usuario: { select: { nome: true } } },
          orderBy: { criadoEm: "desc" },
          take: 30,
        })
      : Promise.resolve([]),
    ehAdmin ? prisma.usuario.findMany({ orderBy: [{ ativo: "desc" }, { nome: "asc" }] }) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Dados da empresa, calculadora de preço e log de auditoria.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfiguracaoForm config={config} podeEditar={ehAdmin} />
        </CardContent>
      </Card>

      {ehAdmin && (
        <Card className="max-w-3xl">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Usuários</CardTitle>
            <UsuarioDialog />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id} className={!u.ativo ? "opacity-50" : undefined}>
                    <TableCell className="font-medium">
                      {u.nome}
                      {u.id === session?.user.id && (
                        <span className="ml-1 text-xs text-muted-foreground">(você)</span>
                      )}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {u.papel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <UsuarioRowActions usuario={u} ehVoceMesmo={u.id === session?.user.id} />
                    </TableCell>
                    <TableCell>
                      <UsuarioDialog usuario={u} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {ehAdmin && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">Log de auditoria</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-sm">
            {auditoria.length === 0 && <p className="text-muted-foreground">Nenhum registro ainda.</p>}
            {auditoria.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-border py-1.5 last:border-0">
                <span>
                  <span className="font-medium">{a.usuario.nome}</span>{" "}
                  <span className="text-muted-foreground">
                    {a.acao.replaceAll("_", " ")} · {a.entidade}
                    {a.detalhe ? ` (${a.detalhe})` : ""}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">{formatDataHora(a.criadoEm)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
