import { createFileRoute } from "@tanstack/react-router";
import { useInventory } from "@/lib/queries";
import { dateBR, daysUntil, num } from "@/lib/format";
import { EmptyState, PageHeader, Panel, StatCard, Tag } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/validades")({
  head: () => ({
    meta: [
      { title: "Validades — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Controle de lotes próximos do vencimento para reduzir perdas na rede.",
      },
      { property: "og:title", content: "Validades — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Alertas de vencimento por lote e loja." },
    ],
  }),
  component: Validades,
});

function Validades() {
  const { data: inventory } = useInventory();

  const rows = (inventory ?? [])
    .map((i) => ({ ...i, days: daysUntil(i.product_batches?.expires_at ?? null) }))
    .filter((i) => i.days !== null && i.quantity > 0)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0));

  const vencidos = rows.filter((r) => (r.days ?? 0) < 0);
  const urgentes = rows.filter((r) => (r.days ?? 0) >= 0 && (r.days ?? 0) <= 15);
  const atencao = rows.filter((r) => (r.days ?? 0) > 15 && (r.days ?? 0) <= 30);

  return (
    <>
      <PageHeader
        eyebrow="⚠️ Validades"
        title="Lotes e Vencimentos"
        description="Antecipe ações comerciais para que nenhum produto cooperativista seja perdido."
      />
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Vencidos" value={num(vencidos.length)} tone="clay" />
        <StatCard label="Até 15 dias" value={num(urgentes.length)} />
        <StatCard label="16 a 30 dias" value={num(atencao.length)} />
      </div>

      <Panel title="Lotes monitorados" padded={false}>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nenhum lote com validade cadastrada" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {rows.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <div className="text-[13px]">{r.products?.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {r.stores?.name} · lote {r.product_batches?.batch_code ?? "—"} ·{" "}
                    {dateBR(r.product_batches?.expires_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-[12px]">
                  <span className="text-muted-foreground">{num(r.quantity)} un</span>
                  <Tag tone={(r.days ?? 0) < 0 ? "crit" : (r.days ?? 0) <= 15 ? "warn" : "good"}>
                    {(r.days ?? 0) < 0 ? "vencido" : `${r.days} dias`}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
