import { formatDataHora } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { Interacao, Usuario } from "@prisma/client";

type InteracaoComUsuario = Interacao & { usuario: Pick<Usuario, "nome"> };

export function InteracoesTimeline({ interacoes }: { interacoes: InteracaoComUsuario[] }) {
  if (interacoes.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma interação registrada ainda.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {interacoes.map((i) => (
        <li key={i.id} className="flex flex-col gap-0.5 border-l-2 border-border pl-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="capitalize">
              {i.tipo}
            </Badge>
            <span className="capitalize">{i.direcao}</span>
            <span>·</span>
            <span>{formatDataHora(i.data)}</span>
            <span>·</span>
            <span>{i.usuario.nome}</span>
          </div>
          <p className="text-sm">{i.resumo}</p>
        </li>
      ))}
    </ol>
  );
}
