import { Document, Page, View, Text } from "@react-pdf/renderer";

import { formatBRL, formatData } from "@/lib/format";
import { estilosComuns as styles, CabecalhoPdf } from "./pdf-comum";

export type CotacaoPdfProps = {
  cotacao: {
    numero: string;
    emitidaEm: Date;
    validadeDias: number;
    condicaoPagamento: string | null;
    prazoFabricacao: string | null;
    frete: string | null;
    observacoes: string | null;
    subtotal: number;
    desconto: number;
    total: number;
    revisaoNumero: number;
  };
  lead: {
    nome: string;
    empresa: string;
    telefone: string;
    email: string | null;
    cidade: string | null;
    uf: string | null;
    cnpj: string | null;
  };
  itens: {
    descricao: string;
    quantidade: number;
    unidade: string;
    precoUnitario: number;
    desconto: number;
    total: number;
  }[];
  empresa: {
    nomeFantasia: string;
    razaoSocial: string;
    cnpj: string;
    inscricaoEstadual: string | null;
    endereco: string;
    telefone: string;
    email: string | null;
    site: string | null;
    banco: string | null;
    agencia: string | null;
    conta: string | null;
    pixChave: string | null;
    rodapePdf: string | null;
  };
};

export function CotacaoPdfDocument({ cotacao, lead, itens, empresa }: CotacaoPdfProps) {
  const validade = new Date(cotacao.emitidaEm);
  validade.setDate(validade.getDate() + cotacao.validadeDias);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <CabecalhoPdf empresa={empresa} />

        <View style={styles.tituloBox}>
          <Text style={styles.titulo}>
            Cotação {cotacao.numero}
            {cotacao.revisaoNumero > 1 ? ` (revisão ${cotacao.revisaoNumero})` : ""}
          </Text>
          <Text style={styles.subtitulo}>
            Emitida em {formatData(cotacao.emitidaEm)} · Válida até {formatData(validade)} (
            {cotacao.validadeDias} dias)
          </Text>
        </View>

        <View style={[styles.secao, styles.grid2]}>
          <View style={styles.col}>
            <Text style={styles.secaoTitulo}>Cliente</Text>
            <Text>{lead.empresa}</Text>
            <Text>{lead.nome}</Text>
            {lead.cnpj && <Text>CNPJ {lead.cnpj}</Text>}
            <Text>{lead.telefone}</Text>
            {lead.email && <Text>{lead.email}</Text>}
            {(lead.cidade || lead.uf) && (
              <Text>{[lead.cidade, lead.uf].filter(Boolean).join(" / ")}</Text>
            )}
          </View>
          <View style={styles.col}>
            <Text style={styles.secaoTitulo}>Condições</Text>
            <Text>Pagamento: {cotacao.condicaoPagamento || "a combinar"}</Text>
            <Text>Prazo de fabricação: {cotacao.prazoFabricacao || "a combinar"}</Text>
            <Text>Frete: {cotacao.frete || "a combinar"}</Text>
            {(empresa.banco || empresa.pixChave) && (
              <Text>
                {empresa.banco ? `${empresa.banco} · Ag ${empresa.agencia} · Conta ${empresa.conta}` : ""}
                {empresa.pixChave ? ` · PIX ${empresa.pixChave}` : ""}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Itens</Text>
          <View style={styles.tabela}>
            <View style={styles.tabelaHeaderRow}>
              <Text style={[styles.th, { width: "40%" }]}>Descrição</Text>
              <Text style={[styles.th, { width: "12%" }]}>Qtd.</Text>
              <Text style={[styles.th, { width: "16%" }]}>Preço unit.</Text>
              <Text style={[styles.th, { width: "16%" }]}>Desconto</Text>
              <Text style={[styles.th, { width: "16%", borderRight: "none" }]}>Total</Text>
            </View>
            {itens.map((item, i) => (
              <View key={i} style={styles.tabelaRow}>
                <Text style={[styles.td, { width: "40%" }]}>{item.descricao}</Text>
                <Text style={[styles.td, { width: "12%" }]}>
                  {item.quantidade} {item.unidade}
                </Text>
                <Text style={[styles.td, { width: "16%" }]}>{formatBRL(item.precoUnitario)}</Text>
                <Text style={[styles.td, { width: "16%" }]}>{formatBRL(item.desconto)}</Text>
                <Text style={[styles.td, { width: "16%", borderRight: "none" }]}>
                  {formatBRL(item.total)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totaisBox}>
            <View style={styles.totalLinha}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text>{formatBRL(cotacao.subtotal)}</Text>
            </View>
            {cotacao.desconto > 0 && (
              <View style={styles.totalLinha}>
                <Text style={styles.totalLabel}>Desconto</Text>
                <Text>-{formatBRL(cotacao.desconto)}</Text>
              </View>
            )}
            <View style={styles.totalLinha}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValor}>{formatBRL(cotacao.total)}</Text>
            </View>
          </View>
        </View>

        {cotacao.observacoes && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Observações</Text>
            <Text>{cotacao.observacoes}</Text>
          </View>
        )}

        <View style={styles.rodape}>
          <Text>{empresa.rodapePdf || "Valores e prazos são estimativas sujeitas a confirmação."}</Text>
        </View>
      </Page>
    </Document>
  );
}
