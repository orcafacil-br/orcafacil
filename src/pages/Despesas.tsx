import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  TrendingDown,
  Calendar,
  Tag,
  Hash,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useFinanceStore } from "@/store/useFinanceStore";
import { calcularTeto, type Despesa } from "@/types/finance";
import {
  formatarMoeda,
  formatarDataCurta,
  formatarInputMoeda,
  parsearMoedaBR,
  hojeISO,
  mesAtual,
  nomeMes,
} from "@/lib/format";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// Página
// ------------------------------------------------------------

export default function Despesas() {
  const {
    despesas,
    categorias,
    configuracao,
    adicionarDespesa,
    removerDespesa,
  } = useFinanceStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [filtroMes, setFiltroMes] = useState<string>(mesAtual());
  const [despesaParaRemover, setDespesaParaRemover] = useState<string | null>(
    null
  );

  // === Formulário ===
  const [form, setForm] = useState({
    descricao: "",
    valor: "", // agora armazena o valor FORMATADO como string
    data: hojeISO(),
    categoriaId: "",
    subcategoriaId: "",
    mercado: "",
    observacao: "",
  });

  const resetForm = () => {
    setForm({
      descricao: "",
      valor: "",
      data: hojeISO(),
      categoriaId: "",
      subcategoriaId: "",
      mercado: "",
      observacao: "",
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setModalOpen(true);
  };

  // === Categoria selecionada ===
  const categoriaSelecionada = useMemo(() => {
    return categorias.find((c) => c.id === form.categoriaId) || null;
  }, [form.categoriaId, categorias]);

  const handleCategoriaChange = (catId: string) => {
    setForm({ ...form, categoriaId: catId, subcategoriaId: "" });
  };

  const handleSubcategoriaChange = (subId: string) => {
    setForm({ ...form, subcategoriaId: subId });
  };

  // === 🆕 Handler do valor com máscara ===
  const handleValorChange = (valorDigitado: string) => {
    const formatado = formatarInputMoeda(valorDigitado);
    setForm({ ...form, valor: formatado });
  };

  // === Salvar ===
  const handleSalvar = () => {
    if (!form.descricao.trim()) {
      toast.error("Digite uma descrição.");
      return;
    }

    const valorNum = parsearMoedaBR(form.valor);
    if (!valorNum || valorNum <= 0) {
      toast.error("Digite um valor válido.");
      return;
    }

    if (!form.categoriaId) {
      toast.error("Selecione uma categoria.");
      return;
    }

    adicionarDespesa({
      descricao: form.descricao.trim(),
      valor: valorNum,
      data: form.data,
      categoriaId: form.categoriaId,
      subcategoriaId: form.subcategoriaId || undefined,
      mercado: form.mercado.trim() || undefined,
      observacao: form.observacao.trim() || undefined,
    });

    toast.success("Despesa cadastrada!");
    setModalOpen(false);
    resetForm();
  };

  const handleConfirmarRemocao = () => {
    if (despesaParaRemover) {
      removerDespesa(despesaParaRemover);
      toast.success("Despesa removida.");
      setDespesaParaRemover(null);
    }
  };

  // === Filtro e totais ===
  const despesasFiltradas = useMemo(() => {
    return despesas
      .filter((d) =>
        filtroMes === "todos" ? true : d.data.startsWith(filtroMes)
      )
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [despesas, filtroMes]);

  const totalFiltrado = despesasFiltradas.reduce((s, d) => s + d.valor, 0);
  const mediaFiltrado =
    despesasFiltradas.length > 0 ? totalFiltrado / despesasFiltradas.length : 0;

  const teto = calcularTeto(configuracao);
  const percentualUsado = teto > 0 ? (totalFiltrado / teto) * 100 : 0;

  const getNomeCategoria = (d: Despesa) => {
    const cat = categorias.find((c) => c.id === d.categoriaId);
    if (!cat) return "—";
    if (d.subcategoriaId) {
      const sub = cat.subcategorias.find((s) => s.id === d.subcategoriaId);
      if (sub) return `${cat.nome} › ${sub.nome}`;
    }
    return cat.nome;
  };

  const getCorCategoria = (categoriaId: string) => {
    const cat = categorias.find((c) => c.id === categoriaId);
    return cat?.cor ?? "#9B5DE5";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
          <p className="text-muted-foreground">
            Registre e acompanhe seus gastos
          </p>
        </div>
        <Button onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total{" "}
                {filtroMes === "todos" ? "(todos)" : `de ${nomeMes(filtroMes)}`}
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatarMoeda(totalFiltrado)}
              </p>
              {teto > 0 && filtroMes !== "todos" && (
                <p className="text-xs text-muted-foreground mt-1">
                  {percentualUsado.toFixed(0)}% do teto
                </p>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Quantidade</p>
              <p className="text-2xl font-bold">{despesasFiltradas.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                despesa{despesasFiltradas.length !== 1 ? "s" : ""} registrada
                {despesasFiltradas.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Hash className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Média por despesa
              </p>
              <p className="text-2xl font-bold">
                {formatarMoeda(mediaFiltrado)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                valor médio
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtro de mês */}
      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm">Filtrar por:</Label>
          <Select value={filtroMes} onValueChange={setFiltroMes}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={mesAtual()}>{nomeMes(mesAtual())}</SelectItem>
              <SelectItem value="todos">Todos os meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Lista de despesas</h3>

        {despesasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">Nenhuma despesa registrada</p>
            <p className="text-sm text-muted-foreground mb-4">
              {filtroMes === "todos"
                ? "Comece cadastrando sua primeira despesa."
                : `Nenhuma despesa em ${nomeMes(filtroMes)}.`}
            </p>
            <Button onClick={handleOpenModal} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar primeira despesa
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {despesasFiltradas.map((d) => {
              const cor = getCorCategoria(d.categoriaId);
              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cor}20` }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cor }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{d.descricao}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span>{getNomeCategoria(d)}</span>
                        <span>•</span>
                        <span>{formatarDataCurta(d.data)}</span>
                        {d.mercado && (
                          <>
                            <span>•</span>
                            <span>{d.mercado}</span>
                          </>
                        )}
                      </div>
                      {d.observacao && (
                        <p className="text-xs text-muted-foreground mt-1 italic truncate">
                          "{d.observacao}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                      -{formatarMoeda(d.valor)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDespesaParaRemover(d.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* === Modal de cadastro === */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
            <DialogDescription>
              Registre um gasto. Os campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                placeholder="Ex: Arroz 5kg"
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
              />
            </div>

            {/* Valor + Data */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input
                    id="valor"
                    type="text"
                    inputMode="numeric"
                    placeholder="0,00"
                    value={form.valor}
                    onChange={(e) => handleValorChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={form.data}
                  max={hojeISO()}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={form.categoriaId}
                onValueChange={handleCategoriaChange}
              >
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
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

            {/* Subcategoria */}
            {categoriaSelecionada &&
              categoriaSelecionada.subcategorias.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subcategoria">
                    Subcategoria{" "}
                    <span className="text-muted-foreground font-normal">
                      (opcional)
                    </span>
                  </Label>
                  <Select
                    value={form.subcategoriaId || "nenhuma"}
                    onValueChange={(v) =>
                      handleSubcategoriaChange(v === "nenhuma" ? "" : v)
                    }
                  >
                    <SelectTrigger id="subcategoria">
                      <SelectValue placeholder="Selecione a subcategoria" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
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

            {/* Mercado */}
            <div className="space-y-2">
              <Label htmlFor="mercado">
                Mercado / Estabelecimento{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Input
                id="mercado"
                placeholder="Ex: Supermercado Extra"
                value={form.mercado}
                onChange={(e) => setForm({ ...form, mercado: e.target.value })}
              />
            </div>

            {/* Observação */}
            <div className="space-y-2">
              <Label htmlFor="observacao">
                Observação{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Textarea
                id="observacao"
                placeholder="Ex: comprei em promoção"
                value={form.observacao}
                onChange={(e) =>
                  setForm({ ...form, observacao: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar}>Salvar despesa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Dialog de confirmação de remoção === */}
      <AlertDialog
        open={!!despesaParaRemover}
        onOpenChange={(o) => !o && setDespesaParaRemover(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. A despesa será apagada
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarRemocao}
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