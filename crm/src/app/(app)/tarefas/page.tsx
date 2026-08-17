import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TarefaForm } from "@/components/tarefas/tarefa-form";
import { TarefaItem } from "@/components/tarefas/tarefa-item";

export const metadata = { title: "Tarefas — CRM Stokes Brasil" };

export default async function TarefasPage() {
  const session = await auth();

  const [tarefas, usuarios] = await Promise.all([
    prisma.tarefa.findMany({
      include: {
        responsavel: { select: { nome: true } },
        lead: { select: { id: true, empresa: true } },
      },
      orderBy: { vencimentoEm: "asc" },
    }),
    prisma.usuario.findMany({ where: { ativo: true }, select: { id: true, nome: true } }),
  ]);

  const agora = new Date();
  const pendentes = tarefas.filter((t) => !t.concluidaEm);
  const atrasadas = pendentes.filter((t) => t.vencimentoEm < agora);
  const proximas = pendentes.filter((t) => t.vencimentoEm >= agora);
  const concluidas = tarefas.filter((t) => t.concluidaEm);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Tarefas</h1>
        <p className="text-sm text-muted-foreground">Follow-ups e lembretes, com ou sem lead vinculado.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Secao titulo={`Atrasadas (${atrasadas.length})`} destaque>
            {atrasadas.map((t) => (
              <TarefaItem key={t.id} tarefa={t} />
            ))}
            {atrasadas.length === 0 && <VazioMsg />}
          </Secao>

          <Secao titulo={`Próximas (${proximas.length})`}>
            {proximas.map((t) => (
              <TarefaItem key={t.id} tarefa={t} />
            ))}
            {proximas.length === 0 && <VazioMsg />}
          </Secao>

          {concluidas.length > 0 && (
            <Secao titulo={`Concluídas (${concluidas.length})`}>
              {concluidas.slice(0, 20).map((t) => (
                <TarefaItem key={t.id} tarefa={t} />
              ))}
            </Secao>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Nova tarefa</CardTitle>
          </CardHeader>
          <CardContent>
            {session?.user && <TarefaForm usuarios={usuarios} usuarioAtualId={session.user.id} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Secao({
  titulo,
  destaque,
  children,
}: {
  titulo: string;
  destaque?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className={destaque ? "text-sm font-semibold text-destructive" : "text-sm font-semibold"}>
        {titulo}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function VazioMsg() {
  return <p className="text-sm text-muted-foreground">Nada por aqui.</p>;
}
