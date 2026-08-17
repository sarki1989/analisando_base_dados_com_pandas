import { LogoIcon } from "./logo-icon";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoIcon size={30} />
      <div className="leading-none">
        <div className="text-base font-extrabold tracking-tight text-foreground">
          STOKES
          <div className="-mt-0.5 h-[2px] w-full bg-accent" />
        </div>
        <div className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground">
          BRASIL
        </div>
      </div>
    </div>
  );
}
