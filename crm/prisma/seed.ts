import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calcularFatorPreco, calcularPrecoVenda } from "../src/lib/cotacao";

const prisma = new PrismaClient();

const FATOR_PADRAO = calcularFatorPreco({ impostoPercent: 4, margemPercent: 10, despesasPercent: 5 });

type ProdutoSeed = {
  sku: string;
  descricao: string;
  categoria: string;
  diametro?: string;
  unidade?: string;
  custoFornecedor: number;
};

/**
 * Catálogo baseado na tabela de preços do principal fornecedor (Prisma
 * Ferramentas Diamantadas, 05/08/2026) — é a base real dos produtos
 * revendidos pela Stokes Brasil. `custoFornecedor` vem direto da tabela;
 * `precoBase` é calculado pelo fator padrão de precificação.
 */
function catalogoDoFornecedor(): ProdutoSeed[] {
  const produtos: ProdutoSeed[] = [];

  const coroasCravadas: [string, number][] = [
    ["LTK", 578], ["A", 450], ["AQ", 491], ["B", 578], ["BQ", 664],
    ["N", 728], ["NQ", 793], ["H", 877], ["HQ", 933], ["PW", 1136],
    ["SW", 1800], ["ZW", 2402],
  ];
  for (const [diametro, custo] of coroasCravadas) {
    produtos.push({
      sku: `CD-CRAV-${diametro}`,
      descricao: "Coroa diamantada cravada",
      categoria: "coroa diamantada",
      diametro,
      custoFornecedor: custo,
    });
  }

  const coroasImpregnadas: [string, number][] = [
    ["LTK", 751], ["A", 685], ["AQ", 685], ["B", 772], ["BQ", 999],
    ["N", 984], ["NQ", 1451], ["H", 1288], ["HQ", 1814], ["PW", 2038],
    ["SW", 3476], ["ZW", 4076],
  ];
  for (const [diametro, custo] of coroasImpregnadas) {
    produtos.push({
      sku: `CD-IMP-${diametro}`,
      descricao: "Coroa diamantada impregnada / microcravada",
      categoria: "coroa diamantada",
      diametro,
      custoFornecedor: custo,
    });
  }

  const coroasVidia: [string, number][] = [
    ["A", 299], ["B", 384], ["N", 578], ["H", 644], ["PW", 897], ["SW", 1072], ["ZW", 1309],
  ];
  for (const [diametro, custo] of coroasVidia) {
    produtos.push({
      sku: `CD-VID-${diametro}`,
      descricao: "Coroa diamantada vídia",
      categoria: "coroa diamantada",
      diametro,
      custoFornecedor: custo,
    });
  }

  const calibradores: [string, number][] = [
    ["LTK48", 425], ["A", 470], ["AQ", 414], ["B", 491], ["BQ", 569], ["BX", 437],
    ["N", 540], ["NQ", 808], ["H", 626], ["HQ", 999], ["PW", 1069], ["SW", 1410], ["ZW", 1590],
  ];
  for (const [diametro, custo] of calibradores) {
    produtos.push({
      sku: `CAL-${diametro}`,
      descricao: "Calibrador",
      categoria: "calibrador",
      diametro,
      custoFornecedor: custo,
    });
  }

  const calibradoresVidia: [string, number][] = [
    ["A", 290], ["B", 361], ["N", 425], ["H", 462], ["PW", 1099], ["SW", 1296], ["ZW", 1389],
  ];
  for (const [diametro, custo] of calibradoresVidia) {
    produtos.push({
      sku: `CAL-VID-${diametro}`,
      descricao: "Calibrador vídia",
      categoria: "calibrador",
      diametro,
      custoFornecedor: custo,
    });
  }

  const sapatasCravadas: [string, number][] = [
    ["A", 513], ["B", 600], ["N", 707], ["H", 772], ["PW", 2769], ["SW", 3476],
  ];
  for (const [diametro, custo] of sapatasCravadas) {
    produtos.push({
      sku: `SAP-CRAV-${diametro}`,
      descricao: "Sapata cravada",
      categoria: "acessório",
      diametro,
      custoFornecedor: custo,
    });
  }

  const sapatasImpregnadas: [string, number][] = [
    ["A", 623], ["B", 728], ["N", 965], ["H", 1263], ["PW", 2101], ["ZW", 4721], ["SW", 3753],
  ];
  for (const [diametro, custo] of sapatasImpregnadas) {
    produtos.push({
      sku: `SAP-IMP-${diametro}`,
      descricao: "Sapata impregnada / microcravada",
      categoria: "acessório",
      diametro,
      custoFornecedor: custo,
    });
  }

  const sapatasVidia: [string, number][] = [
    ["A", 281], ["B", 366], ["N", 409], ["H", 664], ["PW", 965], ["SW", 877], ["ZW", 1136],
  ];
  for (const [diametro, custo] of sapatasVidia) {
    produtos.push({
      sku: `SAP-VID-${diametro}`,
      descricao: "Sapata vídia",
      categoria: "acessório",
      diametro,
      custoFornecedor: custo,
    });
  }

  const mangaTravaCravada: [string, number, number][] = [
    ["AQ", 851, 1028], ["BQ", 873, 999], ["NQ", 962, 1210], ["HQ", 1186, 1522],
  ];
  for (const [diametro, custo1anel, custo2aneis] of mangaTravaCravada) {
    produtos.push({
      sku: `MT-CRAV-${diametro}-1A`,
      descricao: "Manga trava cravada, 1 anel",
      categoria: "acessório",
      diametro,
      custoFornecedor: custo1anel,
    });
    produtos.push({
      sku: `MT-CRAV-${diametro}-2A`,
      descricao: "Manga trava cravada, 2 anéis",
      categoria: "acessório",
      diametro,
      custoFornecedor: custo2aneis,
    });
  }

  const mangaTravaImpregnada: [string, number, number][] = [
    ["AQ", 1617, 1958], ["BQ", 1658, 2215], ["NQ", 1832, 2299], ["HQ", 2258, 2896],
  ];
  for (const [diametro, custo1anel, custo2aneis] of mangaTravaImpregnada) {
    produtos.push({
      sku: `MT-IMP-${diametro}-1A`,
      descricao: "Manga trava impregnada, 1 anel",
      categoria: "acessório",
      diametro,
      custoFornecedor: custo1anel,
    });
    produtos.push({
      sku: `MT-IMP-${diametro}-2A`,
      descricao: "Manga trava impregnada, 2 anéis",
      categoria: "acessório",
      diametro,
      custoFornecedor: custo2aneis,
    });
  }

  return produtos;
}

