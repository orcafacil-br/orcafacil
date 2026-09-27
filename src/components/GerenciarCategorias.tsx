import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Pencil,
  Lock,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  ShoppingCart,
  Wrench,
  Home,
  Car,
  HeartPulse,
  Gamepad2,
  GraduationCap,
  MoreHorizontal,
  Utensils,
  Coffee,
  Pizza,
  Shirt,
  Smartphone,
  Tv,
  Music,
  Dumbbell,
  Plane,
  Gift,
  Baby,
  Dog,
  Cat,
  Book,
  Briefcase,
  DollarSign,
  PiggyBank,
  CreditCard,
  Receipt,
  Fuel,
  Bus,
  Bike,
  Store,
  Building2,
  Stethoscope,
  Pill,
} from "lucide-react";
import { toast } from "sonner";
import { useFinanceStore } from "@/store/useFinanceStore";
import { type Categoria, gerarId } from "@/types/finance";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// Ícones disponíveis (lista curada)
// ------------------------------------------------------------

const ICONES_DISPONIVEIS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  ShoppingCart,
  Wrench,
  Home,
  Car,
  HeartPulse,
  Gamepad2,
  GraduationCap,
  MoreHorizontal,
  Utensils,
  Coffee,
  Pizza,
  Shirt,
  Smartphone,
  Tv,
  Music,
  Dumbbell,
  Plane,
  Gift,
  Baby,
  Dog,
  Cat,
  Book,
  Briefcase,
  DollarSign,
  PiggyBank,
  CreditCard,
  Receipt,
  Fuel,
  Bus,
  Bike,
  Store,
  Building2,
  Stethoscope,
  Pill,
};

const ICONES_KEYS = Object.keys(ICONES_DISPONIVEIS);

// ------------------------------------------------------------
// Cores disponíveis
// ------------------------------------------------------------

const CORES_DISPONIVEIS = [
  "#FF6B6B",
  "#FF9671",
  "#FFC75F",
  "#FFD93D",
  "#F9F871",
  "#6BCB77",
  "#00C9A7",
  "#4D96FF",
  "#845EC2",
  "#9B5DE5",
  "#D65DB1",
  "#F15BB5",
  "#0081CF",
  "#2C73D2",
  "#FF5F40",
  "#FB5607",
  "#5D9C59",
  "#008F7A",
  "#C34A36",
  "#6A2C70",
];

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------

