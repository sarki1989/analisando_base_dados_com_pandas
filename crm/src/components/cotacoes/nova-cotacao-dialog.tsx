"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type LeadOpcao = { id: string; nome: string; empresa: string };

export function NovaCotacaoDialog({ leads }: { leads: LeadOpcao[] }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [leadId, setLeadId] = useState("");

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <Button onClick={() => setAberto(true)}>
        <Plus />
        Nova cotação
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Para qual lead?</DialogTitle>
          <DialogDescription>Escolha o lead para montar a cotação.</DialogDescription>
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
          <Button disabled={!leadId} onClick={() => router.push(`/cotacoes/nova?leadId=${leadId}`)}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
