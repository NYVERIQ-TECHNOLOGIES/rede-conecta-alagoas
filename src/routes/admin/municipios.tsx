import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCooperatives, useProducts, useSales, useStores } from "@/lib/queries";
import { brl, num } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, SearchInput } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/municipios")({
  head: () => ({
    meta: [
      { title: "Municípios — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Presença territorial da rede em Alagoas." },
      { property: "og:title", content: "Municípios — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Municipios,
});

interface Row {
  city: string;
  coops: number;
  stores: number;
  products: number;
  sales: number;
}

function Municipios() {
  const [q, setQ] = useState("");
  const { data: coops, isLoading } = useCooperatives();
  const { data: stores } = useStores();
  const { data: products } = useProducts();
  const { data: sales } = useSales();

  const rows = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();
    (coops ?? []).forEach((c) => {
      const r = map.get(c.city) ?? { city: c.city, coops: 0, stores: 0, products: 0, sales: 0 };
      r.coops += 1;
      map.set(c.city, r);
    });
    (stores ?? []).forEach((s) => {
      const r = map.get(s.city) ?? { city: s.city, coops: 0, stores: 0, products: 0, sales: 0 };
      r.stores += 1;
      map.set(s.city, r);
    });
    (products ?? []).forEach((p) => {
      const city = p.city || (p.cooperatives?.city ?? "");
      if (!city) return;
      const r = map.get(city) ?? { city, coops: 0, stores: 0, products: 0, sales: 0 };
      r.products += 1;
      map.set(city, r);
    });
    (sales ?? []).forEach((s) => {
      const store = stores?.find((st) => st.id === s.store_id);
      if (!store) return;
      const r = map.get(store.city) ?? {
        city: store.city,
        coops: 0,
        stores: 0,
        products: 0,
        sales: 0,
      };
      r.sales += Number(s.total);
      map.set(store.city, r);
    });
    return [...map.values()].sort((a, b) => b.sales - a.sales);
  }, [coops, stores, products, sales]);

  const list = rows.filter((r) => r.city.toLowerCase().includes(q.toLowerCase()));
  const active = rows.filter((r) => r.coops > 0 || r.stores > 0);

  return (
    <>
      <PageHeader
        eyebrow="🗺️ Rede · Municípios"
        title="Municípios Participantes"
        description="Onde a cooperação acontece: cooperativas, lojas, produtos com origem e vendas por município."
        action={
          <SearchInput value={q} onChange={setQ} placeholder="Buscar município…" className="w-56" />
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="panel p-4">
          <div className="label-mono">Municípios</div>
          <div className="mt-2 font-display text-[24px] font-bold text-primary">
            {num(rows.length)}
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground">com presença da rede</div>
        </div>
        <div className="panel p-4">
          <div className="label-mono">Ativos</div>
          <div className="mt-2 font-display text-[24px] font-bold text-leaf">
            {num(active.length)}
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground">cooperativa e/ou loja</div>
        </div>
        <div className="panel p-4">
          <div className="label-mono">Cooperativas</div>
          <div className="mt-2 font-display text-[24px] font-bold text-primary">
            {num(active.reduce((a, r) => a + r.coops, 0))}
          </div>
        </div>
        <div className="panel p-4">
          <div className="label-mono">Comercializado</div>
          <div className="mt-2 font-display text-[24px] font-bold text-clay">
            {brl(rows.reduce((a, r) => a + r.sales, 0))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingRows rows={6} />
      ) : list.length === 0 ? (
        <EmptyState title="Nenhum município encontrado" />
      ) : (
        <Panel padded={false}>
          <div className="divide-y divide-line">
            {list.map((r) => (
              <div key={r.city} className="grid grid-cols-12 items-center gap-3 px-5 py-3.5">
                <div className="col-span-6">
                  <div className="text-[13px] font-medium">📍 {r.city}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {r.coops > 0 && `${num(r.coops)} cooperativa${r.coops > 1 ? "s" : ""}`}
                    {r.stores > 0 && ` · ${num(r.stores)} loja${r.stores > 1 ? "s" : ""}`}
                    {r.products > 0 && ` · ${num(r.products)} produto${r.products > 1 ? "s" : ""}`}
                  </div>
                </div>
                <div className="col-span-6 text-right">
                  <div
                    className={cn(
                      "font-mono text-[13px]",
                      r.sales > 0 ? "font-semibold text-leaf" : "text-muted-foreground",
                    )}
                  >
                    {r.sales > 0 ? brl(r.sales) : "sem vendas"}
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground">comercializado</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </>
  );
}
