import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { diasDesde } from "@/lib/format";

type LeadAlerta = {
  id: string;
  empresa: string;
  nome: string;
  status: string;
  ultimoContatoEm: Date | null;
  atualizadoEm: Date;
};

export function AlertaLeadsParados({ leads }: { leads: LeadAlerta[] }) {
  if (leads.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
        <AlertTriangle className="size-4" />
        {leads.length} lead{leads.length > 1 ? "s" : ""} sem contato há mais de 3 dias
      </div>
      <div className="flex flex-col gap-1">
        {leads.map((l) => {
          const dias = diasDesde(l.ultimoContatoEm ?? l.atualizadoEm);
          return (
            <Link
              key={l.id}
              href={`/leads/${l.id}`}
              className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-destructive/10"
            >
              <span>
                <span className="font-medium">{l.empresa}</span>{" "}
                <span className="text-muted-foreground">— {l.nome}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {l.status} · {dias}d parado
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
