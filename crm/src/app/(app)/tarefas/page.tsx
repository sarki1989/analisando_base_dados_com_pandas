import { EmConstrucao } from "@/components/layout/em-construcao";

export const metadata = { title: "Tarefas — CRM Stokes Brasil" };

export default function TarefasPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Tarefas</h1>
      <EmConstrucao titulo="Tarefas e follow-ups" fase="Fase 2" />
    </div>
  );
}
