// ============================================================
// OrçaFácil — Store global (Zustand + persist + localStorage)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type FinanceStore,
  type Categoria,
  type Configuracao,
  type Despesa,
  type ItemOrcamento,
  type Receita,
  gerarId,
} from "@/types/finance";

// ------------------------------------------------------------
// Categorias padrão do OrçaFácil
// ------------------------------------------------------------

const CATEGORIAS_PADRAO: Categoria[] = [
  {
    id: "supermercado",
    nome: "Supermercado",
    icone: "ShoppingCart",
    cor: "#FF6B6B",
    personalizada: false,
    subcategorias: [
      { id: "alimentos", nome: "Alimentos" },
      { id: "bebidas", nome: "Bebidas" },
      { id: "higiene-pessoal", nome: "Higiene Pessoal" },
      { id: "limpeza", nome: "Limpeza" },
      { id: "congelados", nome: "Congelados" },
    ],
  },
  {
    id: "servicos",
    nome: "Serviços",
    icone: "Wrench",
    cor: "#4D96FF",
    personalizada: false,
    subcategorias: [
      { id: "manutencao-veicular", nome: "Manutenção Veicular" },
      { id: "reforma-casa", nome: "Reforma Casa" },
      { id: "reforma-apartamento", nome: "Reforma Apartamento" },
      { id: "eletrica", nome: "Elétrica" },
      { id: "hidraulica", nome: "Hidráulica" },
    ],
  },
  {
    id: "moradia",
    nome: "Moradia",
    icone: "Home",
    cor: "#845EC2",
    personalizada: false,
    subcategorias: [
      { id: "aluguel", nome: "Aluguel" },
      { id: "condominio", nome: "Condomínio" },
      { id: "iptu", nome: "IPTU" },
      { id: "energia", nome: "Energia" },
      { id: "agua", nome: "Água" },
      { id: "internet", nome: "Internet" },
    ],
  },
  {
    id: "transporte",
    nome: "Transporte",
    icone: "Car",
    cor: "#FF9671",
    personalizada: false,
    subcategorias: [
      { id: "combustivel", nome: "Combustível" },
      { id: "uber", nome: "Uber / 99" },
      { id: "onibus", nome: "Ônibus / Metrô" },
      { id: "estacionamento", nome: "Estacionamento" },
      { id: "manutencao", nome: "Manutenção" },
    ],
  },
  {
    id: "saude",
    nome: "Saúde",
    icone: "HeartPulse",
    cor: "#6BCB77",
    personalizada: false,
    subcategorias: [
      { id: "plano-saude", nome: "Plano de Saúde" },
      { id: "farmacia", nome: "Farmácia" },
      { id: "consultas", nome: "Consultas" },
      { id: "exames", nome: "Exames" },
      { id: "dentista", nome: "Dentista" },
    ],
  },
  {
    id: "lazer",
    nome: "Lazer",
    icone: "Gamepad2",
    cor: "#FFD93D",
    personalizada: false,
    subcategorias: [
      { id: "streaming", nome: "Streaming" },
      { id: "jogos", nome: "Jogos" },
      { id: "viagens", nome: "Viagens" },
      { id: "restaurantes", nome: "Restaurantes" },
      { id: "cinema", nome: "Cinema" },
    ],
  },
  {
    id: "educacao",
    nome: "Educação",
    icone: "GraduationCap",
    cor: "#00C9A7",
    personalizada: false,
    subcategorias: [
      { id: "cursos", nome: "Cursos" },
      { id: "livros", nome: "Livros" },
      { id: "faculdade", nome: "Faculdade" },
      { id: "idiomas", nome: "Idiomas" },
    ],
  },
  {
    id: "outros",
    nome: "Outros",
    icone: "MoreHorizontal",
    cor: "#9B5DE5",
    personalizada: false,
    subcategorias: [
      { id: "presentes", nome: "Presentes" },
      { id: "doacoes", nome: "Doações" },
      { id: "imprevistos", nome: "Imprevistos" },
    ],
  },
];

// ------------------------------------------------------------
// Configuração padrão
// ------------------------------------------------------------

const CONFIGURACAO_PADRAO: Configuracao = {
  salario: 0,
  perfilTeto: "moderado",
  tetoPercentual: 80,
  tetoPersonalizado: undefined,
  tema: "system",
  moeda: "BRL",
};

