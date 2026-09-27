import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Target,
  ShoppingCart,
  Settings,
  ChartNoAxesCombined,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Despesas", url: "/despesas", icon: ArrowDownToLine },
  { title: "Receitas", url: "/receitas", icon: ArrowUpFromLine },
  { title: "Orçamento", url: "/orcamento", icon: Target },
  { title: "Comparador", url: "/comparador", icon: ShoppingCart },
  { title: "Planejamento", url: "/planejamento", icon: ChartNoAxesCombined },
];

const secondaryNavItems = [
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function FinancialSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  /**
   * Classes do item:
   *
   * MODO CLARO:
   *  - Ativo: fundo azul + texto branco (fixo)
   *  - Inativo: texto normal, hover fica azul
   *
   * MODO ESCURO:
   *  - Ativo: SEM destaque azul fixo
   *  - Inativo: texto claro normal, hover fica azul
   */
  const itemClasses = (isActive: boolean) => {
    const base =
      "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all duration-200";

    // No MODO CLARO: item ativo tem fundo azul
    // No MODO ESCURO: dark:bg-transparent SOBRESCREVE o azul
    const classesAtivo = [
      "bg-primary text-primary-foreground shadow-md shadow-primary/30",
      "dark:bg-transparent dark:text-foreground dark:shadow-none",
    ].join(" ");

    // Inativo: texto normal + hover azul em ambos os modos
    const classesInativo = [
      "text-foreground",
      "hover:bg-primary/10 hover:text-primary",
      "dark:hover:bg-primary/20 dark:hover:text-primary",
    ].join(" ");

    return `${base} ${isActive ? classesAtivo : classesInativo}`;
  };

  return (
    <Sidebar className="border-r border-border bg-card" collapsible="icon">
      {/* Logo */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-foreground">
                OrçaFácil
              </h2>
              <p className="text-xs text-muted-foreground">
                Controle financeiro
              </p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="px-3 py-5">
        {/* Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            PRINCIPAL
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {mainNavItems.map((item) => {
                const Icone = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) => itemClasses(isActive)}
                    >
                      <Icone className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sistema */}
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            SISTEMA
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {secondaryNavItems.map((item) => {
                const Icone = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => itemClasses(isActive)}
                    >
                      <Icone className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}