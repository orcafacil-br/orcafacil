import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingCart,
  Home,
  Car,
  HeartPulse,
  Gamepad2,
  GraduationCap,
  Wrench,
  MoreHorizontal,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Link } from "react-router-dom";
import { useFinanceStore } from "@/store/useFinanceStore";
import {
  calcularTeto,
  calcularSemaforo,
  type Despesa,
} from "@/types/finance";
import {
  formatarMoeda,
  formatarPercentual,
  formatarDataCurta,
  formatarMoedaCompacta,
  corSemaforo,
  labelSemaforo,
  nomeMes,
  mesAtual,
} from "@/lib/format";
import { cn } from "@/lib/utils";

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

export default function Overview() {
  const { configuracao, receitas, despesas, categorias, itensOrcamento } =
    useFinanceStore();

  const teto = calcularTeto(configuracao);
  const mesAtualStr = mesAtual();

  const receitasMes = useMemo(
    () => receitas.filter((r) => r.data.startsWith(mesAtualStr)),
    [receitas, mesAtualStr]
  );

  const despesasMes = useMemo(
    () => despesas.filter((d) => d.data.startsWith(mesAtualStr)),
    [despesas, mesAtualStr]
  );

  const totalReceitas = receitasMes.reduce((s, r) => s + r.valor, 0);
  const totalDespesas = despesasMes.reduce((s, d) => s + d.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  const percentualUsado = teto > 0 ? (totalDespesas / teto) * 100 : 0;
  const status = calcularSemaforo(percentualUsado);
  const cores = corSemaforo(status);
  const restante = Math.max(teto - totalDespesas, 0);

  // === 🆕 Orçamento: projeção ===
  const itensComPreco = itensOrcamento.filter((i) => i.precos.length > 0);

  const itensComMelhorPreco = useMemo(() => {
    return itensComPreco.map((item) => {
      const melhor = [...item.precos].sort((a, b) => a.valor - b.valor)[0];
      const cat = categorias.find((c) => c.id === item.categoriaId);
      return {
        ...item,
        melhorPreco: melhor.valor,
        melhorMercado: melhor.mercado,
        categoria: cat,
      };
    });
  }, [itensComPreco, categorias]);

  const totalOrcamento = itensComMelhorPreco.reduce(
    (s, i) => s + i.melhorPreco,
    0
  );
  const sobraProjetada = teto - totalOrcamento;
  const percentualOrcamento = teto > 0 ? (totalOrcamento / teto) * 100 : 0;

  // === Gastos por categoria ===
  const gastosPorCategoria = useMemo(() => {
    const mapa = new Map<string, number>();
    despesasMes.forEach((d) => {
      mapa.set(d.categoriaId, (mapa.get(d.categoriaId) || 0) + d.valor);
    });
    return Array.from(mapa.entries())
      .map(([categoriaId, valor]) => {
        const cat = categorias.find((c) => c.id === categoriaId);
        return {
          categoriaId,
          nome: cat?.nome ?? "Outros",
          icone: cat?.icone ?? "MoreHorizontal",
          cor: cat?.cor ?? "#9B5DE5",
          valor,
          percentual: totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0,
        };
      })
      .sort((a, b) => b.valor - a.valor);
  }, [despesasMes, categorias, totalDespesas]);

  const dadosRosca = useMemo(
    () =>
      gastosPorCategoria.map((g) => ({
        name: g.nome,
        value: g.valor,
        color: g.cor,
      })),
    [gastosPorCategoria]
  );

  const dadosEvolucao = useMemo(() => {
    const meses: Array<{
      mes: string;
      label: string;
      receitas: number;
      despesas: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setDate(1);
      data.setMonth(data.getMonth() - i);
      const mesStr = `${data.getFullYear()}-${String(
        data.getMonth() + 1
      ).padStart(2, "0")}`;

      const receitasDoMes = receitas
        .filter((r) => r.data.startsWith(mesStr))
        .reduce((s, r) => s + r.valor, 0);
      const despesasDoMes = despesas
        .filter((d) => d.data.startsWith(mesStr))
        .reduce((s, d) => s + d.valor, 0);

      meses.push({
        mes: mesStr,
        label: nomeMes(mesStr).split(" ")[0],
        receitas: receitasDoMes,
        despesas: despesasDoMes,
      });
    }

    return meses;
  }, [receitas, despesas]);

  const ultimasTransacoes = useMemo(() => {
    const lista: Array<
      | { tipo: "receita"; item: (typeof receitas)[0] }
      | { tipo: "despesa"; item: Despesa }
    > = [
      ...receitas.map((r) => ({ tipo: "receita" as const, item: r })),
      ...despesas.map((d) => ({ tipo: "despesa" as const, item: d })),
    ];
    return lista
      .sort(
        (a, b) =>
          new Date(b.item.data).getTime() - new Date(a.item.data).getTime()
      )
      .slice(0, 5);
  }, [receitas, despesas]);

  const semConfiguracao = configuracao.salario === 0;
  const temDespesas = despesasMes.length > 0;
  const temHistorico = dadosEvolucao.some(
    (d) => d.receitas > 0 || d.despesas > 0
  );
  const temOrcamento = itensComMelhorPreco.length > 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          {label && <p className="font-medium text-sm mb-2">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm flex items-center gap-2"
              style={{ color: entry.color }}
            >
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">{entry.name}:</span>
              <span>{formatarMoeda(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumo de {nomeMes(mesAtualStr)}
        </p>
      </div>

      {/* Alerta salário */}
      {semConfiguracao && (
        <Card className="p-6 border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-300">
                Configure seu salário
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">
                Vá em{" "}
                <Link
                  to="/configuracoes"
                  className="underline font-medium hover:opacity-80"
                >
                  Configurações
                </Link>{" "}
                para definir seu salário e o teto de gastos.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Hero card — teto */}
      <Card className="p-6 overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Teto de gastos do mês
            </p>
            <p className="text-3xl font-bold">{formatarMoeda(teto)}</p>
            <p className={cn("text-sm font-medium", cores.text)}>
              {cores.emoji} {labelSemaforo(status)} —{" "}
              {formatarPercentual(percentualUsado)} usado
            </p>
          </div>

          <div className="text-right space-y-1">
            <p className="text-sm text-muted-foreground">Restante</p>
            <p
              className={cn(
                "text-2xl font-bold",
                restante > 0 ? "text-foreground" : "text-red-600"
              )}
            >
              {formatarMoeda(restante)}
            </p>
            <p className="text-xs text-muted-foreground">
              de {formatarMoeda(teto)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <Progress value={Math.min(percentualUsado, 100)} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0%</span>
            <span>70%</span>
            <span>100%</span>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Receitas</p>
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
              <p className="text-sm text-muted-foreground mb-1">Despesas</p>
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
              <p className="text-sm text-muted-foreground mb-1">Saldo do mês</p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  saldo >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {formatarMoeda(saldo)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Salário base</p>
              <p className="text-2xl font-bold">
                {formatarMoeda(configuracao.salario)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* === 🆕 SEÇÃO ORÇAMENTO === */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Orçamento do mês</h3>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/comparador">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>

        {!temOrcamento ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <ShoppingCart className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Nenhum item cadastrado no orçamento ainda.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/comparador">
                Cadastrar itens <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">
                  Total do orçamento
                </p>
                <p className="text-xl font-bold">{formatarMoeda(totalOrcamento)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {itensComMelhorPreco.length} item
                  {itensComMelhorPreco.length !== 1 ? "s" : ""} (melhor preço)
                </p>
              </div>

              <div
                className={cn(
                  "p-4 rounded-lg border",
                  sobraProjetada >= 0
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                    : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                )}
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {sobraProjetada >= 0 ? "Sobra projetada" : "Falta"}
                </p>
                <p
                  className={cn(
                    "text-xl font-bold",
                    sobraProjetada >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {formatarMoeda(Math.abs(sobraProjetada))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  após pagar os itens
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-1">
                  Uso do teto
                </p>
                <p className="text-xl font-bold">
                  {formatarPercentual(percentualOrcamento, 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  de {formatarMoeda(teto)}
                </p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div>
              <Progress
                value={Math.min(percentualOrcamento, 100)}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>R$ 0</span>
                <span>{formatarMoeda(teto)}</span>
              </div>
            </div>

            {/* Lista de itens */}
            <div className="space-y-2">
              {itensComMelhorPreco.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${item.categoria?.cor ?? "#9B5DE5"}20`,
                      }}
                    >
                      <ShoppingCart
                        className="w-4 h-4"
                        // @ts-ignore
                        style={{ color: item.categoria?.cor ?? "#9B5DE5" }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {item.nome}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.categoria?.nome} • {item.melhorMercado}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap ml-2">
                    {formatarMoeda(item.melhorPreco)}
                  </span>
                </div>
              ))}

              {itensComMelhorPreco.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{itensComMelhorPreco.length - 5} outros itens —{" "}
                  <Link
                    to="/comparador"
                    className="text-primary underline hover:opacity-80"
                  >
                    ver todos
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Grid: rosca + evolução */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-1">Gastos por categoria</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {nomeMes(mesAtualStr)}
          </p>

          {!temDespesas ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nenhuma despesa registrada este mês
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosRosca}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dadosRosca.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatarMoedaCompacta(totalDespesas)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total de gastos
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                {gastosPorCategoria.slice(0, 6).map((g) => (
                  <div
                    key={g.categoriaId}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: g.cor }}
                      />
                      <span className="text-sm truncate">{g.nome}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {formatarPercentual(g.percentual, 0)}
                      </span>
                      <span className="text-sm font-medium">
                        {formatarMoeda(g.valor)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-1">
            Evolução dos últimos 6 meses
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Receitas vs Despesas
          </p>

          {!temHistorico ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Cadastre receitas e despesas para ver a evolução
              </p>
            </div>
          ) : (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dadosEvolucao}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    tickFormatter={(value) => formatarMoedaCompacta(value)}
                    width={70}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: "10px" }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="receitas"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ fill: "#22c55e", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Receitas"
                  />
                  <Line
                    type="monotone"
                    dataKey="despesas"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: "#ef4444", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Despesas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Grid: detalhamento + últimas transações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Detalhamento por categoria
          </h3>
          {gastosPorCategoria.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma despesa registrada este mês
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {gastosPorCategoria.map((g) => {
                const Icone = ICONES[g.icone] ?? MoreHorizontal;
                return (
                  <div key={g.categoriaId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${g.cor}20` }}
                        >
                          <Icone
                            className="w-4 h-4"
                            // @ts-ignore
                            style={{ color: g.cor }}
                          />
                        </div>
                        <span className="text-sm font-medium">{g.nome}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">
                          {formatarMoeda(g.valor)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatarPercentual(g.percentual, 0)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${g.percentual}%`,
                          backgroundColor: g.cor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Últimas transações</h3>
          {ultimasTransacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma transação registrada
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ultimasTransacoes.map((t) => {
                const isReceita = t.tipo === "receita";
                const categoria = !isReceita
                  ? categorias.find(
                      (c) => c.id === (t.item as Despesa).categoriaId
                    )
                  : null;

                return (
                  <div
                    key={t.item.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                          isReceita
                            ? "bg-green-100 dark:bg-green-950/40"
                            : "bg-red-100 dark:bg-red-950/40"
                        )}
                      >
                        {isReceita ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {t.item.descricao}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {categoria ? `${categoria.nome} • ` : ""}
                          {formatarDataCurta(t.item.data)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold whitespace-nowrap ml-2",
                        isReceita
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {isReceita ? "+" : "-"}
                      {formatarMoeda(t.item.valor)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Badge de status */}
      <div className="flex justify-center">
        <Badge
          variant="secondary"
          className={cn("px-4 py-2 text-sm", cores.bg, cores.text, cores.border)}
        >
          {cores.emoji} Status: {labelSemaforo(status)}
        </Badge>
      </div>
    </div>
  );
}