// ------------------------------------------------------------
// Store
// ------------------------------------------------------------

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      // === Estado inicial ===
      configuracao: CONFIGURACAO_PADRAO,
      receitas: [],
      despesas: [],
      categorias: CATEGORIAS_PADRAO,
      itensOrcamento: [],

      // === Configuração ===
      atualizarConfiguracao: (parcial) =>
        set((state) => ({
          configuracao: { ...state.configuracao, ...parcial },
        })),

      // === Receitas ===
      adicionarReceita: (receita) =>
        set((state) => ({
          receitas: [
            ...state.receitas,
            { ...receita, id: gerarId(), criadaEm: new Date().toISOString() },
          ],
        })),

      atualizarReceita: (id, parcial) =>
        set((state) => ({
          receitas: state.receitas.map((r) =>
            r.id === id ? { ...r, ...parcial } : r
          ),
        })),

      removerReceita: (id) =>
        set((state) => ({
          receitas: state.receitas.filter((r) => r.id !== id),
        })),

      // === Despesas ===
      adicionarDespesa: (despesa) =>
        set((state) => ({
          despesas: [
            ...state.despesas,
            { ...despesa, id: gerarId(), criadaEm: new Date().toISOString() },
          ],
        })),

      atualizarDespesa: (id, parcial) =>
        set((state) => ({
          despesas: state.despesas.map((d) =>
            d.id === id ? { ...d, ...parcial } : d
          ),
        })),

      removerDespesa: (id) =>
        set((state) => ({
          despesas: state.despesas.filter((d) => d.id !== id),
        })),

      // === Categorias ===
      adicionarCategoria: (categoria) =>
        set((state) => ({
          categorias: [...state.categorias, { ...categoria, id: gerarId() }],
        })),

      atualizarCategoria: (id, parcial) =>
        set((state) => ({
          categorias: state.categorias.map((c) =>
            c.id === id ? { ...c, ...parcial } : c
          ),
        })),

      removerCategoria: (id) =>
        set((state) => ({
          categorias: state.categorias.filter((c) => c.id !== id),
        })),

      adicionarSubcategoria: (categoriaId, nome) =>
        set((state) => ({
          categorias: state.categorias.map((c) =>
            c.id === categoriaId
              ? {
                  ...c,
                  subcategorias: [
                    ...c.subcategorias,
                    { id: gerarId(), nome },
                  ],
                }
              : c
          ),
        })),

      removerSubcategoria: (categoriaId, subcategoriaId) =>
        set((state) => ({
          categorias: state.categorias.map((c) =>
            c.id === categoriaId
              ? {
                  ...c,
                  subcategorias: c.subcategorias.filter(
                    (s) => s.id !== subcategoriaId
                  ),
                }
              : c
          ),
        })),

      // === Orçamento / Comparador ===
      adicionarItemOrcamento: (item) =>
        set((state) => ({
          itensOrcamento: [
            ...state.itensOrcamento,
            { ...item, id: gerarId(), criadoEm: new Date().toISOString() },
          ],
        })),

      atualizarItemOrcamento: (id, parcial) =>
        set((state) => ({
          itensOrcamento: state.itensOrcamento.map((i) =>
            i.id === id ? { ...i, ...parcial } : i
          ),
        })),

      removerItemOrcamento: (id) =>
        set((state) => ({
          itensOrcamento: state.itensOrcamento.filter((i) => i.id !== id),
        })),

      adicionarPreco: (itemId, preco) =>
        set((state) => ({
          itensOrcamento: state.itensOrcamento.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  precos: [...i.precos, { ...preco, id: gerarId() }],
                }
              : i
          ),
        })),

      removerPreco: (itemId, precoId) =>
        set((state) => ({
          itensOrcamento: state.itensOrcamento.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  precos: i.precos.filter((p) => p.id !== precoId),
                }
              : i
          ),
        })),

      // === Utilidades ===
      resetarTudo: () =>
        set({
          configuracao: CONFIGURACAO_PADRAO,
          receitas: [],
          despesas: [],
          categorias: CATEGORIAS_PADRAO,
          itensOrcamento: [],
        }),
    }),
    {
      name: "orcafacil-storage", // chave no localStorage
      version: 1,
    }
  )
);