// Ícone da marca Stokes Brasil: anel de 8 segmentos (7 grafite + 1 âmbar),
// reconstruído a partir das especificações do Manual de Aplicação da Marca
// (seção 03 — Ícone, padrão 8 segmentos).
export function LogoIcon({ className, size = 32 }: { className?: string; size?: number }) {
  const segments = Array.from({ length: 8 }, (_, i) => i);
  const destaque = 2; // índice do segmento âmbar

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Stokes Brasil"
    >
      {segments.map((i) => {
        const angulo = (360 / segments.length) * i;
        return (
          <rect
            key={i}
            x="44"
            y="6"
            width="12"
            height="30"
            rx="4"
            fill={i === destaque ? "#E2601A" : "#1A1D21"}
            transform={`rotate(${angulo} 50 50)`}
          />
        );
      })}
    </svg>
  );
}
