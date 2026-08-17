import { EmConstrucao } from "@/components/layout/em-construcao";

export const metadata = { title: "Leads — CRM Stokes Brasil" };

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Leads</h1>
      <EmConstrucao titulo="Funil de leads (kanban)" fase="Fase 2" />
    </div>
  );
}
