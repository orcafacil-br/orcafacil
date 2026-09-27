// ============================================================
// OrçaFácil — Modelo de dados
// ============================================================

// ------------------------------------------------------------
// Tipos base
// ------------------------------------------------------------

/** Perfil de teto de gastos escolhido pelo usuário */
export type PerfilTeto =
  | "muito-economico"
  | "economico"
  | "moderado"
  | "personalizado";

/** Tema de interface */
export type Tema = "light" | "dark" | "system";

/** Status do semáforo financeiro 🟢🟡🔴 */
export type StatusSemaforo = "verde" | "amarelo" | "vermelho";

/** Tipo de transação */
export type TipoTransacao = "receita" | "despesa";

// ------------------------------------------------------------
// Categorias e Subcategorias
// ------------------------------------------------------------

/** Subcategoria (ex: "Alimentos", "Higiene Pessoal") */
export interface Subcategoria {
  id: string;
  nome: string;
}

/** Categoria (ex: "Supermercado", "Serviços") */
export interface Categoria {
  id: string;
  nome: string;
  icone: string; // nome do ícone Lucide (ex: "ShoppingCart")
  cor: string; // cor em HSL ou HEX (ex: "#FF6B6B")
  subcategorias: Subcategoria[];
  personalizada: boolean; // true = criada pelo usuário; false = padrão
}

// ------------------------------------------------------------
// Receitas e Despesas
// ------------------------------------------------------------

/** Receita (salário, freelance, investimentos...) */
export interface Receita {
  id: string;
  descricao: string;
  valor: number; // em reais
  data: string; // ISO date "YYYY-MM-DD"
  categoriaId?: string; // opcional (ex: "salario", "freelance")
  observacao?: string;
  criadaEm: string; // ISO datetime
}

/** Despesa (supermercado, transporte, contas...) */
export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data: string; // ISO date
  categoriaId: string;
  subcategoriaId?: string;
  mercado?: string; // nome do estabelecimento (pra comparador)
  observacao?: string;
  criadaEm: string; // ISO datetime
}

// ------------------------------------------------------------
// Teto de Gastos / Configuração
// ------------------------------------------------------------

/** Configurações gerais do app */
export interface Configuracao {
  salario: number; // renda mensal base (R$)
  perfilTeto: PerfilTeto;
  tetoPercentual: number; // ex: 80 (%) — usado se personalizado ou ref. do perfil
  tetoPersonalizado?: number; // valor exato em R$ (se perfil = personalizado)
  tema: Tema;
  moeda: string; // "BRL" por padrão
}

/** Perfis padrão de teto (percentual do salário) */
export const PERFIS_TETO: Record<
  Exclude<PerfilTeto, "personalizado">,
  { label: string; percentual: number; descricao: string }
> = {
  "muito-economico": {
    label: "Muito Econômico",
    percentual: 50,
    descricao: "Guarde 50% do seu salário. Ideal pra metas agressivas.",
  },
  economico: {
    label: "Econômico",
    percentual: 65,
    descricao: "Teto de 65% do salário. Equilíbrio com folga pra poupar.",
  },
  moderado: {
    label: "Moderado",
    percentual: 80,
    descricao: "Teto de 80% do salário. Padrão recomendado.",
  },
};

// ------------------------------------------------------------
// Orçamento / Comparador de Preços
// ------------------------------------------------------------

/** Preço de um item em um mercado específico */
export interface PrecoItem {
  id: string;
  mercado: string; // nome do supermercado/loja
  valor: number; // R$
  data: string; // ISO date
  observacao?: string; // anotação livre (ex: "promoção", "marca X")
}

/** Item do orçamento — usado no comparador de preços */
export interface ItemOrcamento {
  id: string;
  nome: string; // ex: "Arroz 5kg"
  categoriaId: string;
  subcategoriaId: string;
  precos: PrecoItem[]; // lista de preços em vários mercados
  observacao?: string; // observação geral do item
  criadoEm: string;
}

/** Resultado do comparador (qual mercado é mais barato) */
export interface ComparacaoPreco {
  itemId: string;
  melhorMercadoId: string;
  melhorPreco: number;
  piorPreco: number;
  economia: number; // diferença entre pior e melhor
  status: StatusSemaforo;
}

// ------------------------------------------------------------
// Estado do mês (usado no Overview / semáforo)
// ------------------------------------------------------------

/** Resumo financeiro de um mês */
export interface ResumoMensal {
  mes: string; // "YYYY-MM"
  totalReceitas: number;
  totalDespesas: number;
  teto: number; // calculado a partir da config + perfil
  saldo: number; // receitas - despesas
  percentualUsado: number; // (despesas / teto) * 100
  status: StatusSemaforo;
  gastosPorCategoria: Array<{
    categoriaId: string;
    categoriaNome: string;
    valor: number;
    percentual: number;
  }>;
}

// ------------------------------------------------------------
// Store Zustand (estado global)
// ------------------------------------------------------------

export interface FinanceStore {
  // === Estado ===
  configuracao: Configuracao;
  receitas: Receita[];
  despesas: Despesa[];
  categorias: Categoria[];
  itensOrcamento: ItemOrcamento[];

  // === Configuração ===
  atualizarConfiguracao: (parcial: Partial<Configuracao>) => void;

  // === Receitas ===
  adicionarReceita: (receita: Omit<Receita, "id" | "criadaEm">) => void;
  atualizarReceita: (id: string, parcial: Partial<Receita>) => void;
  removerReceita: (id: string) => void;

  // === Despesas ===
  adicionarDespesa: (despesa: Omit<Despesa, "id" | "criadaEm">) => void;
  atualizarDespesa: (id: string, parcial: Partial<Despesa>) => void;
  removerDespesa: (id: string) => void;

  // === Categorias ===
  adicionarCategoria: (categoria: Omit<Categoria, "id">) => void;
  atualizarCategoria: (id: string, parcial: Partial<Categoria>) => void;
  removerCategoria: (id: string) => void;
  adicionarSubcategoria: (categoriaId: string, nome: string) => void;
  removerSubcategoria: (categoriaId: string, subcategoriaId: string) => void;

  // === Orçamento / Comparador ===
  adicionarItemOrcamento: (
    item: Omit<ItemOrcamento, "id" | "criadoEm">
  ) => void;
  atualizarItemOrcamento: (id: string, parcial: Partial<ItemOrcamento>) => void;
  removerItemOrcamento: (id: string) => void;
  adicionarPreco: (
    itemId: string,
    preco: Omit<PrecoItem, "id">
  ) => void;
  removerPreco: (itemId: string, precoId: string) => void;

  // === Utilidades ===
  resetarTudo: () => void;
}

// ------------------------------------------------------------
// Helpers de categorias padrão
// ------------------------------------------------------------

/** Retorna o teto em R$ baseado na configuração */
export function calcularTeto(config: Configuracao): number {
  if (config.perfilTeto === "personalizado" && config.tetoPersonalizado) {
    return config.tetoPersonalizado;
  }
  const perfil =
    config.perfilTeto === "personalizado"
      ? PERFIS_TETO.moderado
      : PERFIS_TETO[config.perfilTeto];
  return (config.salario * perfil.percentual) / 100;
}

/** Calcula o status do semáforo baseado no % usado */
export function calcularSemaforo(percentualUsado: number): StatusSemaforo {
  if (percentualUsado <= 70) return "verde";
  if (percentualUsado <= 90) return "amarelo";
  return "vermelho";
}

/** Gera um ID único simples */
export function gerarId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}