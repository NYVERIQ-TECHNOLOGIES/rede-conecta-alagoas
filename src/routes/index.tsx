import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, CheckCircle2, MapPin, Store, UsersRound } from "lucide-react";
import artisanImage from "@/assets/artesa-alagoas.jpg";

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
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-md bg-warn text-primary shadow-sm">
              <Building2 className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-bold text-primary">
                Alagoas <span className="text-clay">+</span> Cooperativa
              </div>
              <div className="label-mono text-[10px]">Rede Cooperativista</div>
            </div>
          </div>
          <Link
            to="/auth"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main>
        <section className="craft-pattern bg-warn">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.05fr_.95fr] md:py-16">
            <div>
              <p className="inline-flex rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase text-primary-foreground">Sistema de gestão da rede</p>
              <h1 className="mt-5 max-w-3xl text-[38px] leading-[1.08] font-extrabold text-foreground sm:text-[52px]">
                Onde a produção cooperativista encontra o mercado.
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-foreground/75">
                Conectamos quem produz, o que produz, onde vende, quanto recebe e o impacto que gera em Alagoas.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/auth" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm">
                  Acessar o sistema <ArrowRight className="size-4" />
                </Link>
                <a href="#rede" className="inline-flex items-center rounded-md border border-primary bg-card/80 px-5 py-3 text-sm font-bold text-primary">Conhecer a rede</a>
              </div>
              <div className="mt-8 grid max-w-xl grid-cols-3 gap-2">
                {[[Store, "3 lojas", "Rede integrada"], [UsersRound, "Cooperativas", "Origem direta"], [MapPin, "Alagoas", "Impacto local"]].map(([Icon, value, label]) => {
                  const StatIcon = Icon as typeof Store;
                  return <div key={String(value)} className="rounded-md border border-foreground/10 bg-card/90 p-3 shadow-sm"><StatIcon className="mb-2 size-4 text-primary"/><strong className="block text-sm text-primary">{String(value)}</strong><span className="text-[10px] text-muted-foreground">{String(label)}</span></div>;
                })}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border-4 border-card shadow-xl">
              <img src={artisanImage} alt="Artesã alagoana produzindo renda filé às margens do rio" width={1280} height={960} className="aspect-[4/3] w-full object-cover" />
              <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-md bg-card/95 p-3 shadow-lg backdrop-blur">
                <CheckCircle2 className="size-5 shrink-0 text-primary"/><div><strong className="block text-xs text-primary">Produção com origem</strong><span className="text-[10px] text-muted-foreground">Comércio justo e cooperativismo alagoano</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="rede" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="label-mono text-primary">Uma rede, do campo ao impacto</p>
          <h2 className="mt-2 text-2xl font-bold text-primary">Gestão integrada e transparente</h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CHAIN.map((step, i) => <div key={step} className="panel p-4"><span className="text-[11px] font-bold text-clay">{String(i + 1).padStart(2, "0")}</span><strong className="mt-3 block text-sm text-primary">{step}</strong></div>)}
          </div>
        </section>
      </main>
    </div>
  );
}
