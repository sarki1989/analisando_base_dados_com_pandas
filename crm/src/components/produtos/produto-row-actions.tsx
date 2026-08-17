"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { alternarAtivoProduto, excluirProduto } from "@/app/actions/produtos";
import type { Produto } from "@prisma/client";

export function ProdutoRowActions({ produto }: { produto: Produto }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={produto.ativo}
        disabled={pending}
        onCheckedChange={(v) => startTransition(() => alternarAtivoProduto(produto.id, v))}
      />
      <Button
        variant="ghost"
        size="icon"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await excluirProduto(produto.id);
              toast.success("Produto excluído.");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Não foi possível excluir.");
            }
          })
        }
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
