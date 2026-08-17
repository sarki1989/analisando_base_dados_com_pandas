import { EmConstrucao } from "@/components/layout/em-construcao";

export const metadata = { title: "Cotações — CRM Stokes Brasil" };

export default function CotacoesPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Cotações</h1>
      <EmConstrucao titulo="Cotações e PDF" fase="Fase 4" />
    </div>
  );
}
