// ============================================================
// OrçaFácil — Modelo de dados
// ============================================================

export type PerfilTeto =
  | "muito-economico"
  | "economico"
  | "moderado"
  | "personalizado";

export type Tema = "light" | "dark" | "system";

export type StatusSemaforo = "verde" | "amarelo" | "vermelho";

export type TipoTransacao = "receita" | "despesa";

/** Tipo de pagamento do item do orçamento */
export type TipoPagamento = "fixo" | "variavel";

export interface Subcategoria {
  id: string;
  nome: string;
}

export interface Categoria {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  subcategorias: Subcategoria[];
  personalizada: boolean;
}

export interface Receita {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoriaId?: string;
  observacao?: string;
  criadaEm: string;
}

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: string;
  subcategoriaId?: string;
  mercado?: string;
  observacao?: string;
  criadaEm: string;
}

export interface Configuracao {
  salario: number;
  perfilTeto: PerfilTeto;
  tetoPercentual: number;
  tetoPersonalizado?: number;
  tema: Tema;
  moeda: string;
}

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

export interface PrecoItem {
  id: string;
  mercado: string;
  valor: number;
  data: string;
  observacao?: string;
}

export interface ItemOrcamento {
  id: string;
  nome: string;
  categoriaId: string;
  subcategoriaId: string;
  /** Tipo de pagamento: fixo (financiamento, aluguel) ou variável (mercado) */
  tipo: TipoPagamento;
  precos: PrecoItem[];
  observacao?: string;
  criadoEm: string;
}

export interface ComparacaoPreco {
  itemId: string;
  melhorMercadoId: string;
  melhorPreco: number;
  piorPreco: number;
  economia: number;
  status: StatusSemaforo;
}

export interface ResumoMensal {
  mes: string;
  totalReceitas: number;
  totalDespesas: number;
  teto: number;
  saldo: number;
  percentualUsado: number;
  status: StatusSemaforo;
  gastosPorCategoria: Array<{
    categoriaId: string;
    categoriaNome: string;
    valor: number;
    percentual: number;
  }>;
}

export interface FinanceStore {
  configuracao: Configuracao;
  receitas: Receita[];
  despesas: Despesa[];
  categorias: Categoria[];
  itensOrcamento: ItemOrcamento[];

  atualizarConfiguracao: (parcial: Partial<Configuracao>) => void;

  adicionarReceita: (receita: Omit<Receita, "id" | "criadaEm">) => void;
  atualizarReceita: (id: string, parcial: Partial<Receita>) => void;
  removerReceita: (id: string) => void;

  adicionarDespesa: (despesa: Omit<Despesa, "id" | "criadaEm">) => void;
  atualizarDespesa: (id: string, parcial: Partial<Despesa>) => void;
  removerDespesa: (id: string) => void;

  adicionarCategoria: (categoria: Omit<Categoria, "id">) => void;
  atualizarCategoria: (id: string, parcial: Partial<Categoria>) => void;
  removerCategoria: (id: string) => void;
  adicionarSubcategoria: (categoriaId: string, nome: string) => void;
  removerSubcategoria: (categoriaId: string, subcategoriaId: string) => void;

  adicionarItemOrcamento: (
    item: Omit<ItemOrcamento, "id" | "criadoEm">
  ) => void;
  atualizarItemOrcamento: (id: string, parcial: Partial<ItemOrcamento>) => void;
  removerItemOrcamento: (id: string) => void;
  adicionarPreco: (itemId: string, preco: Omit<PrecoItem, "id">) => void;
  removerPreco: (itemId: string, precoId: string) => void;

  resetarTudo: () => void;
}

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

export function calcularSemaforo(percentualUsado: number): StatusSemaforo {
  if (percentualUsado <= 70) return "verde";
  if (percentualUsado <= 90) return "amarelo";
  return "vermelho";
}

export function gerarId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}