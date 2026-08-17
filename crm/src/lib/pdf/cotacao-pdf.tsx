import { Document, Page, View, Text, StyleSheet, Svg, Rect } from "@react-pdf/renderer";

import { formatBRL, formatData } from "@/lib/format";

const CORES = { grafite: "#1A1D21", ambar: "#E2601A", cinza: "#6b7280", borda: "#e4e4e7" };

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: CORES.grafite },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  marca: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  marcaSub: { fontSize: 8, letterSpacing: 2, color: CORES.cinza },
  empresaInfo: { textAlign: "right", fontSize: 8, color: CORES.cinza, lineHeight: 1.5 },
  tituloBox: { marginBottom: 16, paddingBottom: 8, borderBottom: `2px solid ${CORES.ambar}` },
  titulo: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  subtitulo: { fontSize: 9, color: CORES.cinza, marginTop: 2 },
  secao: { marginBottom: 14 },
  secaoTitulo: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4, color: CORES.grafite },
  linha: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  grid2: { flexDirection: "row", gap: 24 },
  col: { flex: 1 },
  tabela: { borderTop: `1px solid ${CORES.borda}`, borderLeft: `1px solid ${CORES.borda}` },
  tabelaHeaderRow: { flexDirection: "row", backgroundColor: "#f4f4f5" },
  tabelaRow: { flexDirection: "row" },
  th: {
    padding: 5,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    borderRight: `1px solid ${CORES.borda}`,
    borderBottom: `1px solid ${CORES.borda}`,
  },
  td: {
    padding: 5,
    fontSize: 8,
    borderRight: `1px solid ${CORES.borda}`,
    borderBottom: `1px solid ${CORES.borda}`,
  },
  totaisBox: { alignItems: "flex-end", marginTop: 8 },
  totalLinha: { flexDirection: "row", gap: 12, marginBottom: 2 },
  totalLabel: { color: CORES.cinza },
  totalValor: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  rodape: {
    position: "absolute",
    bottom: 28,
    left: 36,
    right: 36,
    fontSize: 7,
    color: CORES.cinza,
    borderTop: `1px solid ${CORES.borda}`,
    paddingTop: 6,
  },
});

function LogoPdf() {
  const segmentos = Array.from({ length: 8 });
  return (
    <Svg width={26} height={26} viewBox="0 0 100 100">
      {segmentos.map((_, i) => {
        const angulo = (360 / 8) * i;
        const cor = i === 2 ? CORES.ambar : CORES.grafite;
        return (
          <Rect
            key={i}
            x={44}
            y={6}
            width={12}
            height={30}
            rx={4}
            fill={cor}
            transform={`rotate(${angulo} 50 50)`}
          />
        );
      })}
    </Svg>
  );
}

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
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <LogoPdf />
            <View>
              <Text style={styles.marca}>STOKES</Text>
              <Text style={styles.marcaSub}>BRASIL</Text>
            </View>
          </View>
          <View style={styles.empresaInfo}>
            <Text>{empresa.razaoSocial}</Text>
            <Text>
              CNPJ {empresa.cnpj}
              {empresa.inscricaoEstadual ? ` · IE ${empresa.inscricaoEstadual}` : ""}
            </Text>
            <Text>{empresa.endereco}</Text>
            <Text>
              {empresa.telefone}
              {empresa.email ? ` · ${empresa.email}` : ""}
              {empresa.site ? ` · ${empresa.site}` : ""}
            </Text>
          </View>
        </View>

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
