import { Document, Page, View, Text } from "@react-pdf/renderer";

import { formatBRL, formatData } from "@/lib/format";
import { estilosComuns as styles, CabecalhoPdf } from "./pdf-comum";

// Documento de compra enviado ao FORNECEDOR (Prisma, Sonda Parts, ICEMS...).
// Usa os itens/quantidades da cotação do cliente como referência, mas o
// preço unitário é o custoFornecedor do produto — nunca o preço de venda
// cobrado do cliente. Por isso este PDF não traz nome do cliente/lead nem
// o valor da cotação: é um documento interno de compra, não uma via da
// proposta comercial.
export type PedidoPdfProps = {
  pedido: {
    fornecedor: string;
    numeroPedidoFornecedor: string | null;
    observacoes: string | null;
    criadoEm: Date;
  };
  cotacaoNumero: string;
  itens: {
    sku: string | null;
    descricao: string;
    quantidade: number;
    unidade: string;
    custoUnitario: number | null;
  }[];
  empresa: {
    razaoSocial: string;
    cnpj: string;
    inscricaoEstadual: string | null;
    endereco: string;
    telefone: string;
    email: string | null;
    site: string | null;
  };
};

export function PedidoPdfDocument({ pedido, cotacaoNumero, itens, empresa }: PedidoPdfProps) {
  const temItemSemCusto = itens.some((item) => item.custoUnitario === null);
  const total = itens.reduce((acc, item) => acc + (item.custoUnitario ?? 0) * item.quantidade, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <CabecalhoPdf empresa={empresa} />

        <View style={styles.tituloBox}>
          <Text style={styles.titulo}>Pedido de Compra</Text>
          <Text style={styles.subtitulo}>
            Ref. Cotação {cotacaoNumero} · Emitido em {formatData(pedido.criadoEm)}
          </Text>
        </View>

        <View style={[styles.secao, styles.grid2]}>
          <View style={styles.col}>
            <Text style={styles.secaoTitulo}>Fornecedor</Text>
            <Text>{pedido.fornecedor}</Text>
            {pedido.numeroPedidoFornecedor && <Text>Nº do pedido: {pedido.numeroPedidoFornecedor}</Text>}
          </View>
          <View style={styles.col}>
            <Text style={styles.secaoTitulo}>Comprador</Text>
            <Text>{empresa.razaoSocial}</Text>
            <Text>CNPJ {empresa.cnpj}</Text>
            <Text>{empresa.telefone}</Text>
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Itens</Text>
          <View style={styles.tabela}>
            <View style={styles.tabelaHeaderRow}>
              <Text style={[styles.th, { width: "16%" }]}>SKU</Text>
              <Text style={[styles.th, { width: "36%" }]}>Descrição</Text>
              <Text style={[styles.th, { width: "12%" }]}>Qtd.</Text>
              <Text style={[styles.th, { width: "18%" }]}>Custo unit.</Text>
              <Text style={[styles.th, { width: "18%", borderRight: "none" }]}>Total</Text>
            </View>
            {itens.map((item, i) => (
              <View key={i} style={styles.tabelaRow}>
                <Text style={[styles.td, { width: "16%" }]}>{item.sku || "—"}</Text>
                <Text style={[styles.td, { width: "36%" }]}>{item.descricao}</Text>
                <Text style={[styles.td, { width: "12%" }]}>
                  {item.quantidade} {item.unidade}
                </Text>
                <Text style={[styles.td, { width: "18%" }]}>
                  {item.custoUnitario === null ? "—" : formatBRL(item.custoUnitario)}
                </Text>
                <Text style={[styles.td, { width: "18%", borderRight: "none" }]}>
                  {item.custoUnitario === null ? "—" : formatBRL(item.custoUnitario * item.quantidade)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totaisBox}>
            <View style={styles.totalLinha}>
              <Text style={styles.totalLabel}>Total estimado</Text>
              <Text style={styles.totalValor}>{formatBRL(total)}</Text>
            </View>
            {temItemSemCusto && (
              <Text style={{ fontSize: 7, color: styles.totalLabel.color, marginTop: 2 }}>
                Um ou mais itens não têm custo de fornecedor cadastrado — confirme o valor com o fornecedor.
              </Text>
            )}
          </View>
        </View>

        {pedido.observacoes && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Observações</Text>
            <Text>{pedido.observacoes}</Text>
          </View>
        )}

        <View style={styles.rodape}>
          <Text>Documento interno de formalização de compra, gerado pelo CRM Stokes Brasil — sem valor fiscal.</Text>
        </View>
      </Page>
    </Document>
  );
}
