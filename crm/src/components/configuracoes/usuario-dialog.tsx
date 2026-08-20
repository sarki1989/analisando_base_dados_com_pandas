"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UsuarioForm } from "./usuario-form";
import type { Usuario } from "@prisma/client";

export function UsuarioDialog({ usuario }: { usuario?: Usuario }) {
  const [aberto, setAberto] = useState(false);

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        {usuario ? (
          <Button variant="outline" size="icon">
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Plus />
            Novo usuário
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{usuario ? "Editar usuário" : "Novo usuário"}</DialogTitle>
        </DialogHeader>
        <UsuarioForm usuario={usuario} onSucesso={() => setAberto(false)} />
      </DialogContent>
    </Dialog>
  );
}
