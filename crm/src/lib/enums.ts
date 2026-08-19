// Enums de negócio do CRM. Ficam como String no banco (compatível com SQLite
// e PostgreSQL) e são validados por Zod nas rotas/formulários.

export const STATUS_LEAD = [
  "Novo",
  "Contato feito",
  "Qualificado",
  "Cotação enviada",
  "Em negociação",
  "Ganho",
  "Perdido",
] as const;
export type StatusLead = (typeof STATUS_LEAD)[number];

/** Etapas do funil kanban, na ordem exibida (Ganho/Perdido ficam fora das colunas ativas). */
export const ETAPAS_FUNIL = [
  "Novo",
  "Contato feito",
  "Qualificado",
  "Cotação enviada",
  "Em negociação",
] as const;

export const SETORES_LEAD = [
  "sondagem geotécnica",
  "mineração",
  "construção civil",
  "poços",
  "outro",
] as const;
export type SetorLead = (typeof SETORES_LEAD)[number];

export const MOTIVOS_PERDA = [
  "preço",
  "prazo",
  "concorrente",
  "sem retorno",
  "fora de escopo",
  "outro",
] as const;
export type MotivoPerda = (typeof MOTIVOS_PERDA)[number];

export const TIPOS_INTERACAO = ["whatsapp", "ligação", "e-mail", "reunião", "visita"] as const;
export type TipoInteracao = (typeof TIPOS_INTERACAO)[number];

export const DIRECOES_INTERACAO = ["entrada", "saída"] as const;
export type DirecaoInteracao = (typeof DIRECOES_INTERACAO)[number];

export const PRIORIDADES_TAREFA = ["baixa", "média", "alta"] as const;
export type PrioridadeTarefa = (typeof PRIORIDADES_TAREFA)[number];

export const CATEGORIAS_PRODUTO = [
  "coroa diamantada",
  "calibrador",
  "barrilete",
  "revestimento",
  "haste",
  "acessório",
  "broca concreto",
  "outro",
] as const;
export type CategoriaProduto = (typeof CATEGORIAS_PRODUTO)[number];

export const DIAMETROS_SONDAGEM = [
  "LTK", "LTK48", "A", "AQ", "B", "BQ", "BX", "N", "NQ", "H", "HQ",
  "PW", "SW", "ZW", "PQ", "NW", "AW", "AWJ", "NWG", "NWM",
] as const;

export const STATUS_COTACAO = [
  "rascunho",
  "enviada",
  "em negociação",
  "aprovada",
  "perdida",
] as const;
export type StatusCotacao = (typeof STATUS_COTACAO)[number];

export const CONDICOES_FRETE = ["por conta do cliente", "incluso", "a combinar"] as const;

/** Etapas do Kanban de pós-venda: acompanhamento da compra junto ao fornecedor. */
export const STATUS_PEDIDO = ["Aguardando compra", "Comprado", "Em trânsito", "Entregue"] as const;
export type StatusPedido = (typeof STATUS_PEDIDO)[number];

export const PAPEIS_USUARIO = ["admin", "vendedor"] as const;
export type PapelUsuario = (typeof PAPEIS_USUARIO)[number];

export const UFS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
] as const;
