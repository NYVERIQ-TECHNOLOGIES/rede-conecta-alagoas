import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSales, useStores } from "@/lib/queries";
import { brl, num, periodRange } from "@/lib/format";
import { PageHeader, Panel, StatCard } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/fechamento")({
  head: () => ({
    meta: [
      { title: "Fechamento de Caixa — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Resumo diário do caixa por loja: vendas, formas de pagamento e conferência.",
      },
      { property: "og:title", content: "Fechamento de Caixa — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Conferência simples do movimento do dia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Fechamento,
});

const METHODS = ["pix", "dinheiro", "debito", "credito"] as const;

function Fechamento() {
  const [store, setStore] = useState<string | null>(null);
  const { data: stores } = useStores();
  const { data: sales } = useSales(periodRange("hoje").start.toISOString());

  const list = useMemo(
    () => (sales ?? []).filter((s) => (store ? s.store_id === store : true) && s.status === "concluida"),
    [sales, store],
  );
  const total = list.reduce((a, s) => a + Number(s.total), 0);

  return (
    <>
      <PageHeader
        eyebrow="🔒 Fechamento"
        title="Fechamento de Caixa"
        description="Movimento do dia por loja e forma de pagamento — sem jargão contábil."
      />
      <div className="flex flex-wrap gap-1.5 font-mono text-[12px]">
        <button
          onClick={() => setStore(null)}
          className={cn(
            "rounded-md px-3 py-1.5",
            store === null ? "bg-leaf text-primary-foreground" : "border border-line text-muted-foreground",
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
              store === s.id ? "bg-leaf text-primary-foreground" : "border border-line text-muted-foreground",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total do dia" value={brl(total)} tone="leaf" />
        <StatCard label="Vendas" value={num(list.length)} />
        <StatCard label="Ticket médio" value={brl(list.length ? total / list.length : 0)} />
        <StatCard
          label="Itens vendidos"
          value={num(list.reduce((a, s) => a + s.sale_items.reduce((x, i) => x + i.quantity, 0), 0))}
        />
      </div>

      <Panel title="Por forma de pagamento" padded={false}>
        <div className="divide-y divide-line">
          {METHODS.map((m) => {
            const rows = list.filter((s) => s.payment_method === m);
            const value = rows.reduce((a, s) => a + Number(s.total), 0);
            return (
              <div key={m} className="flex items-center justify-between px-5 py-3">
                <span className="text-[13px] capitalize">{m}</span>
                <span className="font-mono text-[12px] text-muted-foreground">
                  {num(rows.length)} vendas
                </span>
                <span className="font-mono text-[13px] text-leaf">{brl(value)}</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
