import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfiguracaoForm } from "@/components/configuracoes/configuracao-form";
import { formatDataHora } from "@/lib/format";

export const metadata = { title: "Configurações — CRM Stokes Brasil" };

export default async function ConfiguracoesPage() {
  const session = await auth();
  const ehAdmin = session?.user.papel === "admin";

  const [config, auditoria] = await Promise.all([
    prisma.configuracaoEmpresa.findUniqueOrThrow({ where: { id: "default" } }),
    ehAdmin
      ? prisma.auditLog.findMany({
          include: { usuario: { select: { nome: true } } },
          orderBy: { criadoEm: "desc" },
          take: 30,
        })
      : Promise.resolve([]),
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
