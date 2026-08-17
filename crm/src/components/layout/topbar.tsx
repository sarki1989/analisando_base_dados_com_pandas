"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/brand/logo";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { GlobalSearch } from "./global-search";

export function Topbar({ nome, papel }: { nome: string; papel: string }) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
      <div className="flex shrink-0 items-center gap-2 sm:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">
          <Menu className="size-5" />
        </Button>
        <Logo />
      </div>

      <div className="flex flex-1 justify-center sm:justify-start">
        <GlobalSearch />
      </div>

      <UserMenu nome={nome} papel={papel} />

      <Dialog open={menuAberto} onOpenChange={setMenuAberto}>
        <DialogContent className="max-w-xs p-0" showCloseButton>
          <DialogTitle className="sr-only">Menu de navegação</DialogTitle>
          <div className="border-b border-border p-4">
            <Logo />
          </div>
          <SidebarNav onNavigate={() => setMenuAberto(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
}
