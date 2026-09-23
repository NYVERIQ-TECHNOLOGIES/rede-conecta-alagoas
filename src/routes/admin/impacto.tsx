import { createFileRoute } from "@tanstack/react-router";
import { useCooperatives, useProducts, useSales, useSettlements } from "@/lib/queries";
import { brl, num } from "@/lib/format";
import { PageHeader, Panel, StatCard } from "@/components/kit";

export const Route = createFileRoute("/admin/impacto")({
  head: () => ({
    meta: [
      { title: "Impacto da Rede — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content:
          "Impacto socioeconômico da rede: renda gerada, famílias alcançadas e municípios atendidos.",
      },
      { property: "og:title", content: "Impacto da Rede — ALAGOAS+COOPERATIVA" },
      {
        property: "og:description",
        content: "Números que contam a história do cooperativismo alagoano.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Impacto,
});

function Impacto() {
  const { data: coops } = useCooperatives();
  const { data: products } = useProducts();
  const { data: sales } = useSales();
  const { data: settlements } = useSettlements();

  const total = (sales ?? []).reduce((a, s) => a + Number(s.total), 0);
  const repassado = (settlements ?? []).reduce((a, s) => a + Number(s.net_amount), 0);
  const familias = (coops ?? []).reduce((a, c) => a + (c.families_reached ?? 0), 0);
  const municipios = new Set((coops ?? []).map((c) => c.city)).size;
  const regioes = new Set((coops ?? []).map((c) => c.region).filter(Boolean)).size;

  return (
    <>
      <PageHeader
        eyebrow="🌱 Impacto"
        title="Impacto da Rede"
        description="Cada venda é renda que fica no território — do sertão ao litoral alagoano."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Comercializado" value={brl(total)} tone="leaf" />
        <StatCard label="Repassado" value={brl(repassado)} />
        <StatCard label="Famílias alcançadas" value={num(familias)} tone="clay" />
        <StatCard label="Municípios" value={num(municipios)} />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel title="Cooperativas" className="lg:col-span-2" padded={false}>
          <div className="divide-y divide-line">
            {(coops ?? []).map((c) => {
              const value = (settlements ?? [])
                .filter((s) => s.cooperative_id === c.id)
                .reduce((a, s) => a + Number(s.net_amount), 0);
              return (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
                >
                  <div>
                    <div className="text-[13px]">{c.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      📍 {c.city} · {c.region} · {num(c.families_reached ?? 0)} famílias
                    </div>
                  </div>
                  <span className="font-mono text-[13px] text-leaf">{brl(value)}</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel title="Diversidade produtiva">
            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produtos na rede</span>
                <span className="font-mono">{num(products?.length ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cooperativas</span>
                <span className="font-mono">{num(coops?.length ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Regiões</span>
                <span className="font-mono">{num(regioes)}</span>
              </div>
            </div>
          </Panel>
          <section className="panel border-leaf/25 bg-leaf/5 p-5">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Aqui não há concorrência entre cooperativas: os números existem para revelar
              oportunidades, apoiar quem precisa de impulso e celebrar o que a rede constrói junto.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
