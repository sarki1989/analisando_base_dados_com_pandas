"use client";

import { useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { toast } from "sonner";
import { Copy, Trash2, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { duplicarCotacao, excluirCotacao } from "@/app/actions/cotacoes";

export function DuplicarCotacaoButton({ cotacaoId }: { cotacaoId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await duplicarCotacao(cotacaoId);
          } catch (e) {
            unstable_rethrow(e);
            toast.error(e instanceof Error ? e.message : "Não foi possível duplicar.");
          }
        })
      }
    >
      <Copy />
      Duplicar (nova revisão)
    </Button>
  );
}

export function ExcluirCotacaoButton({ cotacaoId }: { cotacaoId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir esta cotação?</AlertDialogTitle>
          <AlertDialogDescription>
            Só é possível excluir cotações em rascunho. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await excluirCotacao(cotacaoId);
                } catch (e) {
                  unstable_rethrow(e);
                  toast.error(e instanceof Error ? e.message : "Não foi possível excluir.");
                }
              })
            }
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function BaixarPdfButton({ cotacaoId }: { cotacaoId: string }) {
  return (
    <Button variant="outline" asChild>
      <a href={`/api/cotacoes/${cotacaoId}/pdf`} target="_blank" rel="noopener noreferrer">
        <Download />
        Baixar PDF
      </a>
    </Button>
  );
}
