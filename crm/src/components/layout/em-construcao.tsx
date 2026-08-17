import { Construction } from "lucide-react";

export function EmConstrucao({ titulo, fase }: { titulo: string; fase: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-24 text-center text-muted-foreground">
      <Construction className="size-8" />
      <div>
        <p className="font-medium text-foreground">{titulo}</p>
        <p className="text-sm">Esta tela será construída na {fase}.</p>
      </div>
    </div>
  );
}
