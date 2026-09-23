import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useProducts, useSales } from "@/lib/queries";
import { brl, dateBR, num, periodRange, type PeriodKey } from "@/lib/format";
import {
  Bars,
  EmptyState,
  LoadingRows,
  MetricCard,
  PageHeader,
  Panel,
  PeriodFilter,
} from "@/components/kit";

export const Route = createFileRoute("/cooperativa/desempenho")({
  head: () => ({
    meta: [
      { title: "Desempenho — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Comparativos de vendas, ticket médio e alcance territorial da sua cooperativa.",
      },
      { property: "og:title", content: "Desempenho — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Desempenho,
});

function Desempenho() {
  const [periodA, setPeriodA] = useState<PeriodKey>("mes");
  const [periodB, setPeriodB] = useState<PeriodKey>("mes_anterior");

  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: products } = useProducts();

  const rangeA = periodRange(periodA);
  const rangeB = periodRange(periodB);
  const { data: salesA, isLoading } = useSales(rangeA.start.toISOString());
  const { data: salesB } = useSales(rangeB.start.toISOString());

  const myProducts = useMemo(
    () => (products ?? []).filter((p) => p.cooperative_id === coopId),
    [products, coopId],
  );

  const analyze = useMemo(() => {
    const collect = (sales: typeof salesA, range: { start: Date; end: Date }) => {
      const endISO = range.end.toISOString();
      const items = (sales ?? []).flatMap((s) => {
        if (s.created_at > endISO) return [];
        return (s.sale_items ?? [])
          .filter((i) => i.cooperative_id === coopId)
          .map((i) => ({ ...i, _sale_date: s.created_at }));
      });
      const value = items.reduce((a, i) => a + Number(i.total), 0);
      const qty = items.reduce((a, i) => a + Number(i.quantity), 0);
      const salesCount = items.reduce((set, i) => set.add(i.sale_id), new Set<string>()).size;
      return { value, qty, salesCount, items };
    };

    const a = collect(salesA, rangeA);
    const b = collect(salesB, rangeB);

    const daily = new Map<string, number>();
    a.items.forEach((i) => {
      const day = dateBR((i as { _sale_date: string })._sale_date);
      daily.set(day, (daily.get(day) ?? 0) + Number(i.total));
    });
    const dailyBars = [...daily.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((x, y) => x.label.localeCompare(y.label));

    const byProduct = new Map<string, { label: string; qty: number }>();
    a.items.forEach((i) => {
      const prev = byProduct.get(i.product_id) ?? {
        label: i.products?.name ?? "Produto",
        qty: 0,
      };
      byProduct.set(i.product_id, { label: prev.label, qty: prev.qty + Number(i.quantity) });
    });
    const topProducts = [...byProduct.values()].sort((x, y) => y.qty - x.qty).slice(0, 5);

    const soldProductIds = new Set(a.items.map((i) => i.product_id));
    const cities = new Set(
      (products ?? [])
        .filter((p) => soldProductIds.has(p.id) && p.city)
        .map((p) => p.city as string),
    );

    const delta = b.value > 0 ? ((a.value - b.value) / b.value) * 100 : null;

    return {
      a,
      b,
      dailyBars,
      topProducts,
      ticket: a.salesCount > 0 ? a.value / a.salesCount : 0,
      cities: cities.size,
      delta,
    };
  }, [salesA, salesB, rangeA, rangeB, coopId, products]);

  if (isLoading) {
    return <LoadingRows rows={6} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para ver o desempenho da sua produção."
      />
    );
  }

  const { a, b, dailyBars, topProducts, ticket, cities, delta } = analyze;

  return (
    <>
      <PageHeader
        eyebrow="📊 Desempenho"
        title="Desempenho da Cooperativa"
        description="Compare períodos, acompanhe as vendas dia a dia e o alcance da sua produção."
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="Período A">
          <PeriodFilter value={periodA} onChange={setPeriodA} />
          <MetricCard
            label="Valor vendido"
            value={brl(a.value)}
            tone="leaf"
            hint={`${num(a.qty)} unidades`}
          />
        </Panel>
        <Panel title="Período B">
          <PeriodFilter value={periodB} onChange={setPeriodB} />
          <MetricCard label="Valor vendido" value={brl(b.value)} hint={`${num(b.qty)} unidades`} />
        </Panel>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Diferença A vs B"
          value={delta === null ? "—" : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`}
          tone={delta !== null ? (delta >= 0 ? "leaf" : "clay") : "default"}
          hint="Percentual sobre o período B"
        />
        <MetricCard label="Ticket médio (A)" value={brl(ticket)} />
        <MetricCard
          label="Municípios atingidos"
          value={num(cities)}
          hint="Origem dos produtos vendidos em A"
        />
        <MetricCard
          label="Produtos ativos"
          value={num(myProducts.filter((p) => p.status === "ativa").length)}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="Vendas por dia" subtitle="Valor dos seus itens no período A">
          {dailyBars.length === 0 ? (
            <EmptyState title="Sem vendas no período A" />
          ) : (
            <Bars items={dailyBars} format={(v) => brl(v)} />
          )}
        </Panel>
        <Panel title="Mais vendidos (período A)" subtitle="Quantidade por produto">
          {topProducts.length === 0 ? (
            <EmptyState title="Sem vendas no período A" />
          ) : (
            <Bars
              items={topProducts.map((t) => ({ label: t.label, value: t.qty }))}
              format={(v) => (v === 1 ? "1 unidade" : `${num(v)} unidades`)}
            />
          )}
        </Panel>
      </div>
    </>
  );
}
