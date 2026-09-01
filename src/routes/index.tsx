import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ALAGOAS+COOPERATIVA — Rede de Comercialização Cooperativista" },
      {
        name: "description",
        content:
          "Onde a produção cooperativista encontra o mercado. Gestão de cooperativas, produtos, lojas, estoque, vendas e repasses da rede Alagoas+Cooperativa.",
      },
      {
        property: "og:title",
        content: "ALAGOAS+COOPERATIVA — Rede de Comercialização Cooperativista",
      },
      {
        property: "og:description",
        content:
          "Sistema de gestão da rede cooperativista de Alagoas: cooperativas, produtos, lojas, estoque, vendas, repasses e impacto.",
      },
    ],
  }),
  component: Landing,
});

const CHAIN = [
  "Cooperativa",
  "Produto",
  "Lote",
  "Estoque",
  "Loja",
  "Venda",
  "Financeiro",
  "Repasse",
  "Impacto",
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-full border border-leaf/40 bg-leaf/15 font-mono text-xs font-semibold text-leaf">
              +
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-semibold">
                Alagoas<span className="text-leaf">+</span>Cooperativa
              </div>
              <div className="label-mono text-[10px]">Rede Cooperativista</div>
            </div>
          </div>
          <Link
            to="/auth"
            className="rounded-md border border-leaf/40 bg-leaf/10 px-4 py-2 text-sm font-medium text-leaf transition-colors hover:bg-leaf/20"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="label-mono">Sistema de Gestão da Rede de Comercialização</p>
        <h1 className="mt-3 max-w-3xl text-[44px] leading-[1.05] font-semibold">
          Onde a produção cooperativista <span className="text-leaf">encontra o mercado.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] text-muted-foreground">
          A infraestrutura digital da rede Alagoas+Cooperativa conecta quem produz, o que produz,
          onde está, onde vende, quanto vende, quanto recebe e qual impacto gera.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {CHAIN.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className="rounded-md border border-line bg-card px-3 py-1.5 font-mono text-[12px]">
                {step}
              </span>
              {i < CHAIN.length - 1 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </div>

        <div className="mt-12">
          <Link
            to="/auth"
            className="inline-flex rounded-md bg-leaf px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-leaf-2"
          >
            Acessar o sistema
          </Link>
        </div>
      </main>
    </div>
  );
}
