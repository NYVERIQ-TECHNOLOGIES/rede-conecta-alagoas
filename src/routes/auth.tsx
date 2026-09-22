import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Acesse o sistema de gestão da rede de comercialização cooperativista de Alagoas.",
      },
      { property: "og:title", content: "Entrar — ALAGOAS+COOPERATIVA" },
      {
        property: "og:description",
        content: "Acesso da rede cooperativista: lojas, cooperativas, estoque, vendas e repasses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/rede", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/rede", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/rede", replace: true });
        else toast.success("Conta criada. Confirme seu e-mail para acessar.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível continuar");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com Google");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/rede", replace: true });
  }

  return (
    <div className="craft-pattern flex min-h-screen items-center justify-center bg-warn px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Building2 className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-[15px] font-bold text-primary">
              Alagoas <span className="text-clay">+</span> Cooperativa
            </div>
            <div className="label-mono text-[10px]">Rede Cooperativista</div>
          </div>
        </div>

        <div className="panel border-card p-7 shadow-xl">
          <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-blue-soft text-primary"><CheckCircle2 className="size-5" /></div>
          <h1 className="text-[24px] font-bold text-primary">
            {mode === "entrar" ? "Entrar na rede" : "Criar acesso"}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Onde a produção cooperativista encontra o mercado.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "criar" && (
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
              {loading ? "Aguarde…" : mode === "entrar" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <Button variant="outline" className="mt-3 w-full" onClick={handleGoogle}>
            Continuar com Google
          </Button>

          <button
            type="button"
            className="mt-5 w-full text-center text-[12px] text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}
          >
            {mode === "entrar" ? "Não tem acesso? Criar conta" : "Já tenho acesso — entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
