import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";

import Overview from "./pages/Overview";
import Despesas from "./pages/Despesas";
import Receitas from "./pages/Receitas";
import Orcamento from "./pages/Orcamento";
import Comparador from "./pages/Comparador";
import Planejamento from "./pages/Planejamento";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

// Aplica o tema (claro/escuro/sistema) automaticamente
import { useTheme } from "./hooks/useTheme";

function AppContent() {
  useTheme();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <DashboardLayout>
            <Overview />
          </DashboardLayout>
        }
      />
      <Route
        path="/despesas"
        element={
          <DashboardLayout>
            <Despesas />
          </DashboardLayout>
        }
      />
      <Route
        path="/receitas"
        element={
          <DashboardLayout>
            <Receitas />
          </DashboardLayout>
        }
      />
      <Route
        path="/orcamento"
        element={
          <DashboardLayout>
            <Orcamento />
          </DashboardLayout>
        }
      />
      <Route
        path="/comparador"
        element={
          <DashboardLayout>
            <Comparador />
          </DashboardLayout>
        }
      />
      <Route
        path="/planejamento"
        element={
          <DashboardLayout>
            <Planejamento />
          </DashboardLayout>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <DashboardLayout>
            <Configuracoes />
          </DashboardLayout>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />

    <BrowserRouter basename={import.meta.env.PROD ? "/orcafacil" : "/"}>
      <AppContent />
    </BrowserRouter>
  </TooltipProvider>
);

export default App;