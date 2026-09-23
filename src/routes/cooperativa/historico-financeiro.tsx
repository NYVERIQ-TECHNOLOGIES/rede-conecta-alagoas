import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useSales, useSettlements } from "@/lib/queries";
import { brl, dateBR, dateTimeBR, num, periodRange } from "@/lib/format";
import { EmptyState, LoadingRows, MetricCard, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/cooperativa/historico-financeiro")({
  head: () => ({
    meta: [
      { title: "Histórico Financeiro — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Linha do tempo financeira da sua cooperativa: repasses pagos e vendas do mês.",
      },
      { property: "og:title", content: "Histórico Financeiro — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: HistoricoFinanceiro,
});

type EventRow = {
  id: string;
  date: string;
  label: string;
  detail: string;
  value: number;
  kind: "repasse" | "venda";
};

function HistoricoFinanceiro() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: settlements, isLoading } = useSettlements();
  const { data: sales } = useSales(periodRange("mes").start.toISOString());

  const events = useMemo<EventRow[]>(() => {
    const list: EventRow[] = [];

    (settlements ?? [])
      .filter((s) => s.cooperative_id === coopId && s.status === "repassado")
      .forEach((s) =>
        list.push({
          id: s.id,
          date: s.paid_at ?? s.period_end,
          label: `Repasse ${dateBR(s.period_start)} – ${dateBR(s.period_end)}`,
          detail: `líquido recebido · vencimento ${dateBR(s.due_date)}`,
          value: Number(s.net_amount),
          kind: "repasse",
        }),
      );

    (sales ?? []).forEach((s) => {
      const items = (s.sale_items ?? []).filter((i) => i.cooperative_id === coopId);
      if (items.length === 0) return;
      list.push({
        id: s.id,
        date: s.created_at,
        label: `Venda #${String(s.code)} · ${s.stores?.name ?? "loja"}`,
        detail: `${num(items.reduce((a, i) => a + Number(i.quantity), 0))} un vendidas · ${s.payment_method}`,
        value: items.reduce((a, i) => a + Number(i.total), 0),
        kind: "venda",
      });
    });

    return list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 60);
  }, [settlements, sales, coopId]);

  const repassed = events.filter((e) => e.kind === "repasse").reduce((a, e) => a + e.value, 0);
  const monthSales = events.filter((e) => e.kind === "venda").reduce((a, e) => a + e.value, 0);

  if (isLoading) {
    return <LoadingRows rows={6} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para ver seu histórico financeiro."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Financeiro · Histórico"
        title="Histórico Financeiro"
        description="Linha do tempo com os repasses recebidos e as vendas do mês dos seus produtos."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard label="Repasses recebidos" value={brl(repassed)} tone="leaf" />
        <MetricCard label="Vendas no mês (seus itens)" value={brl(monthSales)} />
        <MetricCard label="Lançamentos" value={num(events.length)} />
      </div>

      <Panel title="Linha do tempo" padded={false}>
        {events.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Sem movimentações financeiras"
              description="Repasses pagos e vendas do mês aparecem aqui."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {events.map((e) => (
              <div
                key={`${e.kind}-${e.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium">{e.label}</span>
                    <Tag tone={e.kind === "repasse" ? "good" : "leaf"}>{e.kind}</Tag>
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {e.detail} · {dateTimeBR(e.date)}
                  </div>
                </div>
                <span
                  className={
                    "font-mono text-[14px] font-semibold " +
                    (e.kind === "repasse" ? "text-leaf" : "text-primary")
                  }
                >
                  {brl(e.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