/** Linhas complementares (barriletes, revestimento, hastes...) que o fornecedor principal não cobre. */
function catalogoComplementar(): ProdutoSeed[] {
  return [
    { sku: "BAR-NQ", descricao: "Barrilete", categoria: "barrilete", diametro: "NQ", custoFornecedor: 1450 },
    { sku: "BAR-HQ", descricao: "Barrilete", categoria: "barrilete", diametro: "HQ", custoFornecedor: 1680 },
    { sku: "REV-PW", descricao: "Revestimento", categoria: "revestimento", diametro: "PW", unidade: "m", custoFornecedor: 180 },
    { sku: "HAS-AW", descricao: "Haste de sondagem", categoria: "haste", diametro: "AW", custoFornecedor: 420 },
    { sku: "PES-HQ", descricao: "Pescador", categoria: "acessório", diametro: "HQ", custoFornecedor: 890 },
    { sku: "CAB-AGUA", descricao: "Cabeça d'água", categoria: "acessório", custoFornecedor: 1200 },
    { sku: "BRC-CONC-06", descricao: "Broca diamantada para concreto 6mm", categoria: "broca concreto", custoFornecedor: 45 },
  ];
}

async function main() {
  await prisma.configuracaoEmpresa.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      razaoSocial: "Saulo Henrique Silva Figueiredo 37406082851",
      nomeFantasia: "Stokes Brasil",
      cnpj: "20.679.623/0001-40",
      inscricaoEstadual: "286.363.771.113",
      endereco: "Rua Tordesilhas, 15, Vila Conceição, Diadema-SP, CEP 09911-485",
      telefone: "+55 11 94089-4977",
      site: "https://www.stokesbrasil.com.br",
      banco: "Bradesco",
      agencia: "2184",
      conta: "547682-8",
      pixChave: "20.679.623/0001-40",
      corPrimaria: "#1A1D21",
      corAcento: "#E2601A",
      impostoPercent: 4,
      margemPercent: 10,
      despesasPercent: 5,
      validadeDiasPadrao: 15,
      whatsappNumero: "5511940894977",
      rodapePdf:
        "Valores e prazos são estimativas sujeitas a confirmação no momento do pedido. Cotação sem valor fiscal.",
    },
  });

  const senhaPadrao = await bcrypt.hash("stokes123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@stokesbrasil.com.br" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@stokesbrasil.com.br",
      senhaHash: senhaPadrao,
      papel: "admin",
    },
  });

  const vendedor = await prisma.usuario.upsert({
    where: { email: "vendedor@stokesbrasil.com.br" },
    update: {},
    create: {
      nome: "Vendedor",
      email: "vendedor@stokesbrasil.com.br",
      senhaHash: senhaPadrao,
      papel: "vendedor",
    },
  });

  const produtos = [...catalogoDoFornecedor(), ...catalogoComplementar()];
  const skusAtuais = produtos.map((p) => p.sku);

  // Remove produtos de catálogos antigos que saíram da lista — só os que
  // nunca foram usados em cotação, pra nunca apagar histórico real.
  await prisma.produto.deleteMany({
    where: { sku: { notIn: skusAtuais }, itensCotacao: { none: {} } },
  });

  for (const p of produtos) {
    const dados = {
      ...p,
      unidade: p.unidade ?? "un",
      precoBase: calcularPrecoVenda(p.custoFornecedor, FATOR_PADRAO),
    };
    await prisma.produto.upsert({
      where: { sku: p.sku },
      update: dados,
      create: dados,
    });
  }

  const leadsExemplo = [
    {
      nome: "Carlos Mendes",
      empresa: "Geosonda Sondagens Ltda",
      telefone: "+5511987654321",
      email: "carlos@geosonda.com.br",
      cidade: "São Paulo",
      uf: "SP",
      setor: "sondagem geotécnica",
      status: "Novo",
      valorEstimado: 8500,
      observacoes: "Pediu cotação de coroas HQ para obra em Guarulhos.",
    },
    {
      nome: "Fernanda Lima",
      empresa: "Mineradora Vale do Sul",
      telefone: "+5531988887777",
      email: "fernanda.lima@mvs.com.br",
      cidade: "Belo Horizonte",
      uf: "MG",
      setor: "mineração",
      status: "Contato feito",
      valorEstimado: 32000,
      observacoes: "Interesse em fechar contrato recorrente de barriletes NQ.",
    },
    {
      nome: "Roberto Alves",
      empresa: "Poços Artesianos RA",
      telefone: "+5541999995555",
      cidade: "Curitiba",
      uf: "PR",
      setor: "poços",
      status: "Qualificado",
      valorEstimado: 4200,
      observacoes: "Pequena empresa, primeira compra.",
    },
    {
      nome: "Juliana Prado",
      empresa: "Construtora Prado & Filhos",
      telefone: "+5521998887766",
      email: "juliana@pradoefilhos.com.br",
      cidade: "Rio de Janeiro",
      uf: "RJ",
      setor: "construção civil",
      status: "Cotação enviada",
      valorEstimado: 15600,
      observacoes: "Aguardando aprovação interna do orçamento.",
    },
    {
      nome: "Marcos Teixeira",
      empresa: "Sondasolo Perfurações",
      telefone: "+5562991234567",
      email: "marcos@sondasolo.com.br",
      cidade: "Goiânia",
      uf: "GO",
      setor: "sondagem geotécnica",
      status: "Em negociação",
      valorEstimado: 21000,
      observacoes: "Negociando prazo de entrega e desconto por volume.",
    },
  ];

  for (const lead of leadsExemplo) {
    const jaExiste = await prisma.lead.findFirst({ where: { telefone: lead.telefone } });
    if (jaExiste) continue;
    await prisma.lead.create({
      data: {
        ...lead,
        consentimentoLgpd: true,
        responsavelId: vendedor.id,
        ultimoContatoEm: new Date(),
      },
    });
  }

  console.log("Seed concluído.");
  console.log(`Usuários: ${admin.email} / ${vendedor.email} (senha: stokes123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
