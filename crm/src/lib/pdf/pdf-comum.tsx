import { View, Text, StyleSheet, Svg, Rect } from "@react-pdf/renderer";

export const CORES = { grafite: "#1A1D21", ambar: "#E2601A", cinza: "#6b7280", borda: "#e4e4e7" };

export const estilosComuns = StyleSheet.create({
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

export function LogoPdf() {
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

/** Cabeçalho padrão (logo Stokes + dados da empresa), reutilizado por todos os PDFs. */
export function CabecalhoPdf({
  empresa,
}: {
  empresa: { razaoSocial: string; cnpj: string; inscricaoEstadual: string | null; endereco: string; telefone: string; email: string | null; site: string | null };
}) {
  return (
    <View style={estilosComuns.header}>
      <View style={estilosComuns.logoRow}>
        <LogoPdf />
        <View>
          <Text style={estilosComuns.marca}>STOKES</Text>
          <Text style={estilosComuns.marcaSub}>BRASIL</Text>
        </View>
      </View>
      <View style={estilosComuns.empresaInfo}>
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
  );
}
