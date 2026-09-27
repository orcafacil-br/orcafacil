import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Wallet,
  Palette,
  Sun,
  Moon,
  Monitor,
  Trash2,
  AlertTriangle,
  Check,
} from "lucide-react";
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
import { toast } from "sonner";
import { useFinanceStore } from "@/store/useFinanceStore";
import {
  PERFIS_TETO,
  calcularTeto,
  type PerfilTeto,
  type Tema,
} from "@/types/finance";
import {
  formatarMoeda,
  formatarInputMoeda,
  parsearMoedaBR,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { GerenciarCategorias } from "@/components/GerenciarCategorias";
import { ExportarImportar } from "@/components/ExportarImportar";

// ------------------------------------------------------------
// Opções de perfil
// ------------------------------------------------------------

const PERFIS: Array<{
  valor: PerfilTeto;
  label: string;
  percentual?: number;
  descricao: string;
  emoji: string;
}> = [
  {
    valor: "muito-economico",
    label: "Muito Econômico",
    percentual: 50,
    descricao: "Teto de 50% do salário. Ideal pra metas agressivas.",
    emoji: "🟢",
  },
  {
    valor: "economico",
    label: "Econômico",
    percentual: 65,
    descricao: "Teto de 65% do salário. Equilíbrio com folga.",
    emoji: "🟡",
  },
  {
    valor: "moderado",
    label: "Moderado",
    percentual: 80,
    descricao: "Teto de 80% do salário. Padrão recomendado.",
    emoji: "🟠",
  },
  {
    valor: "personalizado",
    label: "Personalizado",
    descricao: "Você define o valor ou a porcentagem.",
    emoji: "⚙️",
  },
];

// ------------------------------------------------------------
// Opções de tema
// ------------------------------------------------------------

const TEMAS: Array<{ valor: Tema; label: string; icon: any }> = [
  { valor: "light", label: "Claro", icon: Sun },
  { valor: "dark", label: "Escuro", icon: Moon },
  { valor: "system", label: "Sistema", icon: Monitor },
];

// ------------------------------------------------------------
// Página
// ------------------------------------------------------------

export default function Configuracoes() {
  const { configuracao, atualizarConfiguracao, resetarTudo } = useFinanceStore();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // === Cálculo do teto em tempo real ===
  const teto = calcularTeto(configuracao);

  // === Handlers ===
  const handleSalarioChange = (valorDigitado: string) => {
    const formatado = formatarInputMoeda(valorDigitado);
    const numero = parsearMoedaBR(formatado);
    atualizarConfiguracao({ salario: numero });
  };

  const handlePerfilChange = (perfil: PerfilTeto) => {
    const config = PERFIS_TETO[perfil as keyof typeof PERFIS_TETO];
    atualizarConfiguracao({
      perfilTeto: perfil,
      tetoPercentual: config?.percentual ?? configuracao.tetoPercentual,
    });
  };

  const handleTetoPersonalizadoChange = (valorDigitado: string) => {
    const formatado = formatarInputMoeda(valorDigitado);
    const numero = parsearMoedaBR(formatado);
    atualizarConfiguracao({ tetoPersonalizado: numero });
  };

  const handleReset = () => {
    resetarTudo();
    setResetDialogOpen(false);
    toast.success("Todos os dados foram apagados.");
  };

  // === Valor formatado pro input do salário ===
  const salarioFormatado =
    configuracao.salario > 0
      ? configuracao.salario.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "";

  // === Valor formatado pro input do teto personalizado ===
  const tetoFormatado = configuracao.tetoPersonalizado
    ? configuracao.tetoPersonalizado.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize seu OrçaFácil: salário, teto de gastos e preferências
        </p>
      </div>

      {/* === Teto em destaque === */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Teto de gastos mensal
            </p>
            <p className="text-4xl font-bold mt-1">{formatarMoeda(teto)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {configuracao.perfilTeto === "personalizado"
                ? "Valor personalizado"
                : `${configuracao.tetoPercentual}% de ${formatarMoeda(
                    configuracao.salario
                  )}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Salário base</p>
            <p className="text-2xl font-semibold">
              {formatarMoeda(configuracao.salario)}
            </p>
          </div>
        </div>
      </Card>

      {/* === Salário === */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Salário / Renda mensal</h2>
        </div>
        <div className="space-y-2">
          <Label htmlFor="salario">Quanto você recebe por mês?</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              R$
            </span>
            <Input
              id="salario"
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={salarioFormatado}
              onChange={(e) => handleSalarioChange(e.target.value)}
              className="pl-10 text-lg"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Esse valor é a base pro cálculo do seu teto de gastos.
          </p>
        </div>
      </Card>

      {/* === Perfil de teto === */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Perfil de teto</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PERFIS.map((perfil) => {
            const ativo = configuracao.perfilTeto === perfil.valor;
            return (
              <button
                key={perfil.valor}
                onClick={() => handlePerfilChange(perfil.valor)}
                className={cn(
                  "text-left p-4 rounded-lg border-2 transition-all",
                  ativo
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{perfil.emoji}</span>
                      <span className="font-semibold">{perfil.label}</span>
                      {perfil.percentual && (
                        <Badge variant="secondary" className="text-xs">
                          {perfil.percentual}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {perfil.descricao}
                    </p>
                  </div>
                  {ativo && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Campo do teto personalizado */}
        {configuracao.perfilTeto === "personalizado" && (
          <div className="mt-4 space-y-2 p-4 bg-muted/50 rounded-lg">
            <Label htmlFor="teto-custom">
              Valor do teto personalizado (R$)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="teto-custom"
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={tetoFormatado}
                onChange={(e) =>
                  handleTetoPersonalizadoChange(e.target.value)
                }
                className="pl-10 text-lg"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Você define exatamente quanto pode gastar por mês.
            </p>
          </div>
        )}
      </Card>

      {/* === Tema === */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Aparência</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {TEMAS.map((tema) => {
            const ativo = configuracao.tema === tema.valor;
            const Icone = tema.icon;
            return (
              <button
                key={tema.valor}
                onClick={() => atualizarConfiguracao({ tema: tema.valor })}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                  ativo
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <Icone
                  className={cn(
                    "w-6 h-6",
                    ativo ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className="text-sm font-medium">{tema.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* === Backup (Exportar/Importar) === */}
      <ExportarImportar />

      {/* === Gerenciar Categorias === */}
      <GerenciarCategorias />

      {/* === Zona de perigo === */}
      <Card className="p-6 border-destructive/30">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h2 className="text-xl font-semibold text-destructive">
            Zona de perigo
          </h2>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium">Resetar todos os dados</p>
            <p className="text-sm text-muted-foreground">
              Apaga salário, receitas, despesas, itens e categorias
              personalizadas. Essa ação não pode ser desfeita.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setResetDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Resetar
          </Button>
        </div>
      </Card>

      {/* === Dialog de confirmação === */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os seus dados serão apagados e não poderão ser
              recuperados. Recomendamos não fazer isso sem necessidade.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive-hover"
            >
              Sim, apagar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}