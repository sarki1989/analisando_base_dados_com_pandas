"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function MobileTabbar() {
  const pathname = usePathname();
  const itens = NAV_ITEMS.filter((i) => i.mobile);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card sm:hidden">
      {itens.map((item) => {
        const ativo = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icone = item.icone;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
              ativo ? "text-accent" : "text-muted-foreground"
            )}
          >
            <Icone className="size-5" />
            {item.titulo}
          </Link>
        );
      })}
    </nav>
  );
}
