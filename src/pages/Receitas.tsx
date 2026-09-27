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
  TrendingUp,
  Calendar,
  Hash,
  ArrowUpRight,
  AlertCircle,
  Wallet,
  Gift,
  Briefcase,
  Home,
  PiggyBank,
} from "lucide-react";
import { toast } from "sonner";
import { useFinanceStore } from "@/store/useFinanceStore";
import { type Receita } from "@/types/finance";
import {
  formatarMoeda,
  formatarDataCurta,
  formatarInputMoeda,
  parsearMoedaBR,
  hojeISO,
  mesAtual,
  nomeMes,
} from "@/lib/format";

const CATEGORIAS_RECEITA = [
  { id: "salario", nome: "Salário", icon: Wallet, cor: "#6BCB77" },
  { id: "freelance", nome: "Freelance", icon: Briefcase, cor: "#4D96FF" },
  { id: "investimentos", nome: "Investimentos", icon: TrendingUp, cor: "#00C9A7" },
  { id: "vendas", nome: "Vendas", icon: TrendingUp, cor: "#FFD93D" },
  { id: "presente", nome: "Presente", icon: Gift, cor: "#FF9671" },
  { id: "aluguel", nome: "Aluguel recebido", icon: Home, cor: "#845EC2" },
  { id: "poupanca", nome: "Resgate / Poupança", icon: PiggyBank, cor: "#FF6B6B" },
  { id: "outros", nome: "Outros", icon: TrendingUp, cor: "#9B5DE5" },
];

export default function Receitas() {
  const { receitas, adicionarReceita, removerReceita } = useFinanceStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [filtroMes, setFiltroMes] = useState<string>(mesAtual());
  const [receitaParaRemover, setReceitaParaRemover] = useState<string | null>(
    null
  );

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    data: hojeISO(),
    categoriaId: "salario",
    observacao: "",
  });

  const resetForm = () => {
    setForm({
      descricao: "",
      valor: "",
      data: hojeISO(),
      categoriaId: "salario",
      observacao: "",
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setModalOpen(true);
  };

  // === Handler do valor com máscara ===
  const handleValorChange = (valorDigitado: string) => {
    const formatado = formatarInputMoeda(valorDigitado);
    setForm({ ...form, valor: formatado });
  };

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

    adicionarReceita({
      descricao: form.descricao.trim(),
      valor: valorNum,
      data: form.data,
      categoriaId: form.categoriaId,
      observacao: form.observacao.trim() || undefined,
    });

    toast.success("Receita cadastrada!");
    setModalOpen(false);
    resetForm();
  };

  const handleConfirmarRemocao = () => {
    if (receitaParaRemover) {
      removerReceita(receitaParaRemover);
      toast.success("Receita removida.");
      setReceitaParaRemover(null);
    }
  };

  const receitasFiltradas = useMemo(() => {
    return receitas
      .filter((r) =>
        filtroMes === "todos" ? true : r.data.startsWith(filtroMes)
      )
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [receitas, filtroMes]);

  const totalFiltrado = receitasFiltradas.reduce((s, r) => s + r.valor, 0);
  const mediaFiltrado =
    receitasFiltradas.length > 0 ? totalFiltrado / receitasFiltradas.length : 0;

  const getCategoria = (r: Receita) => {
    return (
      CATEGORIAS_RECEITA.find((c) => c.id === r.categoriaId) ??
      CATEGORIAS_RECEITA[CATEGORIAS_RECEITA.length - 1]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
          <p className="text-muted-foreground">
            Registre e acompanhe suas entradas
          </p>
        </div>
        <Button onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Receita
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
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatarMoeda(totalFiltrado)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Quantidade</p>
              <p className="text-2xl font-bold">{receitasFiltradas.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                receita{receitasFiltradas.length !== 1 ? "s" : ""} registrada
                {receitasFiltradas.length !== 1 ? "s" : ""}
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
                Média por receita
              </p>
              <p className="text-2xl font-bold">
                {formatarMoeda(mediaFiltrado)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                valor médio
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtro */}
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
        <h3 className="text-lg font-semibold mb-4">Lista de receitas</h3>

        {receitasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">Nenhuma receita registrada</p>
            <p className="text-sm text-muted-foreground mb-4">
              {filtroMes === "todos"
                ? "Comece cadastrando sua primeira receita."
                : `Nenhuma receita em ${nomeMes(filtroMes)}.`}
            </p>
            <Button onClick={handleOpenModal} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar primeira receita
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {receitasFiltradas.map((r) => {
              const cat = getCategoria(r);
              const Icone = cat.icon;
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cat.cor}20` }}
                    >
                      <Icone
                        className="w-5 h-5"
                        // @ts-ignore
                        style={{ color: cat.cor }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{r.descricao}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span>{cat.nome}</span>
                        <span>•</span>
                        <span>{formatarDataCurta(r.data)}</span>
                      </div>
                      {r.observacao && (
                        <p className="text-xs text-muted-foreground mt-1 italic truncate">
                          "{r.observacao}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                      +{formatarMoeda(r.valor)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setReceitaParaRemover(r.id)}
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

      {/* Modal cadastro */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Receita</DialogTitle>
            <DialogDescription>
              Registre uma entrada. Os campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                placeholder="Ex: Salário de Setembro"
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={form.categoriaId}
                onValueChange={(v) => setForm({ ...form, categoriaId: v })}
              >
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_RECEITA.map((cat) => {
                    const Icone = cat.icon;
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <Icone
                            className="w-4 h-4"
                            // @ts-ignore
                            style={{ color: cat.cor }}
                          />
                          <span>{cat.nome}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacao">
                Observação{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Textarea
                id="observacao"
                placeholder="Ex: bônus de final de ano"
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
            <Button onClick={handleSalvar}>Salvar receita</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de remoção */}
      <AlertDialog
        open={!!receitaParaRemover}
        onOpenChange={(o) => !o && setReceitaParaRemover(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover receita?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. A receita será apagada
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