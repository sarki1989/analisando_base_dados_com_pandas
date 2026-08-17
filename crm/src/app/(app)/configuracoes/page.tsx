import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfiguracaoForm } from "@/components/configuracoes/configuracao-form";

export const metadata = { title: "Configurações — CRM Stokes Brasil" };

export default async function ConfiguracoesPage() {
  const session = await auth();
  const config = await prisma.configuracaoEmpresa.findUniqueOrThrow({ where: { id: "default" } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Dados da empresa usados nas cotações em PDF. A calculadora de preço (fator sobre o custo)
          será adicionada aqui na Fase 4.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfiguracaoForm config={config} podeEditar={session?.user.papel === "admin"} />
        </CardContent>
      </Card>
    </div>
  );
}
