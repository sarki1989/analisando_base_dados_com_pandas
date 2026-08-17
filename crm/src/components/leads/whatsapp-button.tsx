"use client";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { registrarAberturaWhatsapp } from "@/app/actions/leads";
import { linkWhatsapp } from "@/lib/format";

export function WhatsappButton({ leadId, telefone }: { leadId: string; telefone: string }) {
  return (
    <Button
      variant="accent"
      asChild
      onClick={() => {
        void registrarAberturaWhatsapp(leadId);
      }}
    >
      <a href={linkWhatsapp(telefone)} target="_blank" rel="noopener noreferrer">
        <MessageCircle />
        Abrir WhatsApp
      </a>
    </Button>
  );
}
