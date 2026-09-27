import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  TrendingUp,
  PiggyBank,
  Calendar,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useFinanceStore } from "@/store/useFinanceStore";
import { calcularTeto } from "@/types/finance";
import {
  formatarMoeda,
  formatarPercentual,
  nomeMes,
  mesAtual,
} from "@/lib/format";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// Página
// ------------------------------------------------------------

export default function Planejamento() {
  const { configuracao, receitas, despesas } = useFinanceStore();

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
  const sobraPrevista = configuracao.salario - teto;

  // === Projeção anual (12 meses) ===
  const projecaoAnual = useMemo(() => {
    const dados = [];
    const baseSalario = configuracao.salario;
    const baseTeto = teto;

    for (let i = 0; i < 12; i++) {
      const data = new Date();
      data.setMonth(data.getMonth() + i);
      const mesStr = `${data.getFullYear()}-${String(
        data.getMonth() + 1
      ).padStart(2, "0")}`;

      if (i === 0) {
        dados.push({
          mes: mesStr,
          nome: nomeMes(mesStr),
          receita: totalReceitas || baseSalario,
          despesa: totalDespesas,
          teto: baseTeto,
          sobra: (totalReceitas || baseSalario) - totalDespesas,
          real: true,
        });
      } else {
        dados.push({
          mes: mesStr,
          nome: nomeMes(mesStr),
          receita: baseSalario,
          despesa: baseTeto,
          teto: baseTeto,
          sobra: baseSalario - baseTeto,
          real: false,
        });
      }
    }
    return dados;
  }, [configuracao.salario, teto, totalReceitas, totalDespesas]);

  // === Total da projeção ===
  const totalProjecaoSobra = projecaoAnual.reduce((s, d) => s + d.sobra, 0);
  const totalProjecaoReceita = projecaoAnual.reduce(
    (s, d) => s + d.receita,
    0
  );

  // === Status do plano ===
  const statusMeta = useMemo(() => {
    if (configuracao.salario === 0) {
      return {
        tipo: "sem-config" as const,
        titulo: "Configure seu salário",
        descricao:
          "Sem salário cadastrado, não conseguimos projetar suas metas.",
      };
    }
    if (totalDespesas > teto) {
      return {
        tipo: "alerta" as const,
        titulo: "Você está acima do teto",
        descricao:
          "Reduza gastos para conseguir economizar o previsto no plano.",
      };
    }
    if (sobraPrevista <= 0) {
      return {
        tipo: "alerta" as const,
        titulo: "Teto muito alto",
        descricao:
          "Seu teto consome todo o salário. Ajuste o perfil para sobrar algo.",
      };
    }
    return {
      tipo: "ok" as const,
      titulo: "Você está no caminho certo!",
      descricao: `Se manter o ritmo, você economizará ${formatarMoeda(
        totalProjecaoSobra
      )} em 12 meses.`,
    };
  }, [
    configuracao.salario,
    totalDespesas,
    teto,
    sobraPrevista,
    totalProjecaoSobra,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Planejamento</h1>
        <p className="text-muted-foreground">
          Metas financeiras e projeções para o futuro
        </p>
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
                Sem salário cadastrado, não conseguimos fazer projeções.
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

      {/* === Resumo do plano === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Sobra planejada / mês
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatarMoeda(Math.max(sobraPrevista, 0))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                se gastar só o teto
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Sobra real do mês
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
              <p className="text-xs text-muted-foreground mt-1">
                com gastos atuais
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
              <p className="text-sm text-muted-foreground mb-1">
                Projeção anual
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatarMoeda(totalProjecaoSobra)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                em 12 meses
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* === Status do plano === */}
      <Card
        className={cn(
          "p-6 border-2",
          statusMeta.tipo === "ok" &&
            "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
          statusMeta.tipo === "alerta" &&
            "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900",
          statusMeta.tipo === "sem-config" && "bg-muted/30 border-border"
        )}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/60 dark:bg-black/20 flex items-center justify-center flex-shrink-0">
            {statusMeta.tipo === "ok" && (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            )}
            {statusMeta.tipo === "alerta" && (
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            )}
            {statusMeta.tipo === "sem-config" && (
              <Sparkles className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h3
              className={cn(
                "text-lg font-semibold mb-1",
                statusMeta.tipo === "ok" &&
                  "text-green-800 dark:text-green-300",
                statusMeta.tipo === "alerta" &&
                  "text-amber-900 dark:text-amber-300",
                statusMeta.tipo === "sem-config" && "text-foreground"
              )}
            >
              {statusMeta.titulo}
            </h3>
            <p
              className={cn(
                "text-sm",
                statusMeta.tipo === "ok" &&
                  "text-green-700 dark:text-green-400",
                statusMeta.tipo === "alerta" &&
                  "text-amber-800 dark:text-amber-400",
                statusMeta.tipo === "sem-config" && "text-muted-foreground"
              )}
            >
              {statusMeta.descricao}
            </p>
          </div>
        </div>
      </Card>

      {/* === Projeção 12 meses === */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Projeção dos próximos 12 meses
            </h3>
            <p className="text-sm text-muted-foreground">
              Baseado no seu salário e no teto atual
            </p>
          </div>
        </div>

        {configuracao.salario === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">Projeção indisponível</p>
            <p className="text-sm text-muted-foreground">
              Configure seu salário para ver a projeção de 12 meses.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projecaoAnual.map((linha) => {
              const percentualSobra =
                linha.receita > 0 ? (linha.sobra / linha.receita) * 100 : 0;
              return (
                <div
                  key={linha.mes}
                  className={cn(
                    "flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors",
                    linha.real
                      ? "bg-primary/5 border-primary/30"
                      : "bg-muted/20 border-border hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        linha.real ? "bg-primary/10" : "bg-muted"
                      )}
                    >
                      <Calendar
                        className={cn(
                          "w-5 h-5",
                          linha.real ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {linha.nome}
                        </p>
                        {linha.real && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary"
                          >
                            Atual
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="text-green-600 dark:text-green-400">
                          +{formatarMoeda(linha.receita)}
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          -{formatarMoeda(linha.despesa)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={cn(
                        "font-semibold text-sm",
                        linha.sobra >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      = {formatarMoeda(linha.sobra)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatarPercentual(percentualSobra, 0)} do salário
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Total da projeção */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Total em 12 meses</p>
                    <p className="text-xs text-muted-foreground">
                      Receita projetada: {formatarMoeda(totalProjecaoReceita)}
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-primary">
                  {formatarMoeda(totalProjecaoSobra)}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* === Dicas === */}
      <Card className="p-6 bg-muted/30">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-2">💡 Dicas de planejamento</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>
                Use o <strong>Comparador</strong> para economizar nas compras
                do dia a dia.
              </li>
              <li>
                Mantenha o teto em <strong>70% ou menos</strong> do salário
                para ter uma reserva de emergência.
              </li>
              <li>
                Registre <strong>todas as despesas</strong>, mesmo as
                pequenas — elas fazem diferença no fim do mês.
              </li>
              <li>
                Revise o <strong>Orçamento</strong> toda semana para não
                estourar o teto.
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}