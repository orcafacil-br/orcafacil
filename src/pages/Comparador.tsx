import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Trash2,
  ShoppingCart,
  TrendingDown,
  Award,
  Store,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useFinanceStore } from "@/store/useFinanceStore";
import { calcularSemaforo, type ItemOrcamento } from "@/types/finance";
import {
  formatarMoeda,
  formatarDataCurta,
  formatarInputMoeda,
  parsearMoedaBR,
  hojeISO,
} from "@/lib/format";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// Página
// ------------------------------------------------------------

export default function Comparador() {
  const {
    itensOrcamento,
    categorias,
    adicionarItemOrcamento,
    removerItemOrcamento,
    adicionarPreco,
    removerPreco,
  } = useFinanceStore();

  // === Estado dos modais ===
  const [novoItemOpen, setNovoItemOpen] = useState(false);
  const [novoPrecoItem, setNovoPrecoItem] = useState<string | null>(null);
  const [itemParaRemover, setItemParaRemover] = useState<string | null>(null);
  const [precoParaRemover, setPrecoParaRemover] = useState<{
    itemId: string;
    precoId: string;
  } | null>(null);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  // === Formulário: Novo Item ===
  const [formItem, setFormItem] = useState({
    nome: "",
    categoriaId: "",
    subcategoriaId: "",
    observacao: "",
  });

  // === Formulário: Novo Preço ===
  const [formPreco, setFormPreco] = useState({
    mercado: "",
    valor: "",
    data: hojeISO(),
    observacao: "",
  });

  // === Categoria selecionada ===
  const categoriaSelecionada = useMemo(() => {
    return categorias.find((c) => c.id === formItem.categoriaId) || null;
  }, [formItem.categoriaId, categorias]);

  // === Helpers ===
  const toggleExpandido = (id: string) => {
    const novo = new Set(expandidos);
    if (novo.has(id)) novo.delete(id);
    else novo.add(id);
    setExpandidos(novo);
  };

  // === Handlers: Item ===
  const handleAbrirNovoItem = () => {
    setFormItem({
      nome: "",
      categoriaId: "",
      subcategoriaId: "",
      observacao: "",
    });
    setNovoItemOpen(true);
  };

  const handleSalvarItem = () => {
    if (!formItem.nome.trim()) {
      toast.error("Digite o nome do item.");
      return;
    }
    if (!formItem.categoriaId) {
      toast.error("Selecione uma categoria.");
      return;
    }

    adicionarItemOrcamento({
      nome: formItem.nome.trim(),
      categoriaId: formItem.categoriaId,
      subcategoriaId: formItem.subcategoriaId || "",
      precos: [],
      observacao: formItem.observacao.trim() || undefined,
    });

    toast.success("Item criado! Agora adicione os preços.");
    setNovoItemOpen(false);
  };

  const handleConfirmarRemoverItem = () => {
    if (itemParaRemover) {
      removerItemOrcamento(itemParaRemover);
      toast.success("Item removido.");
      setItemParaRemover(null);
    }
  };

  // === Handlers: Preço ===
  const handleAbrirNovoPreco = (itemId: string) => {
    setFormPreco({
      mercado: "",
      valor: "",
      data: hojeISO(),
      observacao: "",
    });
    setNovoPrecoItem(itemId);
  };

  // === 🆕 Handler do valor com máscara ===
  const handleValorChange = (valorDigitado: string) => {
    const formatado = formatarInputMoeda(valorDigitado);
    setFormPreco({ ...formPreco, valor: formatado });
  };

  const handleSalvarPreco = () => {
    if (!novoPrecoItem) return;
    if (!formPreco.mercado.trim()) {
      toast.error("Digite o nome do mercado.");
      return;
    }

    const valorNum = parsearMoedaBR(formPreco.valor);
    if (!valorNum || valorNum <= 0) {
      toast.error("Digite um valor válido.");
      return;
    }

    adicionarPreco(novoPrecoItem, {
      mercado: formPreco.mercado.trim(),
      valor: valorNum,
      data: formPreco.data,
      observacao: formPreco.observacao.trim() || undefined,
    });

    toast.success("Preço adicionado!");
    setNovoPrecoItem(null);
  };

  const handleConfirmarRemoverPreco = () => {
    if (precoParaRemover) {
      removerPreco(precoParaRemover.itemId, precoParaRemover.precoId);
      toast.success("Preço removido.");
      setPrecoParaRemover(null);
    }
  };

  // === Análise ===
  const analisarItem = (item: ItemOrcamento) => {
    if (item.precos.length === 0) return null;

    const precosOrdenados = [...item.precos].sort((a, b) => a.valor - b.valor);
    const melhor = precosOrdenados[0];
    const pior = precosOrdenados[precosOrdenados.length - 1];
    const economia = pior.valor - melhor.valor;
    const economiaPercentual =
      pior.valor > 0 ? (economia / pior.valor) * 100 : 0;

    let status: "verde" | "amarelo" | "vermelho";
    let label: string;

    if (item.precos.length === 1) {
      status = "amarelo";
      label = "Adicione mais preços para comparar";
    } else if (economiaPercentual >= 20) {
      status = "verde";
      label = "Economia significativa";
    } else if (economiaPercentual >= 10) {
      status = "amarelo";
      label = "Economia moderada";
    } else {
      status = "vermelho";
      label = "Pouca diferença";
    }

    return {
      melhor,
      pior,
      economia,
      economiaPercentual,
      status,
      label,
      precosOrdenados,
    };
  };

  const totalItens = itensOrcamento.length;
  const totalPrecos = itensOrcamento.reduce(
    (s, i) => s + i.precos.length,
    0
  );

  const economiaTotal = useMemo(() => {
    return itensOrcamento.reduce((soma, item) => {
      if (item.precos.length < 2) return soma;
      const valores = item.precos.map((p) => p.valor);
      const maior = Math.max(...valores);
      const menor = Math.min(...valores);
      return soma + (maior - menor);
    }, 0);
  }, [itensOrcamento]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comparador</h1>
          <p className="text-muted-foreground">
            Cadastre itens e compare preços entre mercados
          </p>
        </div>
        <Button onClick={handleAbrirNovoItem}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Itens cadastrados
              </p>
              <p className="text-2xl font-bold">{totalItens}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalPrecos} preço{totalPrecos !== 1 ? "s" : ""} registrado
                {totalPrecos !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Economia potencial
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatarMoeda(economiaTotal)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                se escolher sempre o menor preço
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Melhor mercado
              </p>
              <p className="text-2xl font-bold">
                {(() => {
                  const contagem = new Map<string, number>();
                  itensOrcamento.forEach((item) => {
                    if (item.precos.length < 2) return;
                    const menor = [...item.precos].sort(
                      (a, b) => a.valor - b.valor
                    )[0];
                    contagem.set(
                      menor.mercado,
                      (contagem.get(menor.mercado) || 0) + 1
                    );
                  });
                  if (contagem.size === 0) return "—";
                  return [...contagem.entries()].sort(
                    (a, b) => b[1] - a[1]
                  )[0][0];
                })()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                venceu mais vezes
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de itens */}
      {itensOrcamento.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium mb-1">Nenhum item cadastrado</p>
          <p className="text-sm text-muted-foreground mb-4">
            Cadastre itens (ex: "Arroz 5kg") e compare preços em vários
            mercados.
          </p>
          <Button onClick={handleAbrirNovoItem} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar primeiro item
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {itensOrcamento.map((item) => {
            const analise = analisarItem(item);
            const expandido = expandidos.has(item.id);
            const categoria = categorias.find(
              (c) => c.id === item.categoriaId
            );
            const subcategoria = categoria?.subcategorias.find(
              (s) => s.id === item.subcategoriaId
            );

            return (
              <Card key={item.id} className="overflow-hidden">
                {/* Cabeçalho do item */}
                <div
                  className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleExpandido(item.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: `${categoria?.cor ?? "#9B5DE5"}20`,
                        }}
                      >
                        <ShoppingCart
                          className="w-6 h-6"
                          // @ts-ignore
                          style={{ color: categoria?.cor ?? "#9B5DE5" }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base truncate">
                          {item.nome}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {categoria?.nome}
                          {subcategoria && ` › ${subcategoria.nome}`} •{" "}
                          {item.precos.length} preço
                          {item.precos.length !== 1 ? "s" : ""}
                        </p>
                        {item.observacao && (
                          <p className="text-xs text-muted-foreground italic mt-1">
                            "{item.observacao}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {analise && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs whitespace-nowrap",
                            analise.status === "verde" &&
                              "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
                            analise.status === "amarelo" &&
                              "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
                            analise.status === "vermelho" &&
                              "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                          )}
                        >
                          {analise.status === "verde" && "🟢"}
                          {analise.status === "amarelo" && "🟡"}
                          {analise.status === "vermelho" && "🔴"}{" "}
                          {formatarMoeda(analise.melhor.valor)}
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemParaRemover(item.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>

                      {expandido ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {expandido && (
                  <div className="border-t bg-muted/20 p-5 space-y-4">
                    {analise && analise.melhor && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                          <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">
                            🟢 Melhor preço
                          </p>
                          <p className="font-bold text-sm">
                            {formatarMoeda(analise.melhor.valor)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {analise.melhor.mercado}
                          </p>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                          <p className="text-xs text-red-700 dark:text-red-400 font-medium mb-1">
                            🔴 Pior preço
                          </p>
                          <p className="font-bold text-sm">
                            {formatarMoeda(analise.pior.valor)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {analise.pior.mercado}
                          </p>
                        </div>
                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <p className="text-xs text-primary font-medium mb-1">
                            💰 Economia
                          </p>
                          <p className="font-bold text-sm">
                            {formatarMoeda(analise.economia)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {analise.economiaPercentual.toFixed(0)}% do maior
                          </p>
                        </div>
                        <div
                          className={cn(
                            "p-3 rounded-lg border",
                            analise.status === "verde" &&
                              "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
                            analise.status === "amarelo" &&
                              "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900",
                            analise.status === "vermelho" &&
                              "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                          )}
                        >
                          <p className="text-xs font-medium mb-1">
                            Recomendação
                          </p>
                          <p className="font-bold text-xs">
                            {analise.status === "verde" && "Pode comprar 👍"}
                            {analise.status === "amarelo" && "Cuidado ⚠️"}
                            {analise.status === "vermelho" && "Atenção 🔴"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {analise.label}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Lista de preços */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium">
                          Preços registrados
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAbrirNovoPreco(item.id);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar preço
                        </Button>
                      </div>

                      {item.precos.length === 0 ? (
                        <div className="text-center py-6 text-sm text-muted-foreground">
                          Nenhum preço cadastrado. Adicione o primeiro!
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {[...item.precos]
                            .sort((a, b) => a.valor - b.valor)
                            .map((preco) => {
                              const ehMaisBarato =
                                analise &&
                                preco.id === analise.melhor.id &&
                                item.precos.length > 1;
                              return (
                                <div
                                  key={preco.id}
                                  className={cn(
                                    "flex items-center justify-between p-3 rounded-lg group",
                                    ehMaisBarato
                                      ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                                      : "bg-background border border-border"
                                  )}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {ehMaisBarato && (
                                      <Award className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    )}
                                    <Store className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-sm truncate">
                                        {preco.mercado}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                          {formatarDataCurta(preco.data)}
                                        </span>
                                        {preco.observacao && (
                                          <>
                                            <span>•</span>
                                            <span className="italic truncate">
                                              {preco.observacao}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "font-semibold text-sm whitespace-nowrap",
                                        ehMaisBarato &&
                                          "text-green-600 dark:text-green-400"
                                      )}
                                    >
                                      {formatarMoeda(preco.valor)}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPrecoParaRemover({
                                          itemId: item.id,
                                          precoId: preco.id,
                                        });
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Novo Item */}
      <Dialog open={novoItemOpen} onOpenChange={setNovoItemOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Item</DialogTitle>
            <DialogDescription>
              Cadastre um item para começar a comparar preços.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nome-item">Nome do item *</Label>
              <Input
                id="nome-item"
                placeholder="Ex: Arroz 5kg"
                value={formItem.nome}
                onChange={(e) =>
                  setFormItem({ ...formItem, nome: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-item">Categoria *</Label>
              <Select
                value={formItem.categoriaId}
                onValueChange={(v) =>
                  setFormItem({
                    ...formItem,
                    categoriaId: v,
                    subcategoriaId: "",
                  })
                }
              >
                <SelectTrigger id="cat-item">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.cor }}
                        />
                        <span>{cat.nome}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {categoriaSelecionada &&
              categoriaSelecionada.subcategorias.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="sub-item">
                    Subcategoria{" "}
                    <span className="text-muted-foreground font-normal">
                      (opcional)
                    </span>
                  </Label>
                  <Select
                    value={formItem.subcategoriaId || "nenhuma"}
                    onValueChange={(v) =>
                      setFormItem({
                        ...formItem,
                        subcategoriaId: v === "nenhuma" ? "" : v,
                      })
                    }
                  >
                    <SelectTrigger id="sub-item">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhuma">
                        <span className="text-muted-foreground">
                          Sem subcategoria
                        </span>
                      </SelectItem>
                      {categoriaSelecionada.subcategorias.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

            <div className="space-y-2">
              <Label htmlFor="obs-item">
                Observação{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Textarea
                id="obs-item"
                placeholder="Ex: marca preferida, embalagem..."
                value={formItem.observacao}
                onChange={(e) =>
                  setFormItem({ ...formItem, observacao: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoItemOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarItem}>Criar item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Novo Preço */}
      <Dialog
        open={!!novoPrecoItem}
        onOpenChange={(o) => !o && setNovoPrecoItem(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar preço</DialogTitle>
            <DialogDescription>
              Cadastre o preço deste item em um mercado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="mercado">Mercado / Estabelecimento *</Label>
              <Input
                id="mercado"
                placeholder="Ex: Supermercado Extra"
                value={formPreco.mercado}
                onChange={(e) =>
                  setFormPreco({ ...formPreco, mercado: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="valor-preco">Valor *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input
                    id="valor-preco"
                    type="text"
                    inputMode="numeric"
                    placeholder="0,00"
                    value={formPreco.valor}
                    onChange={(e) => handleValorChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-preco">Data *</Label>
                <Input
                  id="data-preco"
                  type="date"
                  value={formPreco.data}
                  max={hojeISO()}
                  onChange={(e) =>
                    setFormPreco({ ...formPreco, data: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="obs-preco">
                Observação{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Textarea
                id="obs-preco"
                placeholder="Ex: promoção, marca X"
                value={formPreco.observacao}
                onChange={(e) =>
                  setFormPreco({ ...formPreco, observacao: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoPrecoItem(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarPreco}>Salvar preço</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar remoção de item */}
      <AlertDialog
        open={!!itemParaRemover}
        onOpenChange={(o) => !o && setItemParaRemover(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover item?</AlertDialogTitle>
            <AlertDialogDescription>
              O item e todos os seus preços serão apagados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarRemoverItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive-hover"
            >
              Sim, remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmar remoção de preço */}
      <AlertDialog
        open={!!precoParaRemover}
        onOpenChange={(o) => !o && setPrecoParaRemover(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover preço?</AlertDialogTitle>
            <AlertDialogDescription>
              Esse preço será apagado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarRemoverPreco}
              className="bg-destructive text-destructive-foreground hover:bg-destructive-hover"
            >
              Sim, remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}