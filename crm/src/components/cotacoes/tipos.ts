export type ItemEditavel = {
  chave: string;
  produtoId: string;
  descricaoLivre: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
};

export type ProdutoOpcao = {
  id: string;
  sku: string;
  descricao: string;
  precoBase: number;
  unidade: string;
};
