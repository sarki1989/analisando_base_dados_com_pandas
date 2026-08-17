"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { criarLead } from "@/app/actions/leads";
import { LeadForm } from "./lead-form";

export function NovoLeadDialog({ usuarios }: { usuarios: { id: string; nome: string }[] }) {
  const [aberto, setAberto] = useState(false);

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo lead</DialogTitle>
        </DialogHeader>
        <LeadForm action={criarLead} usuarios={usuarios} onSucesso={() => setAberto(false)} />
      </DialogContent>
    </Dialog>
  );
}
