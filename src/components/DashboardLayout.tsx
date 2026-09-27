import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FinancialSidebar } from "./FinancialSidebar";
import { NotificationPopover } from "./NotificationPopover";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      {/* 🎨 Bolhas animadas no fundo */}
      <div className="animated-bg" aria-hidden="true">
        <div className="blob" />
      </div>

      <div className="min-h-screen flex w-full bg-background/60 backdrop-blur-sm relative z-10">
        <FinancialSidebar />

        <div className="flex-1 flex flex-col overflow-visible">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <h1 className="text-lg font-semibold text-foreground">
                OrçaFácil
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <NotificationPopover />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto relative">
            <div className="fade-in-up">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}