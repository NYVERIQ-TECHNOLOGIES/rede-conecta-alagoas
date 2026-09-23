import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInventory, useStores, stockLabel, stockTone } from "@/lib/queries";
import { brl, dateBR, num, daysUntil } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, StatCard, Tag } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Estoque por loja e produto com alertas de nível baixo, crítico e validade.",
      },
      { property: "og:title", content: "Estoque — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Controle de estoque da rede cooperativista." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Estoque,
});

function Estoque() {
  const [store, setStore] = useState<string | null>(null);
  const { data: stores } = useStores();
  const { data: inventory, isLoading } = useInventory();

  const list = (inventory ?? []).filter((i) => (store ? i.store_id === store : true));
  const value = list.reduce((a, i) => a + i.quantity * Number(i.products?.price ?? 0), 0);
  const low = list.filter((i) => i.quantity <= i.min_quantity).length;

  return (
    <>
      <PageHeader
        eyebrow="📦 Estoque"
        title="Estoque da Rede"
        description="Visão consolidada por loja, produto e lote, com alertas automáticos."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Itens" value={num(list.reduce((a, i) => a + i.quantity, 0))} />
        <StatCard label="Valor em estoque" value={brl(value)} tone="leaf" />
        <StatCard label="Alertas" value={num(low)} tone="clay" />
        <StatCard label="SKUs" value={num(list.length)} />
      </div>

      <div className="flex flex-wrap gap-1.5 font-mono text-[12px]">
        <button
          onClick={() => setStore(null)}
          className={cn(
            "rounded-md px-3 py-1.5",
            store === null
              ? "bg-leaf text-primary-foreground"
              : "border border-line text-muted-foreground",
          )}
        >
          Todas as lojas
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

      <Panel title="Posição de estoque" padded={false}>
        {isLoading ? (
          <div className="p-5">
            <LoadingRows rows={6} />
          </div>
        ) : list.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Sem itens em estoque" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {list.map((i) => {
              const d = daysUntil(i.product_batches?.expires_at ?? null);
              return (
                <div key={i.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                  <div className="col-span-12 sm:col-span-5">
                    <div className="text-[13px]">{i.products?.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {i.stores?.name} · {i.products?.cooperatives?.name}
                    </div>
                  </div>
                  <div className="col-span-4 sm:col-span-2 font-mono text-[13px]">
                    {num(i.quantity)} un
                  </div>
                  <div className="col-span-4 sm:col-span-3 font-mono text-[11px] text-muted-foreground">
                    {i.product_batches?.batch_code ?? "sem lote"}
                    {d !== null && ` · vence ${dateBR(i.product_batches?.expires_at)}`}
                  </div>
                  <div className="col-span-4 sm:col-span-2 flex justify-end">
                    <Tag tone={stockTone(i.quantity, i.min_quantity, i.critical_quantity)}>
                      {stockLabel(i.quantity, i.min_quantity, i.critical_quantity)}
                    </Tag>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </>
  );
}
