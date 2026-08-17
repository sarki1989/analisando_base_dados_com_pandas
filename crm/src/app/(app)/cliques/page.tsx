import { EmConstrucao } from "@/components/layout/em-construcao";

export const metadata = { title: "Cliques sem lead — CRM Stokes Brasil" };

export default function CliquesPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Cliques sem lead</h1>
      <EmConstrucao titulo="Cliques de WhatsApp ainda não vinculados" fase="Fase 3" />
    </div>
  );
}