export function GerenciarCategorias() {
  const {
    categorias,
    despesas,
    adicionarCategoria,
    atualizarCategoria,
    removerCategoria,
    adicionarSubcategoria,
    removerSubcategoria,
  } = useFinanceStore();

  // === Estado: modais ===
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(
    null
  );
  const [novaCategoriaOpen, setNovaCategoriaOpen] = useState(false);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState<
    string | null
  >(null);
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());
  const [novaSubInput, setNovaSubInput] = useState<Record<string, string>>({});

  // === Formulário: categoria ===
  const [form, setForm] = useState({
    nome: "",
    icone: "ShoppingCart",
    cor: "#FF6B6B",
  });

  // === Handlers ===
  const toggleExpandida = (id: string) => {
    const novo = new Set(expandidas);
    if (novo.has(id)) novo.delete(id);
    else novo.add(id);
    setExpandidas(novo);
  };

  const abrirNovaCategoria = () => {
    setForm({ nome: "", icone: "ShoppingCart", cor: "#FF6B6B" });
    setNovaCategoriaOpen(true);
  };

  const abrirEditarCategoria = (cat: Categoria) => {
    setForm({ nome: cat.nome, icone: cat.icone, cor: cat.cor });
    setCategoriaEditando(cat);
  };

  const salvarNovaCategoria = () => {
    if (!form.nome.trim()) {
      toast.error("Digite um nome para a categoria.");
      return;
    }
    if (
      categorias.some(
        (c) => c.nome.toLowerCase() === form.nome.trim().toLowerCase()
      )
    ) {
      toast.error("Já existe uma categoria com esse nome.");
      return;
    }

    adicionarCategoria({
      nome: form.nome.trim(),
      icone: form.icone,
      cor: form.cor,
      subcategorias: [],
      personalizada: true,
    });

    toast.success("Categoria criada!");
    setNovaCategoriaOpen(false);
  };

  const salvarEdicaoCategoria = () => {
    if (!categoriaEditando) return;
    if (!form.nome.trim()) {
      toast.error("Digite um nome para a categoria.");
      return;
    }

    atualizarCategoria(categoriaEditando.id, {
      nome: form.nome.trim(),
      icone: form.icone,
      cor: form.cor,
    });

    toast.success("Categoria atualizada!");
    setCategoriaEditando(null);
  };

  const confirmarExclusao = () => {
    if (!categoriaParaExcluir) return;
    removerCategoria(categoriaParaExcluir);
    toast.success("Categoria removida.");
    setCategoriaParaExcluir(null);
  };

  const handleAdicionarSub = (categoriaId: string) => {
    const nome = novaSubInput[categoriaId]?.trim();
    if (!nome) {
      toast.error("Digite um nome para a subcategoria.");
      return;
    }
    adicionarSubcategoria(categoriaId, nome);
    setNovaSubInput({ ...novaSubInput, [categoriaId]: "" });
    toast.success("Subcategoria adicionada!");
  };

  const handleRemoverSub = (categoriaId: string, subId: string) => {
    removerSubcategoria(categoriaId, subId);
    toast.success("Subcategoria removida.");
  };

  // === Verifica se pode excluir ===
  const podeExcluir = (cat: Categoria) => {
    if (!cat.personalizada) return false;
    return !despesas.some((d) => d.categoriaId === cat.id);
  };

  // === Quantas despesas usam a categoria ===
  const contarDespesas = (catId: string) => {
    return despesas.filter((d) => d.categoriaId === catId).length;
  };

  // === Categoria selecionada no form (preview) ===
  const IconePreview = ICONES_DISPONIVEIS[form.icone] ?? ShoppingCart;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Categorias</h2>
          <p className="text-sm text-muted-foreground">
            Crie, edite e organize as categorias e subcategorias do seu
            controle financeiro
          </p>
        </div>
        <Button onClick={abrirNovaCategoria}>
          <Plus className="w-4 h-4 mr-2" />
          Nova categoria
        </Button>
      </div>

      <div className="space-y-3">
        {categorias.map((cat) => {
          const Icone = ICONES_DISPONIVEIS[cat.icone] ?? MoreHorizontal;
          const expandida = expandidas.has(cat.id);
          const numDespesas = contarDespesas(cat.id);
          const ehPadrao = !cat.personalizada;

          return (
            <div
              key={cat.id}
              className="border border-border rounded-lg overflow-hidden"
            >
              {/* Cabeçalho */}
              <div
                className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleExpandida(cat.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cat.cor}20` }}
                    >
                      <Icone
                        className="w-5 h-5"
                        // @ts-ignore — cor dinâmica
                        style={{ color: cat.cor }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{cat.nome}</p>
                        {ehPadrao && (
                          <Badge
                            variant="outline"
                            className="text-xs gap-1"
                          >
                            <Lock className="w-3 h-3" />
                            Padrão
                          </Badge>
                        )}
                        {!ehPadrao && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            Personalizada
                          </Badge>
                        )}
                        {numDespesas > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {numDespesas} despesa
                            {numDespesas !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cat.subcategorias.length} subcategoria
                        {cat.subcategorias.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirEditarCategoria(cat);
                      }}
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    {podeExcluir(cat) ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoriaParaExcluir(cat.id);
                        }}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled
                        title={
                          ehPadrao
                            ? "Categorias padrão não podem ser excluídas"
                            : "Não pode excluir categoria com despesas"
                        }
                      >
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}

                    {expandida ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Subcategorias (expandido) */}
              {expandida && (
                <div className="border-t bg-muted/20 p-4 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Subcategorias
                  </p>

                  {cat.subcategorias.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhuma subcategoria ainda. Adicione abaixo.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {cat.subcategorias.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-background border border-border text-sm"
                        >
                          <span>{sub.nome}</span>
                          <button
                            onClick={() =>
                              handleRemoverSub(cat.id, sub.id)
                            }
                            className="w-5 h-5 rounded-full hover:bg-destructive/20 flex items-center justify-center transition-colors"
                            title="Remover"
                          >
                            <X className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input pra nova subcategoria */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova subcategoria..."
                      value={novaSubInput[cat.id] || ""}
                      onChange={(e) =>
                        setNovaSubInput({
                          ...novaSubInput,
                          [cat.id]: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAdicionarSub(cat.id);
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleAdicionarSub(cat.id)}
                      size="icon"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* === Modal: Nova categoria === */}
      <Dialog
        open={novaCategoriaOpen}
        onOpenChange={setNovaCategoriaOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova categoria</DialogTitle>
            <DialogDescription>
              Escolha um nome, ícone e cor para sua nova categoria.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Preview */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${form.cor}20` }}
              >
                <IconePreview
                  className="w-6 h-6"
                  // @ts-ignore — cor dinâmica
                  style={{ color: form.cor }}
                />
              </div>
              <div>
                <p className="font-semibold">
                  {form.nome || "Nome da categoria"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Preview em tempo real
                </p>
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome-cat">Nome *</Label>
              <Input
                id="nome-cat"
                placeholder="Ex: Pets, Filhos, Viagens..."
                value={form.nome}
                onChange={(e) =>
                  setForm({ ...form, nome: e.target.value })
                }
              />
            </div>

            {/* Ícone */}
            <div className="space-y-2">
              <Label>Ícone *</Label>
              <div className="grid grid-cols-8 gap-1.5 max-h-[180px] overflow-y-auto p-2 border rounded-lg">
                {ICONES_KEYS.map((key) => {
                  const Icon = ICONES_DISPONIVEIS[key];
                  const ativo = form.icone === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, icone: key })}
                      className={cn(
                        "w-9 h-9 rounded-md flex items-center justify-center transition-all",
                        ativo
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cor */}
            <div className="space-y-2">
              <Label>Cor *</Label>
              <div className="flex flex-wrap gap-2">
                {CORES_DISPONIVEIS.map((cor) => {
                  const ativa = form.cor === cor;
                  return (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setForm({ ...form, cor })}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all relative",
                        ativa && "ring-2 ring-offset-2 ring-primary"
                      )}
                      style={{ backgroundColor: cor }}
                    >
                      {ativa && (
                        <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNovaCategoriaOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={salvarNovaCategoria}>Criar categoria</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Modal: Editar categoria === */}
      <Dialog
        open={!!categoriaEditando}
        onOpenChange={(o) => !o && setCategoriaEditando(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
            <DialogDescription>
              Altere o nome, ícone ou cor da categoria.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Preview */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${form.cor}20` }}
              >
                <IconePreview
                  className="w-6 h-6"
                  // @ts-ignore — cor dinâmica
                  style={{ color: form.cor }}
                />
              </div>
              <div>
                <p className="font-semibold">
                  {form.nome || "Nome da categoria"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Preview em tempo real
                </p>
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome-cat-edit">Nome *</Label>
              <Input
                id="nome-cat-edit"
                value={form.nome}
                onChange={(e) =>
                  setForm({ ...form, nome: e.target.value })
                }
              />
            </div>

            {/* Ícone */}
            <div className="space-y-2">
              <Label>Ícone *</Label>
              <div className="grid grid-cols-8 gap-1.5 max-h-[180px] overflow-y-auto p-2 border rounded-lg">
                {ICONES_KEYS.map((key) => {
                  const Icon = ICONES_DISPONIVEIS[key];
                  const ativo = form.icone === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, icone: key })}
                      className={cn(
                        "w-9 h-9 rounded-md flex items-center justify-center transition-all",
                        ativo
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cor */}
            <div className="space-y-2">
              <Label>Cor *</Label>
              <div className="flex flex-wrap gap-2">
                {CORES_DISPONIVEIS.map((cor) => {
                  const ativa = form.cor === cor;
                  return (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setForm({ ...form, cor })}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all relative",
                        ativa && "ring-2 ring-offset-2 ring-primary"
                      )}
                      style={{ backgroundColor: cor }}
                    >
                      {ativa && (
                        <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoriaEditando(null)}
            >
              Cancelar
            </Button>
            <Button onClick={salvarEdicaoCategoria}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Confirmar exclusão === */}
      <AlertDialog
        open={!!categoriaParaExcluir}
        onOpenChange={(o) => !o && setCategoriaParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria e todas as suas subcategorias serão removidas
              permanentemente. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive-hover"
            >
              Sim, remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}