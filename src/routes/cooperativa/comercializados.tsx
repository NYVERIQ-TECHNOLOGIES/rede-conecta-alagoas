import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useSales } from "@/lib/queries";
import { brl, num, periodRange, PERIODS, type PeriodKey } from "@/lib/format";
import {
  Bars,
  EmptyState,
  LoadingRows,
  MetricCard,
  PageHeader,
  Panel,
  PeriodFilter,
} from "@/components/kit";

export const Route = createFileRoute("/cooperativa/comercializados")({
  head: () => ({
    meta: [
      { title: "Produtos Comercializados — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content:
          "Quais produtos da sua cooperativa foram mais vendidos e o que foi gerado de receita.",
      },
      { property: "og:title", content: "Produtos Comercializados — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Comercializados,
});

function Comercializados() {
  const [period, setPeriod] = useState<PeriodKey>("mes");
  const range = periodRange(period);
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: sales, isLoading } = useSales(range.start.toISOString());

  const byProduct = useMemo(() => {
    const map = new Map<string, { label: string; qty: number; value: number }>();
    (sales ?? []).forEach((s) =>
      (s.sale_items ?? [])
        .filter((i) => i.cooperative_id === coopId)
        .forEach((i) => {
          const prev = map.get(i.product_id) ?? {
            label: i.products?.name ?? "Produto",
            qty: 0,
            value: 0,
          };
          map.set(i.product_id, {
            label: prev.label,
            qty: prev.qty + Number(i.quantity),
            value: prev.value + Number(i.total),
          });
        }),
    );
    return [...map.values()].sort((a, b) => b.value - a.value);
  }, [sales, coopId]);

  const totalValue = byProduct.reduce((a, b) => a + b.value, 0);
  const totalQty = byProduct.reduce((a, b) => a + b.qty, 0);
  const qtyItems = byProduct
    .map((b) => ({ label: b.label, value: b.qty }))
    .filter((b) => b.value > 0);
  const valueItems = byProduct
    .map((b) => ({ label: b.label, value: b.value }))
    .filter((b) => b.value > 0);

  if (isLoading) {
    return <LoadingRows rows={6} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para acompanhar os produtos comercializados."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="📈 Comercialização"
        title="Produtos Comercializados"
        description="O que a sua cooperativa vendeu no período selecionado e quanto cada produto gerou."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodFilter value={period} onChange={(k) => setPeriod(k)} />
        <span className="font-mono text-[11px] text-muted-foreground">
          {PERIODS.find((p) => p.key === period)?.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard label="Receita gerada" value={brl(totalValue)} tone="leaf" />
        <MetricCard label="Unidades vendidas" value={num(totalQty)} />
        <MetricCard label="Produtos distintos" value={num(byProduct.length)} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="Por valor comercializado" subtitle="Ranking em R$">
          {valueItems.length === 0 ? (
            <EmptyState title="Nada comercializado no período" />
          ) : (
            <Bars items={valueItems} format={(v) => brl(v)} />
          )}
        </Panel>
        <Panel title="Por quantidade vendida" subtitle="Unidades por produto">
          {qtyItems.length === 0 ? (
            <EmptyState title="Nada vendido no período" />
          ) : (
            <Bars items={qtyItems} format={(v) => (v === 1 ? "1 unidade" : `${num(v)} unidades`)} />
          )}
        </Panel>
      </div>
    </>
  );
}
