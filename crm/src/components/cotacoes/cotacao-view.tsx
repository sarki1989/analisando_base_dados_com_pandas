import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBRL } from "@/lib/format";

export type ItemView = {
  id: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  desconto: number;
  total: number;
};

export function CotacaoView({
  itens,
  condicaoPagamento,
  prazoFabricacao,
  frete,
  observacoes,
  subtotal,
  desconto,
  total,
}: {
  itens: ItemView[];
  condicaoPagamento: string | null;
  prazoFabricacao: string | null;
  frete: string | null;
  observacoes: string | null;
  subtotal: number;
  desconto: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Preço unit.</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.descricao}</TableCell>
                  <TableCell>
                    {item.quantidade} {item.unidade}
                  </TableCell>
                  <TableCell>{formatBRL(item.precoUnitario)}</TableCell>
                  <TableCell>{formatBRL(item.desconto)}</TableCell>
                  <TableCell className="font-medium">{formatBRL(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-col items-end gap-1 p-4 text-sm">
            <span className="text-muted-foreground">Subtotal: {formatBRL(subtotal)}</span>
            {desconto > 0 && <span className="text-muted-foreground">Desconto: -{formatBRL(desconto)}</span>}
            <span className="text-lg font-semibold">{formatBRL(total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Condições</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <p>
            <span className="text-muted-foreground">Pagamento:</span> {condicaoPagamento || "a combinar"}
          </p>
          <p>
            <span className="text-muted-foreground">Prazo de fabricação:</span> {prazoFabricacao || "a combinar"}
          </p>
          <p>
            <span className="text-muted-foreground">Frete:</span> {frete || "a combinar"}
          </p>
          {observacoes && (
            <p className="pt-2 whitespace-pre-wrap text-muted-foreground">{observacoes}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
