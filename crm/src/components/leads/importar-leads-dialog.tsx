"use client";

import { useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { importarLeadsCsv } from "@/app/actions/importacao";
import { CAMPOS_IMPORTACAO_LEAD } from "@/lib/validation/importacao";

type Etapa = "upload" | "mapear" | "concluido";
type Mapeamento = Record<string, string>;

function sugerirMapeamento(colunas: string[]): Mapeamento {
  const mapeamento: Mapeamento = {};
  for (const campo of CAMPOS_IMPORTACAO_LEAD) {
    const encontrada = colunas.find((c) => c.toLowerCase().includes(campo.chave.toLowerCase()));
    if (encontrada) mapeamento[campo.chave] = encontrada;
  }
  return mapeamento;
}

export function ImportarLeadsDialog() {
  const [aberto, setAberto] = useState(false);
  const [etapa, setEtapa] = useState<Etapa>("upload");
  const [linhas, setLinhas] = useState<Record<string, string>[]>([]);
  const [colunas, setColunas] = useState<string[]>([]);
  const [mapeamento, setMapeamento] = useState<Mapeamento>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ criados: number; ignorados: number; erros: string[] } | null>(null);

  function resetar() {
    setEtapa("upload");
    setLinhas([]);
    setColunas([]);
    setMapeamento({});
    setResultado(null);
  }

  function onArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    Papa.parse<Record<string, string>>(arquivo, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const cols = res.meta.fields ?? [];
        setColunas(cols);
        setLinhas(res.data);
        setMapeamento(sugerirMapeamento(cols));
        setEtapa("mapear");
      },
      error: () => toast.error("Não foi possível ler o arquivo CSV."),
    });
  }

  async function confirmarImportacao() {
    const camposObrigatoriosFaltando = CAMPOS_IMPORTACAO_LEAD.filter((c) => c.obrigatorio && !mapeamento[c.chave]);
    if (camposObrigatoriosFaltando.length > 0) {
      toast.error(`Mapeie os campos obrigatórios: ${camposObrigatoriosFaltando.map((c) => c.rotulo).join(", ")}`);
      return;
    }

    setEnviando(true);
    const linhasMapeadas = linhas.map((linha) => {
      const obj: Record<string, string> = {};
      for (const campo of CAMPOS_IMPORTACAO_LEAD) {
        const coluna = mapeamento[campo.chave];
        if (coluna) obj[campo.chave] = linha[coluna]?.trim() ?? "";
      }
      return obj;
    });

    try {
      const res = await importarLeadsCsv(linhasMapeadas);
      setResultado(res);
      setEtapa("concluido");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na importação.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(v) => {
        setAberto(v);
        if (!v) resetar();
      }}
    >
      <Button variant="outline" onClick={() => setAberto(true)}>
        <Upload />
        Importar CSV
      </Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar leads de um CSV</DialogTitle>
          <DialogDescription>
            {etapa === "upload" && "Escolha um arquivo CSV com cabeçalho na primeira linha."}
            {etapa === "mapear" && `Associe as colunas do arquivo aos campos do lead (${linhas.length} linhas encontradas).`}
            {etapa === "concluido" && "Importação concluída."}
          </DialogDescription>
        </DialogHeader>

        {etapa === "upload" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="arquivoCsv">Arquivo CSV</Label>
            <Input id="arquivoCsv" type="file" accept=".csv,text/csv" onChange={onArquivo} />
          </div>
        )}

        {etapa === "mapear" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CAMPOS_IMPORTACAO_LEAD.map((campo) => (
                <div key={campo.chave} className="flex flex-col gap-1.5">
                  <Label>
                    {campo.rotulo}
                    {campo.obrigatorio && <span className="text-destructive"> *</span>}
                  </Label>
                  <Select
                    value={mapeamento[campo.chave] || "__nenhuma__"}
                    onValueChange={(v) =>
                      setMapeamento((prev) => ({ ...prev, [campo.chave]: v === "__nenhuma__" ? "" : v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Não importar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__nenhuma__">Não importar</SelectItem>
                      {colunas.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Prévia (5 primeiras linhas)</p>
              <div className="max-h-48 overflow-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {CAMPOS_IMPORTACAO_LEAD.filter((c) => mapeamento[c.chave]).map((c) => (
                        <TableHead key={c.chave}>{c.rotulo}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linhas.slice(0, 5).map((linha, i) => (
                      <TableRow key={i}>
                        {CAMPOS_IMPORTACAO_LEAD.filter((c) => mapeamento[c.chave]).map((c) => (
                          <TableCell key={c.chave}>{linha[mapeamento[c.chave]]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {etapa === "concluido" && resultado && (
          <div className="flex flex-col gap-2 text-sm">
            <p>
              <span className="font-medium text-foreground">{resultado.criados}</span> leads importados.
              {resultado.ignorados > 0 && ` ${resultado.ignorados} linhas ignoradas por erro.`}
            </p>
            {resultado.erros.length > 0 && (
              <ul className="list-disc pl-4 text-xs text-destructive">
                {resultado.erros.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <DialogFooter>
          {etapa === "mapear" && (
            <>
              <Button variant="outline" onClick={resetar}>
                Voltar
              </Button>
              <Button onClick={confirmarImportacao} disabled={enviando}>
                {enviando ? "Importando..." : `Importar ${linhas.length} leads`}
              </Button>
            </>
          )}
          {etapa === "concluido" && <Button onClick={() => setAberto(false)}>Fechar</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
