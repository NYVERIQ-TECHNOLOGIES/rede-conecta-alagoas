import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { fetchCurrentUser } from "@/lib/session";
import { resolveHomePath } from "@/lib/experience";
import { registerNetworkCooperative } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import logoWhite from "@/assets/logo-branco.png.asset.json";

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

type SignupKind = "cliente" | "cooperativa";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [kind, setKind] = useState<SignupKind>("cliente");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [coopName, setCoopName] = useState("");
  const [coopCity, setCoopCity] = useState("");
  const [coopRegion, setCoopRegion] = useState("");
  const [coopCnpj, setCoopCnpj] = useState("");
  const [coopPhone, setCoopPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function goToHome() {
    const current = await fetchCurrentUser();
    navigate({ to: resolveHomePath(current?.roles ?? []), replace: true });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) goToHome();
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await goToHome();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });
      if (error) throw error;

      if (kind === "cooperativa") {
        await registerNetworkCooperative({
          name: coopName,
          email,
          city: coopCity,
          region: coopRegion || undefined,
          cnpj: coopCnpj || undefined,
          phone: coopPhone || undefined,
          responsible_name: fullName,
          description: "Cadastro realizado pela própria cooperativa (aguardando aprovação).",
        });
      }

      if (data.session) {
        const current = await fetchCurrentUser();
        navigate({ to: resolveHomePath(current?.roles ?? []), replace: true });
      } else {
        toast.success(
          kind === "cooperativa"
            ? "Conta criada. Confirme o e-mail — seu cadastro de cooperativa ficará pendente de aprovação."
            : "Conta criada. Confirme seu e-mail para acessar.",
        );
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
    await goToHome();
  }

  return (
    <div className="craft-pattern flex min-h-screen items-center justify-center bg-warn px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center">
          <img
            src={logoWhite.url}
            alt="Alagoas+Cooperativa"
            className="h-24 w-auto drop-shadow-sm"
          />
        </div>

        <div className="panel border-card p-7 shadow-xl">
          <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-blue-soft text-primary">
            <CheckCircle2 className="size-5" />
          </div>
          <h1 className="text-[24px] font-bold text-primary">
            {mode === "entrar" ? "Entrar na rede" : "Criar acesso na rede"}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Onde a produção cooperativista encontra o mercado.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "criar" && (
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-panel-2 p-1">
                {(["cliente", "cooperativa"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`rounded-md px-3 py-2 text-[12px] font-medium transition-colors ${
                      kind === k ? "bg-leaf text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {k === "cliente" ? "🛍️ Sou cliente" : "🌱 Sou cooperativa"}
                  </button>
                ))}
              </div>
            )}

            {mode === "criar" && kind === "cooperativa" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="coop-nome">Nome da cooperativa</Label>
                  <Input
                    id="coop-nome"
                    value={coopName}
                    onChange={(e) => setCoopName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="coop-cidade">Município</Label>
                    <Input
                      id="coop-cidade"
                      value={coopCity}
                      onChange={(e) => setCoopCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="coop-regiao">Região</Label>
                    <Input
                      id="coop-regiao"
                      value={coopRegion}
                      onChange={(e) => setCoopRegion(e.target.value)}
                      placeholder="Sertão, Agreste…"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="coop-cnpj">CNPJ</Label>
                    <Input
                      id="coop-cnpj"
                      value={coopCnpj}
                      onChange={(e) => setCoopCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="coop-telefone">Telefone</Label>
                    <Input
                      id="coop-telefone"
                      value={coopPhone}
                      onChange={(e) => setCoopPhone(e.target.value)}
                      placeholder="(82) 9 0000-0000"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "criar" && kind === "cliente" && (
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

            {mode === "criar" && kind === "cooperativa" && (
              <div className="space-y-1.5">
                <Label htmlFor="resp-nome">Nome do responsável</Label>
                <Input
                  id="resp-nome"
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

            {mode === "criar" && kind === "cooperativa" && (
              <p className="rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-[11px] text-warn">
                O cadastro entra como pendente e é liberado após a aprovação da administração.
              </p>
            )}

            <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
              {loading
                ? "Aguarde…"
                : mode === "entrar"
                  ? "Entrar"
                  : kind === "cliente"
                    ? "Criar conta de cliente"
                    : "Solicitar cadastro da cooperativa"}
            </Button>
          </form>

          <Button variant="outline" className="mt-3 w-full" onClick={handleGoogle}>
            Continuar com Google
          </Button>

          {mode === "entrar" ? (
            <div className="mt-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[11px] text-muted-foreground">Novo na rede?</span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setKind("cliente");
                    setMode("criar");
                  }}
                  className="rounded-md border border-line bg-panel-2 px-3 py-2.5 text-[12px] font-medium text-foreground transition-colors hover:border-leaf hover:text-leaf"
                >
                  🛍️ Cadastrar como cliente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setKind("cooperativa");
                    setMode("criar");
                  }}
                  className="rounded-md border border-line bg-panel-2 px-3 py-2.5 text-[12px] font-medium text-foreground transition-colors hover:border-leaf hover:text-leaf"
                >
                  🌱 Cadastrar como cooperativa
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="mt-5 w-full text-center text-[12px] text-muted-foreground hover:text-foreground"
              onClick={() => setMode("entrar")}
            >
              Já tenho acesso — entrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
