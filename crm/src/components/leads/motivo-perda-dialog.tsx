"use client";

import { useState } from "react";

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
import { MOTIVOS_PERDA, type MotivoPerda } from "@/lib/enums";

export function MotivoPerdaDialog({
  open,
  onConfirmar,
  onCancelar,
}: {
  open: boolean;
  onConfirmar: (motivo: MotivoPerda) => void;
  onCancelar: () => void;
}) {
  const [motivo, setMotivo] = useState<MotivoPerda | "">("");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancelar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Por que este lead foi perdido?</DialogTitle>
          <DialogDescription>O motivo é obrigatório para mover para “Perdido”.</DialogDescription>
        </DialogHeader>
        <Select value={motivo} onValueChange={(v) => setMotivo(v as MotivoPerda)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o motivo" />
          </SelectTrigger>
          <SelectContent>
            {MOTIVOS_PERDA.map((m) => (
              <SelectItem key={m} value={m} className="capitalize">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={!motivo}
            onClick={() => motivo && onConfirmar(motivo)}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
