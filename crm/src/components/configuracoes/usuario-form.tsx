"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { salvarUsuario } from "@/app/actions/usuarios";
import { PAPEIS_USUARIO } from "@/lib/enums";
import type { Usuario } from "@prisma/client";

export function UsuarioForm({ usuario, onSucesso }: { usuario?: Usuario; onSucesso?: () => void }) {
  const [state, formAction, pending] = useActionState(salvarUsuario, {});

  useEffect(() => {
    if (state.sucesso) {
      toast.success(usuario ? "Usuário atualizado." : "Usuário criado.");
      onSucesso?.();
    }
    if (state.erro) toast.error(state.erro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {usuario && <input type="hidden" name="usuarioId" value={usuario.id} />}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="usuario-nome">Nome</Label>
        <Input id="usuario-nome" name="nome" defaultValue={usuario?.nome} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="usuario-email">E-mail</Label>
        <Input id="usuario-email" name="email" type="email" defaultValue={usuario?.email} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="usuario-papel">Papel</Label>
        <Select name="papel" defaultValue={usuario?.papel ?? "vendedor"}>
          <SelectTrigger id="usuario-papel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAPEIS_USUARIO.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="usuario-senha">{usuario ? "Nova senha" : "Senha"}</Label>
        <Input
          id="usuario-senha"
          name="senha"
          type="password"
          placeholder={usuario ? "Deixe em branco para manter" : ""}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : usuario ? "Salvar alterações" : "Criar usuário"}
      </Button>
    </form>
  );
}
