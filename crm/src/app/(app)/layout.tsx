import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Logo } from "@/components/brand/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";
import { MobileTabbar } from "@/components/layout/mobile-tabbar";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card sm:flex">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar nome={session.user.name ?? session.user.email ?? "Usuário"} papel={session.user.papel} />
        <main className="flex-1 p-4 pb-20 sm:p-6 sm:pb-6">{children}</main>
      </div>

      <MobileTabbar />
    </div>
  );
}
