import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Store,
  Trash2,
} from "lucide-react";
import {
  type ItemOrcamento,
  type Categoria,
  type TipoPagamento,
} from "@/types/finance";
import { formatarMoeda, formatarDataCurta } from "@/lib/format";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// Badge de tipo de pagamento
// ------------------------------------------------------------

export function BadgeTipo({ tipo }: { tipo: TipoPagamento }) {
  if (tipo === "variavel") {
    return (
      <Badge
        variant="secondary"
        className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-900"
      >
        🛒 Variável
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-xs bg-white text-foreground dark:bg-neutral-900 dark:text-neutral-200 border-border"
    >
      💰 Fixo
    </Badge>
  );
}

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface ItemOrcamentoCardProps {
  item: ItemOrcamento;
  categoria?: Categoria;
  subcategoriaNome?: string;
  expandido: boolean;
  onToggleExpandir: () => void;
  onRemoverItem: () => void;
  onAdicionarPreco: () => void;
  onRemoverPreco: (precoId: string) => void;
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------

export function ItemOrcamentoCard({
  item,
  categoria,
  subcategoriaNome,
  expandido,
  onToggleExpandir,
  onRemoverItem,
  onAdicionarPreco,
  onRemoverPreco,
}: ItemOrcamentoCardProps) {
  // === Análise ===
  const analise = (() => {
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
    };
  })();

  const corCategoria = categoria?.cor ?? "#9B5DE5";

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Cabeçalho */}
      <div
        className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggleExpandir}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${corCategoria}20` }}
            >
              <ShoppingCart
                className="w-6 h-6"
                // @ts-ignore
                style={{ color: corCategoria }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-base truncate">
                  {item.nome}
                </h3>
                <BadgeTipo tipo={item.tipo} />
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {categoria?.nome}
                {subcategoriaNome && ` › ${subcategoriaNome}`} •{" "}
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
                onRemoverItem();
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
                <p className="text-xs font-medium mb-1">Recomendação</p>
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
              <h4 className="text-sm font-medium">Preços registrados</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdicionarPreco();
                }}
              >
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
                              <span>{formatarDataCurta(preco.data)}</span>
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
                              onRemoverPreco(preco.id);
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
    </div>
  );
}