"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { atualizarLead } from "@/app/actions/leads";
import { LeadForm } from "./lead-form";
import type { LeadComRelacoes } from "./types";

export function EditarLeadDialog({
  lead,
  usuarios,
}: {
  lead: LeadComRelacoes;
  usuarios: { id: string; nome: string }[];
}) {
  const [aberto, setAberto] = useState(false);
  const action = atualizarLead.bind(null, lead.id);

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar lead</DialogTitle>
        </DialogHeader>
        <LeadForm action={action} usuarios={usuarios} lead={lead} onSucesso={() => setAberto(false)} />
      </DialogContent>
    </Dialog>
  );
}
