import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthWrapper } from "./components/AuthWrapper";
import { DashboardLayout } from "./components/DashboardLayout";

import Overview from "./pages/Overview";
import Expenses from "./pages/Expenses";
import Revenue from "./pages/Revenue";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter basename="/orcafacil">
        <AuthWrapper>
          <Routes>

            {/* Dashboard */}
            <Route
              path="/"
              element={
                <DashboardLayout>
                  <Overview />
                </DashboardLayout>
              }
            />

            {/* Despesas */}
            <Route
              path="/despesas"
              element={
                <DashboardLayout>
                  <Expenses />
                </DashboardLayout>
              }
            />

            {/* Receitas */}
            <Route
              path="/receitas"
              element={
                <DashboardLayout>
                  <Revenue />
                </DashboardLayout>
              }
            />

            {/* Páginas ainda em construção */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </AuthWrapper>
      </BrowserRouter>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;