import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShoppingCart,
  Wrench,
  Home,
  Car,
  HeartPulse,
  Gamepad2,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useFinanceStore } from "@/store/useFinanceStore";
import { calcularTeto, calcularSemaforo } from "@/types/finance";
import {
  formatarMoeda,
  formatarPercentual,
  corSemaforo,
  labelSemaforo,
  nomeMes,
  mesAtual,
} from "@/lib/format";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// Mapa de ícones
// ------------------------------------------------------------

const ICONES: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  Wrench,
  Home,
  Car,
  HeartPulse,
  Gamepad2,
  GraduationCap,
  MoreHorizontal,
};

// ------------------------------------------------------------
// Página
// ------------------------------------------------------------

export default function Orcamento() {
  const { configuracao, receitas, despesas, categorias } = useFinanceStore();

  const mesAtualStr = mesAtual();
  const teto = calcularTeto(configuracao);

  // === Totais do mês ===
  const totalReceitas = useMemo(
    () =>
      receitas
        .filter((r) => r.data.startsWith(mesAtualStr))
        .reduce((s, r) => s + r.valor, 0),
    [receitas, mesAtualStr]
  );

  const totalDespesas = useMemo(
    () =>
      despesas
        .filter((d) => d.data.startsWith(mesAtualStr))
        .reduce((s, d) => s + d.valor, 0),
    [despesas, mesAtualStr]
  );

  const sobra = totalReceitas - totalDespesas;
  const restante = Math.max(teto - totalDespesas, 0);
  const percentualUsado = teto > 0 ? (totalDespesas / teto) * 100 : 0;
  const status = calcularSemaforo(percentualUsado);
  const cores = corSemaforo(status);

  // === Gastos por categoria ===
  const gastosPorCategoria = useMemo(() => {
    const mapa = new Map<string, number>();
    despesas
      .filter((d) => d.data.startsWith(mesAtualStr))
      .forEach((d) => {
        mapa.set(d.categoriaId, (mapa.get(d.categoriaId) || 0) + d.valor);
      });

    return categorias
      .map((cat) => {
        const gasto = mapa.get(cat.id) || 0;
        const percentualDoTeto = teto > 0 ? (gasto / teto) * 100 : 0;
        const percentualDoTotal =
          totalDespesas > 0 ? (gasto / totalDespesas) * 100 : 0;
        return {
          ...cat,
          gasto,
          percentualDoTeto,
          percentualDoTotal,
        };
      })
      .sort((a, b) => b.gasto - a.gasto);
  }, [despesas, categorias, mesAtualStr, teto, totalDespesas]);

  // === Status do orçamento ===
  const mensagemStatus = useMemo(() => {
    switch (status) {
      case "verde":
        return {
          titulo: "Orçamento saudável",
          descricao:
            "Você está dentro do teto. Continue assim para alcançar suas metas.",
          icon: CheckCircle2,
        };
      case "amarelo":
        return {
          titulo: "Atenção ao orçamento",
          descricao:
            "Você está usando boa parte do seu teto. Evite gastos extras.",
          icon: AlertTriangle,
        };
      case "vermelho":
        return {
          titulo: "Risco financeiro",
          descricao:
            "Você está próximo ou passou do teto. Reveja seus gastos urgentemente.",
          icon: AlertTriangle,
        };
    }
  }, [status]);

  const IconeStatus = mensagemStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamento</h1>
          <p className="text-muted-foreground">
            Acompanhe seu teto de gastos de {nomeMes(mesAtualStr)}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/configuracoes">
            <Target className="w-4 h-4 mr-2" />
            Ajustar teto
          </Link>
        </Button>
      </div>

      {/* === Alerta: Configure seu salário (âmbar elegante) === */}
      {configuracao.salario === 0 && (
        <Card className="p-6 border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-300">
                Configure seu salário primeiro
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-400 mt-1 mb-3">
                Sem salário cadastrado, o teto de gastos fica em R$ 0,00.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link to="/configuracoes">
                  Ir para Configurações
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* === Hero card: Teto e uso === */}
      <Card className="p-6 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Teto */}
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
              <Target className="w-4 h-4" />
              Teto de gastos
            </p>
            <p className="text-3xl font-bold">{formatarMoeda(teto)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {configuracao.perfilTeto === "personalizado"
                ? "Valor personalizado"
                : `${configuracao.tetoPercentual}% de ${formatarMoeda(
                    configuracao.salario
                  )}`}
            </p>
          </div>

          {/* Gasto atual */}
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4" />
              Gasto este mês
            </p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {formatarMoeda(totalDespesas)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatarPercentual(percentualUsado)} do teto
            </p>
          </div>

          {/* Restante */}
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4" />
              Restante
            </p>
            <p
              className={cn(
                "text-3xl font-bold",
                restante > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {formatarMoeda(restante)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {restante > 0 ? "disponível" : "esgotado"}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Uso do teto</span>
            <span className={cn("text-sm font-semibold", cores.text)}>
              {formatarPercentual(percentualUsado)}
            </span>
          </div>
          <Progress value={Math.min(percentualUsado, 100)} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>R$ 0</span>
            <span>70% — atenção</span>
            <span>{formatarMoeda(teto)}</span>
          </div>
        </div>
      </Card>

      {/* === Status do orçamento === */}
      <Card className={cn("p-6 border-2", cores.bg, cores.border)}>
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
              "bg-white/60 dark:bg-black/20"
            )}
          >
            <IconeStatus className={cn("w-6 h-6", cores.text)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn("text-lg font-semibold", cores.text)}>
                {mensagemStatus.titulo}
              </h3>
              <span className="text-xl">{cores.emoji}</span>
            </div>
            <p className={cn("text-sm", cores.text, "opacity-90")}>
              {mensagemStatus.descricao}
            </p>
          </div>
        </div>
      </Card>

      {/* === Resumo geral === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Receitas do mês
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatarMoeda(totalReceitas)}
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
              <p className="text-sm text-muted-foreground mb-1">
                Despesas do mês
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatarMoeda(totalDespesas)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Sobra (economia)
              </p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  sobra >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {formatarMoeda(sobra)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* === Gastos por categoria === */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Gastos por categoria</h3>
            <p className="text-sm text-muted-foreground">
              Onde seu dinheiro foi gasto em {nomeMes(mesAtualStr)}
            </p>
          </div>
        </div>

        {totalDespesas === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">Nenhum gasto registrado ainda</p>
            <p className="text-sm text-muted-foreground mb-4">
              Cadastre despesas para ver a distribuição por categoria.
            </p>
            <Button asChild variant="outline">
              <Link to="/despesas">
                <TrendingDown className="w-4 h-4 mr-2" />
                Ir para Despesas
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {gastosPorCategoria
              .filter((c) => c.gasto > 0)
              .map((cat) => {
                const Icone = ICONES[cat.icone] ?? MoreHorizontal;
                return (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${cat.cor}20` }}
                        >
                          <Icone
                            className="w-4 h-4"
                            // @ts-ignore — style dinâmico
                            style={{ color: cat.cor }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {cat.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatarPercentual(cat.percentualDoTotal, 0)} dos
                            gastos
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-semibold text-sm">
                          {formatarMoeda(cat.gasto)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatarPercentual(cat.percentualDoTeto, 0)} do teto
                        </p>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(cat.percentualDoTotal, 100)}%`,
                          backgroundColor: cat.cor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

            {/* Categorias sem gasto */}
            {gastosPorCategoria.filter((c) => c.gasto === 0).length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-3">
                  Sem gastos este mês:
                </p>
                <div className="flex flex-wrap gap-2">
                  {gastosPorCategoria
                    .filter((c) => c.gasto === 0)
                    .map((cat) => (
                      <Badge
                        key={cat.id}
                        variant="outline"
                        className="text-xs"
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-1.5"
                          style={{ backgroundColor: cat.cor }}
                        />
                        {cat.nome}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* === Dica === */}
      {totalDespesas > 0 && status !== "verde" && (
        <Card className="p-6 bg-muted/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">
                💡 Dica para economizar
              </h3>
              <p className="text-sm text-muted-foreground">
                {gastosPorCategoria[0]?.gasto > 0 && (
                  <>
                    Sua maior despesa é em{" "}
                    <strong>{gastosPorCategoria[0].nome}</strong> (
                    {formatarMoeda(gastosPorCategoria[0].gasto)}). Tente
                    reduzi-la para economizar e voltar ao verde. Use o{" "}
                    <Link
                      to="/comparador"
                      className="text-primary underline hover:opacity-80"
                    >
                      Comparador de preços
                    </Link>{" "}
                    para achar opções mais baratas.
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}