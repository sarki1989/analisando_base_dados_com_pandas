import { EmConstrucao } from "@/components/layout/em-construcao";

export const metadata = { title: "Produtos — CRM Stokes Brasil" };

export default function ProdutosPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Produtos</h1>
      <EmConstrucao titulo="Catálogo de produtos" fase="Fase 4" />
    </div>
  );
}
