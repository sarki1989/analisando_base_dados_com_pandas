"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { editarPedido } from "@/app/actions/pedidos";
import { formatBRL } from "@/lib/format";
import { GeradorMensagemDialog } from "@/components/leads/gerador-mensagem-dialog";
import type { PedidoComRelacoes } from "./types";

export function PedidoDetalheDialog({
  pedido,
  open,
  onOpenChange,
}: {
  pedido: PedidoComRelacoes;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [cotacaoId, setCotacaoId] = useState(pedido.cotacao?.id ?? "");
  const [fornecedor, setFornecedor] = useState(pedido.fornecedor ?? "");
  const [numeroPedidoFornecedor, setNumeroPedidoFornecedor] = useState(pedido.numeroPedidoFornecedor ?? "");
  const [transportadora, setTransportadora] = useState(pedido.transportadora ?? "");
  const [codigoRastreio, setCodigoRastreio] = useState(pedido.codigoRastreio ?? "");
  const [observacoes, setObservacoes] = useState(pedido.observacoes ?? "");
  const [salvando, setSalvando] = useState(false);

  const cotacoesElegiveis = pedido.lead.cotacoes.filter((c) => c.status !== "rascunho");

  async function salvar() {
    setSalvando(true);
    try {
      await editarPedido({
        pedidoId: pedido.id,
        cotacaoId,
        fornecedor,
        numeroPedidoFornecedor,
        transportadora,
        codigoRastreio,
        observacoes,
      });
      toast.success("Pedido atualizado.");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  // Usa o estado salvo (não os campos ainda não confirmados) — o PDF é
  // gerado a partir do que está persistido no banco.
  const podeGerarPdf = Boolean(pedido.fornecedor && pedido.cotacao);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{pedido.lead.empresa}</DialogTitle>
          <DialogDescription>
            <Link href={`/leads/${pedido.lead.id}`} className="underline">
              Ver lead
            </Link>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pedido-cotacao">Cotação de referência</Label>
            {cotacoesElegiveis.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Este lead ainda não tem cotação enviada/aprovada para usar como referência.
              </p>
            ) : (
              <Select value={cotacaoId} onValueChange={setCotacaoId}>
                <SelectTrigger id="pedido-cotacao">
                  <SelectValue placeholder="Selecione a cotação" />
                </SelectTrigger>
                <SelectContent>
                  {cotacoesElegiveis.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.numero} · {formatBRL(c.total)} · {c.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pedido-fornecedor">Fornecedor</Label>
            <Input
              id="pedido-fornecedor"
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
              placeholder="ex: Prisma Ferramentas Diamantadas"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pedido-numero-fornecedor">Nº do pedido no fornecedor</Label>
              <Input
                id="pedido-numero-fornecedor"
                value={numeroPedidoFornecedor}
                onChange={(e) => setNumeroPedidoFornecedor(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pedido-transportadora">Transportadora</Label>
              <Input
                id="pedido-transportadora"
                value={transportadora}
                onChange={(e) => setTransportadora(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pedido-rastreio">Código de rastreio</Label>
            <Input id="pedido-rastreio" value={codigoRastreio} onChange={(e) => setCodigoRastreio(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pedido-observacoes">Observações</Label>
            <Textarea id="pedido-observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {podeGerarPdf ? (
              <Button variant="outline" asChild>
                <a href={`/api/pedidos/${pedido.id}/pdf`} target="_blank" rel="noopener noreferrer">
                  <Download />
                  Baixar pedido de compra (PDF)
                </a>
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">
                {!pedido.cotacao
                  ? "Selecione e salve a cotação de referência para poder gerar o PDF do pedido de compra."
                  : "Salve o fornecedor para poder gerar o PDF do pedido de compra."}
              </p>
            )}
            <GeradorMensagemDialog
              leadId={pedido.leadId}
              telefone={pedido.lead.telefone}
              email={pedido.lead.email}
              tipoInicial="pedido_confirmado"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
