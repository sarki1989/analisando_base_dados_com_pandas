import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  Truck,
  MousePointerClick,
  ListChecks,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  titulo: string;
  href: string;
  icone: LucideIcon;
  /** Aparece também na barra inferior no celular */
  mobile?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { titulo: "Dashboard", href: "/", icone: LayoutDashboard, mobile: true },
  { titulo: "Leads", href: "/leads", icone: Users, mobile: true },
  { titulo: "Cotações", href: "/cotacoes", icone: FileText, mobile: true },
  { titulo: "Pedidos", href: "/pedidos", icone: Truck, mobile: true },
  { titulo: "Tarefas", href: "/tarefas", icone: ListChecks },
  { titulo: "Produtos", href: "/produtos", icone: Package },
  { titulo: "Cliques sem lead", href: "/cliques", icone: MousePointerClick },
  { titulo: "Configurações", href: "/configuracoes", icone: Settings },
];
