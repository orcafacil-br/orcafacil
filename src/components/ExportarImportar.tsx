import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  Database,
  AlertTriangle,
  CheckCircle2,
  FileJson,
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
  type Configuracao,
  type Categoria,
  type Receita,
  type Despesa,
  type ItemOrcamento,
} from "@/types/finance";
import { useState } from "react";

// ------------------------------------------------------------
// Estrutura do arquivo exportado
// ------------------------------------------------------------

interface BackupData {
  versao: number;
  exportadoEm: string;
  app: string;
  configuracao: Configuracao;
  receitas: Receita[];
  despesas: Despesa[];
  categorias: Categoria[];
  itensOrcamento: ItemOrcamento[];
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------

export function ExportarImportar() {
  const {
    configuracao,
    receitas,
    despesas,
    categorias,
    itensOrcamento,
    resetarTudo,
  } = useFinanceStore();

  const inputFileRef = useRef<HTMLInputElement>(null);
  const [confirmarImport, setConfirmarImport] = useState<BackupData | null>(
    null
  );

  // === Exportar ===
  const handleExportar = () => {
    const dados: BackupData = {
      versao: 1,
      exportadoEm: new Date().toISOString(),
      app: "OrçaFácil",
      configuracao,
      receitas,
      despesas,
      categorias,
      itensOrcamento,
    };

    const json = JSON.stringify(dados, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const data = new Date().toISOString().split("T")[0];
    const nomeArquivo = `orcafacil-backup-${data}.json`;

    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Backup exportado!", {
      description: `Arquivo: ${nomeArquivo}`,
    });
  };

  // === Importar ===
  const handleEscolherArquivo = () => {
    inputFileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valida extensão
    if (!file.name.endsWith(".json")) {
      toast.error("Arquivo inválido", {
        description: "Selecione um arquivo .json exportado pelo OrçaFácil.",
      });
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const conteudo = event.target?.result as string;
        const dados: BackupData = JSON.parse(conteudo);

        // Valida estrutura
        if (
          !dados.app ||
          dados.app !== "OrçaFácil" ||
          !dados.configuracao ||
          !Array.isArray(dados.receitas) ||
          !Array.isArray(dados.despesas) ||
          !Array.isArray(dados.categorias)
        ) {
          throw new Error("Arquivo não parece ser um backup válido do OrçaFácil.");
        }

        // Abre confirmação
        setConfirmarImport(dados);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao ler arquivo", {
          description:
            err instanceof Error
              ? err.message
              : "Arquivo corrompido ou inválido.",
        });
      } finally {
        if (inputFileRef.current) inputFileRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const confirmarImportacao = () => {
    if (!confirmarImport) return;

    // Aplica os dados
    useFinanceStore.setState({
      configuracao: confirmarImport.configuracao,
      receitas: confirmarImport.receitas,
      despesas: confirmarImport.despesas,
      categorias: confirmarImport.categorias,
      itensOrcamento: confirmarImport.itensOrcamento || [],
    });

    toast.success("Backup restaurado!", {
      description: `${confirmarImport.receitas.length} receitas, ${confirmarImport.despesas.length} despesas, ${confirmarImport.categorias.length} categorias.`,
    });

    setConfirmarImport(null);
  };

  // === Estatísticas do backup atual ===
  const stats = {
    receitas: receitas.length,
    despesas: despesas.length,
    categorias: categorias.length,
    itens: itensOrcamento.length,
    precos: itensOrcamento.reduce((s, i) => s + i.precos.length, 0),
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Backup dos dados</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Exporte um arquivo com todos os seus dados ou restaure um backup
        anterior. Guarde o arquivo em local seguro.
      </p>

      {/* Estatísticas atuais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Receitas</p>
          <p className="text-lg font-semibold">{stats.receitas}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Despesas</p>
          <p className="text-lg font-semibold">{stats.despesas}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Categorias</p>
          <p className="text-lg font-semibold">{stats.categorias}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Itens</p>
          <p className="text-lg font-semibold">
            {stats.itens}{" "}
            <span className="text-xs text-muted-foreground font-normal">
              ({stats.precos} preços)
            </span>
          </p>
        </div>
      </div>

      {/* Botões */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          onClick={handleExportar}
          variant="default"
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar backup
        </Button>

        <Button
          onClick={handleEscolherArquivo}
          variant="outline"
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Importar backup
        </Button>
      </div>

      {/* Input escondido */}
      <input
        ref={inputFileRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="mt-4 p-3 bg-muted/30 rounded-lg flex items-start gap-2">
        <FileJson className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          O arquivo é um <strong>.json</strong> legível contendo tudo que
          você cadastrou. Não contém senhas nem dados sensíveis.
        </p>
      </div>

      {/* === Dialog de confirmação da importação === */}
      <AlertDialog
        open={!!confirmarImport}
        onOpenChange={(o) => !o && setConfirmarImport(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Restaurar backup?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Isso vai <strong>substituir</strong> todos os seus dados
                atuais pelos dados do arquivo.
              </span>
              {confirmarImport && (
                <span className="block p-3 bg-muted/50 rounded-lg text-xs">
                  <strong>Arquivo selecionado:</strong>
                  <br />
                  Exportado em:{" "}
                  {new Date(confirmarImport.exportadoEm).toLocaleString(
                    "pt-BR"
                  )}
                  <br />
                  Receitas: {confirmarImport.receitas.length} • Despesas:{" "}
                  {confirmarImport.despesas.length} • Categorias:{" "}
                  {confirmarImport.categorias.length}
                </span>
              )}
              <span className="block text-destructive font-medium">
                ⚠️ Essa ação não pode ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarImportacao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive-hover"
            >
              Sim, restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}