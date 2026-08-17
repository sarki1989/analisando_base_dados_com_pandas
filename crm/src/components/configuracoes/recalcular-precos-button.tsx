"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { recalcularPrecosCatalogo } from "@/app/actions/produtos";

export function RecalcularPrecosButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await recalcularPrecosCatalogo();
            toast.success("Preços do catálogo recalculados com o fator salvo.");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Não foi possível recalcular.");
          }
        })
      }
    >
      {pending ? "Recalculando..." : "Recalcular preços do catálogo"}
    </Button>
  );
}
