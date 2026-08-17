import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  const produtos = [
    { sku: "CD-BQ-IMP", descricao: "Coroa diamantada impregnada", categoria: "coroa diamantada", diametro: "BQ", unidade: "un", custoFornecedor: 380 },
    { sku: "CD-NQ-IMP", descricao: "Coroa diamantada impregnada", categoria: "coroa diamantada", diametro: "NQ", unidade: "un", custoFornecedor: 460 },
    { sku: "CD-HQ-IMP", descricao: "Coroa diamantada impregnada", categoria: "coroa diamantada", diametro: "HQ", unidade: "un", custoFornecedor: 590 },
    { sku: "CD-AWJ-IMP", descricao: "Coroa diamantada impregnada", categoria: "coroa diamantada", diametro: "AWJ", unidade: "un", custoFornecedor: 340 },
    { sku: "CD-NWG-IMP", descricao: "Coroa diamantada impregnada", categoria: "coroa diamantada", diametro: "NWG", unidade: "un", custoFornecedor: 510 },
    { sku: "CD-NWM-IMP", descricao: "Coroa diamantada impregnada", categoria: "coroa diamantada", diametro: "NWM", unidade: "un", custoFornecedor: 530 },
    { sku: "CAL-BQ", descricao: "Calibrador", categoria: "calibrador", diametro: "BQ", unidade: "un", custoFornecedor: 210 },
    { sku: "CAL-NQ", descricao: "Calibrador", categoria: "calibrador", diametro: "NQ", unidade: "un", custoFornecedor: 250 },
    { sku: "CAL-HQ", descricao: "Calibrador", categoria: "calibrador", diametro: "HQ", unidade: "un", custoFornecedor: 300 },
    { sku: "BAR-NQ", descricao: "Barrilete", categoria: "barrilete", diametro: "NQ", unidade: "un", custoFornecedor: 1450 },
    { sku: "BAR-HQ", descricao: "Barrilete", categoria: "barrilete", diametro: "HQ", unidade: "un", custoFornecedor: 1680 },
    { sku: "REV-PW", descricao: "Revestimento", categoria: "revestimento", diametro: "PW", unidade: "m", custoFornecedor: 180 },
    { sku: "HAS-AW", descricao: "Haste de sondagem", categoria: "haste", diametro: "AW", unidade: "un", custoFornecedor: 420 },
    { sku: "SAP-NW", descricao: "Sapata", categoria: "acessório", diametro: "NW", unidade: "un", custoFornecedor: 260 },
    { sku: "PES-HQ", descricao: "Pescador", categoria: "acessório", diametro: "HQ", unidade: "un", custoFornecedor: 890 },
    { sku: "CAB-AGUA", descricao: "Cabeça d'água", categoria: "acessório", unidade: "un", custoFornecedor: 1200 },
    { sku: "BRC-CONC-06", descricao: "Broca diamantada para concreto 6mm", categoria: "broca concreto", unidade: "un", custoFornecedor: 45 },
  ];

  const FATOR_PADRAO = 1.2346;
  for (const p of produtos) {
    await prisma.produto.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        ...p,
        precoBase: Math.round(p.custoFornecedor * FATOR_PADRAO * 100) / 100,
      },
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
