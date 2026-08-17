"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatTelefone } from "@/lib/format";

type ResultadoLead = { id: string; nome: string; empresa: string; telefone: string; status: string };
type ResultadoCotacao = { id: string; numero: string; status: string; total: number; lead: { empresa: string } };

export function GlobalSearch() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const [leads, setLeads] = useState<ResultadoLead[]>([]);
  const [cotacoes, setCotacoes] = useState<ResultadoCotacao[]>([]);
  const [buscando, setBuscando] = useState(false);

  const termoValido = termo.trim().length >= 2;

  useEffect(() => {
    if (!termoValido) return;

    const timeout = setTimeout(() => {
      setBuscando(true);
      fetch(`/api/search?q=${encodeURIComponent(termo)}`)
        .then((r) => r.json())
        .then((data) => {
          setLeads(data.leads ?? []);
          setCotacoes(data.cotacoes ?? []);
        })
        .finally(() => setBuscando(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [termo, termoValido]);

  function irPara(href: string) {
    setAberto(false);
    setTermo("");
    router.push(href);
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="text-muted-foreground sm:w-full sm:max-w-xs sm:justify-start sm:px-3"
        onClick={() => setAberto(true)}
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden sm:inline">Buscar leads, cotações...</span>
      </Button>

      <Dialog
        open={aberto}
        onOpenChange={(v) => {
          setAberto(v);
          if (!v) setTermo("");
        }}
      >
        <DialogContent className="max-w-lg p-0">
          <DialogHeader className="border-b border-border p-4 pb-3">
            <DialogTitle className="sr-only">Busca global</DialogTitle>
            <Input
              autoFocus
              placeholder="Nome, empresa, telefone ou número da cotação..."
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
            />
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto p-2">
            {buscando && <p className="px-2 py-3 text-sm text-muted-foreground">Buscando...</p>}

            {!buscando && termoValido && leads.length === 0 && cotacoes.length === 0 && (
              <p className="px-2 py-3 text-sm text-muted-foreground">Nada encontrado.</p>
            )}

            {termoValido && leads.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Leads</p>
                {leads.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => irPara(`/leads/${l.id}`)}
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-secondary"
                  >
                    <span>
                      <span className="font-medium">{l.empresa}</span>{" "}
                      <span className="text-muted-foreground">— {l.nome} · {formatTelefone(l.telefone)}</span>
                    </span>
                    <Badge variant="outline">{l.status}</Badge>
                  </button>
                ))}
              </div>
            )}

            {termoValido && cotacoes.length > 0 && (
              <div>
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Cotações</p>
                {cotacoes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => irPara(`/cotacoes/${c.id}`)}
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-secondary"
                  >
                    <span>
                      <span className="font-mono">{c.numero}</span>{" "}
                      <span className="text-muted-foreground">— {c.lead.empresa}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{formatBRL(c.total)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
