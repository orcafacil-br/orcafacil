// ============================================================
// OrçaFácil — Hook de tema (claro/escuro/sistema)
// ============================================================

import { useEffect, useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";

export function useTheme() {
  const tema = useFinanceStore((s) => s.configuracao.tema);

  // Estado local pra forçar re-render quando o tema muda
  const [, setTick] = useState(0);

  useEffect(() => {
    const root = document.documentElement;

    const aplicar = (modo: "light" | "dark") => {
      if (modo === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      // 🔧 Força o navegador a recalcular os estilos
      // (bug conhecido: às vezes o navegador não reaplica as
      //  variáveis CSS quando a classe é adicionada via JS)
      void root.offsetHeight; // força reflow

      // Força re-render do React
      setTick((t) => t + 1);
    };

    // === Tema "sistema" → acompanha o SO ===
    if (tema === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      aplicar(mq.matches ? "dark" : "light");

      const handler = (e: MediaQueryListEvent) => {
        aplicar(e.matches ? "dark" : "light");
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }

    // === Tema "light" ou "dark" ===
    aplicar(tema);
  }, [tema]);

  return tema;
}