"use client";

import { useState, useTransition } from "react";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { vincularCliqueALead } from "@/app/actions/cliques";

type LeadOpcao = { id: string; nome: string; empresa: string };

export function VincularCliqueDialog({ cliqueId, leads }: { cliqueId: string; leads: LeadOpcao[] }) {
  const [aberto, setAberto] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [pending, startTransition] = useTransition();

  function confirmar() {
    startTransition(async () => {
      try {
        await vincularCliqueALead(cliqueId, leadId);
        toast.success("Clique vinculado ao lead.");
        setAberto(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Não foi possível vincular.");
      }
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 />
          Vincular
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular clique a um lead</DialogTitle>
          <DialogDescription>
            Preenche a atribuição do lead escolhido com os dados deste clique (campanha, gclid, etc).
          </DialogDescription>
        </DialogHeader>
        <Select value={leadId} onValueChange={setLeadId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um lead" />
          </SelectTrigger>
          <SelectContent>
            {leads.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.empresa} — {l.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAberto(false)}>
            Cancelar
          </Button>
          <Button disabled={!leadId || pending} onClick={confirmar}>
            {pending ? "Vinculando..." : "Vincular"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
