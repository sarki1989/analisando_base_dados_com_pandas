"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { alternarAtivoUsuario } from "@/app/actions/usuarios";
import type { Usuario } from "@prisma/client";

export function UsuarioRowActions({ usuario, ehVoceMesmo }: { usuario: Usuario; ehVoceMesmo: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={usuario.ativo}
      disabled={pending || ehVoceMesmo}
      title={ehVoceMesmo ? "Você não pode desativar sua própria conta" : undefined}
      onCheckedChange={(v) =>
        startTransition(async () => {
          try {
            await alternarAtivoUsuario(usuario.id, v);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Não foi possível alterar o usuário.");
          }
        })
      }
    />
  );
}
