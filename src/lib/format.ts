// ============================================================
// OrçaFácil — Helpers de formatação
// ============================================================

// ------------------------------------------------------------
// Moeda (BRL)
// ------------------------------------------------------------

/** Formata um número como moeda brasileira. Ex: 1234.5 → "R$ 1.234,50" */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/** Formata sem o "R$". Ex: 1234.5 → "1.234,50" */
export function formatarNumero(valor: number, casas = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor);
}

/** Formata em versão compacta. Ex: 12500 → "R$ 12,5 mil" */
export function formatarMoedaCompacta(valor: number): string {
  if (Math.abs(valor) >= 1_000_000) {
    return `R$ ${(valor / 1_000_000).toFixed(1).replace(".", ",")} mi`;
  }
  if (Math.abs(valor) >= 1_000) {
    return `R$ ${(valor / 1_000).toFixed(1).replace(".", ",")} mil`;
  }
  return formatarMoeda(valor);
}

/**
 * Formata um valor digitado como moeda BRL progressivamente (máscara de input).
 * Ex: "1" → "0,01"
 * Ex: "17" → "0,17"
 * Ex: "1700" → "17,00"
 * Ex: "170000" → "1.700,00"
 */
export function formatarInputMoeda(valorDigitado: string): string {
  // Remove tudo que não é dígito
  const apenasDigitos = valorDigitado.replace(/\D/g, "");

  if (!apenasDigitos) return "";

  // Converte pra centavos
  const numero = parseInt(apenasDigitos, 10);
  const reais = numero / 100;

  // Formata como moeda BRL (sem o R$)
  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Extrai o número de uma string formatada em BRL.
 * Ex: "1.700,00" → 1700
 * Ex: "0,01" → 0.01
 * Ex: "" → 0
 */
export function parsearMoedaBR(valorFormatado: string): number {
  if (!valorFormatado) return 0;
  const limpo = valorFormatado
    .replace(/\./g, "")   // remove pontos de milhar
    .replace(",", ".");   // troca vírgula por ponto
  return parseFloat(limpo) || 0;
}

// ------------------------------------------------------------
// Percentual
// ------------------------------------------------------------

/** Formata um número como percentual. Ex: 42.5 → "42,5%" */
export function formatarPercentual(valor: number, casas = 1): string {
  return `${valor.toFixed(casas).replace(".", ",")}%`;
}

/** Formata com sinal (+/-). Ex: -12.3 → "-12,3%" */
export function formatarPercentualComSinal(valor: number, casas = 1): string {
  const sinal = valor >= 0 ? "+" : "";
  return `${sinal}${valor.toFixed(casas).replace(".", ",")}%`;
}

// ------------------------------------------------------------
// Datas
// ------------------------------------------------------------

/** Formata uma data ISO "2025-01-15" → "15/01/2025" */
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Formata uma data ISO → "15 jan 2025" */
export function formatarDataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  const meses = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez",
  ];
  const mesNum = parseInt(mes, 10) - 1;
  return `${dia} ${meses[mesNum]} ${ano}`;
}

/** Retorna a data de hoje em formato ISO "YYYY-MM-DD" */
export function hojeISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Retorna o mês atual em formato "YYYY-MM" */
export function mesAtual(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Retorna o mês de uma data ISO "2025-01-15" → "2025-01" */
export function mesDeISO(iso: string): string {
  return iso.slice(0, 7);
}

/** Retorna o nome do mês em português. Ex: "2025-01" → "Janeiro de 2025" */
export function nomeMes(mesAno: string): string {
  const [ano, mes] = mesAno.split("-");
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const mesNum = parseInt(mes, 10) - 1;
  return `${meses[mesNum]} de ${ano}`;
}

/** Verifica se a data ISO pertence ao mês atual */
export function ehDoMesAtual(iso: string): boolean {
  return iso.startsWith(mesAtual());
}

// ------------------------------------------------------------
// Helpers auxiliares
// ------------------------------------------------------------

/** Formata o status do semáforo em texto legível */
export function labelSemaforo(status: "verde" | "amarelo" | "vermelho"): string {
  switch (status) {
    case "verde":
      return "Tudo certo";
    case "amarelo":
      return "Atenção";
    case "vermelho":
      return "Risco financeiro";
  }
}

/** Retorna as classes de cor do Tailwind pro semáforo */
export function corSemaforo(status: "verde" | "amarelo" | "vermelho"): {
  bg: string;
  text: string;
  border: string;
  emoji: string;
} {
  switch (status) {
    case "verde":
      return {
        bg: "bg-green-100 dark:bg-green-950/40",
        text: "text-green-700 dark:text-green-400",
        border: "border-green-300 dark:border-green-800",
        emoji: "🟢",
      };
    case "amarelo":
      return {
        bg: "bg-yellow-100 dark:bg-yellow-950/40",
        text: "text-yellow-700 dark:text-yellow-400",
        border: "border-yellow-300 dark:border-yellow-800",
        emoji: "🟡",
      };
    case "vermelho":
      return {
        bg: "bg-red-100 dark:bg-red-950/40",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-300 dark:border-red-800",
        emoji: "🔴",
      };
  }
}