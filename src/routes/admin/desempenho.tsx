import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCategories, useProducts, useSales, useStores } from "@/lib/queries";
import { brl, num, PERIODS, periodRange, type PeriodKey } from "@/lib/format";
import { EmptyState, PageHeader, Panel, StatCard } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/desempenho")({
  head: () => ({
    meta: [
      { title: "Desempenho — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Curva de vendas, categorias e cooperativas em destaque na rede alagoana.",
      },
      { property: "og:title", content: "Desempenho — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Análises simples e diretas sobre a rede." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Desempenho,
});

function Desempenho() {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const range = periodRange(period);
  const { data: sales } = useSales(range.start.toISOString());
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const { data: stores } = useStores();

  const total = (sales ?? []).reduce((a, s) => a + Number(s.total), 0);

  const daily = useMemo(() => {
    const map = new Map<string, number>();
    (sales ?? []).forEach((s) => {
      const k = new Date(s.created_at).toLocaleDateString("pt-BR");
      map.set(k, (map.get(k) ?? 0) + Number(s.total));
    });
    const arr = [...map.entries()].reverse();
    const max = Math.max(1, ...arr.map(([, v]) => v));
    return arr.map(([day, value]) => ({ day, value, pct: (value / max) * 100 }));
  }, [sales]);

  const byCategory = useMemo(() => {
    const prodCat = new Map((products ?? []).map((p) => [p.id, p.category_id]));
    const map = new Map<string, number>();
    (sales ?? []).forEach((s) =>
      s.sale_items.forEach((i) => {
        const c = prodCat.get(i.product_id) ?? "outros";
        map.set(c, (map.get(c) ?? 0) + Number(i.total));
      }),
    );
    return (categories ?? [])
      .map((c) => ({ name: `${c.emoji} ${c.name}`, value: map.get(c.id) ?? 0 }))
      .sort((a, b) => b.value - a.value);
  }, [sales, products, categories]);

  const byCoop = useMemo(() => {
    const map = new Map<string, number>();
    (sales ?? []).forEach((s) =>
      s.sale_items.forEach((i) => {
        const name = i.cooperatives?.name ?? "—";
        map.set(name, (map.get(name) ?? 0) + Number(i.total));
      }),
    );
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [sales]);

  return (
    <>
      <PageHeader
        eyebrow="📈 Desempenho"
        title="Análises da Rede"
        description="Comparações entre lojas, categorias e cooperativas — para decidir com clareza."
      />

      <div className="flex flex-wrap gap-1.5 font-mono text-[12px]">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={cn(
              "rounded-md px-3 py-1.5",
              period === p.key
                ? "bg-leaf text-primary-foreground"
                : "border border-line text-muted-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Vendas" value={brl(total)} tone="leaf" />
        <StatCard label="Nº de vendas" value={num((sales ?? []).length)} />
        <StatCard label="Lojas ativas" value={num((stores ?? []).length)} />
      </div>

      <Panel title="Curva de vendas" subtitle="Evolução diária no período" padded={false}>
        {daily.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Sem vendas no período" />
          </div>
        ) : (
          <div className="flex h-48 items-end gap-1 px-5 py-5">
            {daily.map((d) => (
              <div
                key={d.day}
                className="group relative flex-1"
                title={`${d.day} · ${brl(d.value)}`}
              >
                <div
                  className="w-full rounded-t bg-leaf/70 group-hover:bg-leaf"
                  style={{ height: `${Math.max(4, d.pct)}%` }}
                />
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="Por categoria" padded={false}>
          <div className="divide-y divide-line">
            {byCategory.map((c) => (
              <div key={c.name} className="flex items-center justify-between px-5 py-3">
                <span className="text-[13px]">{c.name}</span>
                <span className="font-mono text-[13px] text-leaf">{brl(c.value)}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Cooperativas em destaque" padded={false}>
          <div className="divide-y divide-line">
            {byCoop.map(([name, value]) => (
              <div key={name} className="flex items-center justify-between px-5 py-3">
                <span className="text-[13px]">{name}</span>
                <span className="font-mono text-[13px] text-leaf">{brl(value)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
