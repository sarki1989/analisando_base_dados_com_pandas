"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Sparkles, Copy, MessageCircle, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { gerarMensagem } from "@/app/actions/mensagens";
import { linkWhatsapp } from "@/lib/format";
import {
  TIPOS_MENSAGEM,
  ROTULOS_TIPO_MENSAGEM,
  CANAIS_MENSAGEM,
  ROTULOS_CANAL_MENSAGEM,
  type TipoMensagem,
  type CanalMensagem,
} from "@/lib/mensagens";

export function GeradorMensagemDialog({
  leadId,
  telefone,
  email,
  tipoInicial = "enviar_proposta",
  variant = "outline",
}: {
  leadId: string;
  telefone: string;
  email?: string | null;
  tipoInicial?: TipoMensagem;
  variant?: "outline" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<TipoMensagem>(tipoInicial);
  const [canal, setCanal] = useState<CanalMensagem>("whatsapp");
  const [assunto, setAssunto] = useState("");
  const [corpo, setCorpo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function gerar() {
    setErro(null);
    startTransition(async () => {
      try {
        const resultado = await gerarMensagem({ leadId, tipo, canal });
        setAssunto(resultado.assunto ?? "");
        setCorpo(resultado.corpo);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível gerar a mensagem.");
      }
    });
  }

  function copiar() {
    const texto = canal === "email" && assunto ? `Assunto: ${assunto}\n\n${corpo}` : corpo;
    navigator.clipboard.writeText(texto);
    toast.success("Mensagem copiada.");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setAssunto("");
          setCorpo("");
          setErro(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant={variant}>
          <Sparkles />
          Gerar mensagem com IA
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerador de mensagens com IA</DialogTitle>
          <DialogDescription>
            A mensagem é só um rascunho — revise antes de enviar. Nada é enviado automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Tipo de mensagem</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoMensagem)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_MENSAGEM.map((t) => (
                    <SelectItem key={t} value={t}>
                      {ROTULOS_TIPO_MENSAGEM[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Canal</Label>
              <Select value={canal} onValueChange={(v) => setCanal(v as CanalMensagem)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CANAIS_MENSAGEM.map((c) => (
                    <SelectItem key={c} value={c} disabled={c === "email" && !email}>
                      {ROTULOS_CANAL_MENSAGEM[c]}
                      {c === "email" && !email ? " (sem e-mail cadastrado)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="button" onClick={gerar} disabled={pending}>
            <Sparkles />
            {pending ? "Gerando..." : "Gerar mensagem"}
          </Button>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          {corpo && (
            <div className="flex flex-col gap-3">
              {canal === "email" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="gerador-assunto">Assunto</Label>
                  <Input id="gerador-assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)} />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gerador-corpo">Mensagem</Label>
                <Textarea
                  id="gerador-corpo"
                  rows={8}
                  value={corpo}
                  onChange={(e) => setCorpo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Fechar
          </Button>
          {corpo && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={copiar}>
                <Copy />
                Copiar
              </Button>
              {canal === "whatsapp" ? (
                <Button type="button" variant="accent" asChild>
                  <a href={linkWhatsapp(telefone, corpo)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle />
                    Abrir no WhatsApp
                  </a>
                </Button>
              ) : (
                email && (
                  <Button type="button" variant="accent" asChild>
                    <a
                      href={`mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`}
                    >
                      <Mail />
                      Abrir no e-mail
                    </a>
                  </Button>
                )
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
