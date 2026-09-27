import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="text-xl text-muted-foreground">
          Oops! Página não encontrada
        </p>
        <Link
          to="/"
          className="inline-block text-primary underline hover:opacity-80"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}