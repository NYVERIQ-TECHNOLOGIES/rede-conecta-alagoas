import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSales, useStores } from "@/lib/queries";
import { brl, dateTimeBR, num, PERIODS, periodRange, type PeriodKey } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, StatCard, Tag } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/vendas")({
  head: () => ({
    meta: [
      { title: "Vendas — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Histórico de vendas da rede por loja, período e forma de pagamento.",
      },
      { property: "og:title", content: "Vendas — ALAGOAS+COOPERATIVA" },
      {
        property: "og:description",
        content: "Registro completo das vendas da rede cooperativista.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Vendas,
});

function Vendas() {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [store, setStore] = useState<string | null>(null);
  const range = periodRange(period);
  const { data: sales, isLoading } = useSales(range.start.toISOString());
  const { data: stores } = useStores();

  const list = (sales ?? []).filter((s) => (store ? s.store_id === store : true));
  const total = list.reduce((a, s) => a + Number(s.total), 0);
  const ticket = list.length ? total / list.length : 0;

  return (
    <>
      <PageHeader
        eyebrow="🧾 Vendas"
        title="Histórico de Vendas"
        description="Cada venda registra origem cooperativista, loja e forma de pagamento."
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
        <span className="mx-2 w-px bg-line" />
        <button
          onClick={() => setStore(null)}
          className={cn(
            "rounded-md px-3 py-1.5",
            store === null
              ? "bg-leaf text-primary-foreground"
              : "border border-line text-muted-foreground",
          )}
        >
          Todas
        </button>
        {(stores ?? []).map((s) => (
          <button
            key={s.id}
            onClick={() => setStore(s.id)}
            className={cn(
              "rounded-md px-3 py-1.5",
              store === s.id
                ? "bg-leaf text-primary-foreground"
                : "border border-line text-muted-foreground",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={brl(total)} tone="leaf" />
        <StatCard label="Vendas" value={num(list.length)} />
        <StatCard label="Ticket médio" value={brl(ticket)} />
      </div>

      <Panel title="Vendas do período" padded={false}>
        {isLoading ? (
          <div className="p-5">
            <LoadingRows rows={6} />
          </div>
        ) : list.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nenhuma venda no período" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {list.slice(0, 60).map((s) => (
              <div key={s.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                <span className="col-span-6 sm:col-span-3 font-mono text-[12px] text-muted-foreground">
                  {dateTimeBR(s.created_at)}
                </span>
                <span className="col-span-6 sm:col-span-3 text-[13px]">{s.stores?.name}</span>
                <span className="col-span-6 sm:col-span-3 text-[12px] text-muted-foreground">
                  {s.sale_items.length} itens · {s.payment_method}
                </span>
                <span className="col-span-3 sm:col-span-2 text-right font-mono text-[13px] text-leaf">
                  {brl(Number(s.total))}
                </span>
                <span className="col-span-3 sm:col-span-1 flex justify-end">
                  <Tag tone={s.status === "concluida" ? "good" : "crit"}>{s.status}</Tag>
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
