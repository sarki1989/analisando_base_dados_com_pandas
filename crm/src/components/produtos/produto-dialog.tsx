"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProdutoForm } from "./produto-form";
import type { Produto } from "@prisma/client";

export function ProdutoDialog({ produto }: { produto?: Produto }) {
  const [aberto, setAberto] = useState(false);

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        {produto ? (
          <Button variant="outline" size="icon">
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Plus />
            Novo produto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{produto ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>
        <ProdutoForm produto={produto} onSucesso={() => setAberto(false)} />
      </DialogContent>
    </Dialog>
  );
}
