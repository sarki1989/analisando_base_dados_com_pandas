import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBRL, linkWhatsapp } from "@/lib/format";

export function EnviarWhatsappButton({
  telefone,
  numero,
  total,
  validadeDias,
}: {
  telefone: string;
  numero: string;
  total: number;
  validadeDias: number;
}) {
  const mensagem = `Olá! Segue a cotação ${numero} no valor de ${formatBRL(total)}, válida por ${validadeDias} dias. Vou anexar o PDF aqui em seguida.`;

  return (
    <Button variant="accent" asChild>
      <a href={linkWhatsapp(telefone, mensagem)} target="_blank" rel="noopener noreferrer">
        <MessageCircle />
        Enviar por WhatsApp
      </a>
    </Button>
  );
}
