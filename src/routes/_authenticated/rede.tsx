import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useCooperatives, useInventory, useProducts, useSales, useStores, useTransfers, useSettlements } from "@/lib/queries";
import { brl, greeting, num, PERIODS, periodRange, type PeriodKey, daysUntil } from "@/lib/format";
import { EmptyState, LoadingRows, Panel, StatCard, Tag } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/rede")({
  head: () => ({
    meta: [
      { title: "Visão da Rede — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content:
          "Panorama da rede cooperativista: vendas, cooperativas, produtos, lojas, alertas e destaques.",
      },
      { property: "og:title", content: "Visão da Rede — ALAGOAS+COOPERATIVA" },
      {
        property: "og:description",
        content: "Indicadores e alertas da rede de comercialização cooperativista de Alagoas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VisaoDaRede,
});

function VisaoDaRede() {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const range = periodRange(period);
  const { data: user } = useCurrentUser();
  const { data: sales, isLoading } = useSales(range.start.toISOString());
  const { data: cooperatives } = useCooperatives();
  const { data: products } = useProducts();
  const { data: stores } = useStores();
  const { data: inventory } = useInventory();
  const { data: transfers } = useTransfers();
  const { data: settlements } = useSettlements();

  const total = useMemo(
    () => (sales ?? []).filter((s) => s.status === "concluida").reduce((acc, s) => acc + Number(s.total), 0),
    [sales],
  );

  const perStore = useMemo(() => {
    const map = new Map<string, number>();
    (sales ?? []).forEach((s) => {
      map.set(s.store_id, (map.get(s.store_id) ?? 0) + Number(s.total));
    });
    const max = Math.max(1, ...map.values());
    return (stores ?? []).map((store) => ({
      store,
      value: map.get(store.id) ?? 0,
      pct: ((map.get(store.id) ?? 0) / max) * 100,
    }));
  }, [sales, stores]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; value: number }>();
    (sales ?? []).forEach((s) =>
      s.sale_items.forEach((item) => {
        const key = item.product_id;
        const prev = map.get(key) ?? { name: item.products?.name ?? "Produto", qty: 0, value: 0 };
        map.set(key, {
          name: prev.name,
          qty: prev.qty + item.quantity,
          value: prev.value + Number(item.total),
        });
      }),
    );
    return [...map.values()].sort((a, b) => b.value - a.value).slice(0, 3);
  }, [sales]);

  const alerts = useMemo(() => {
    const list: { tone: "crit" | "warn" | "leaf" | "muted"; text: string }[] = [];
    (inventory ?? []).forEach((inv) => {
      if (inv.quantity <= inv.critical_quantity) {
        list.push({
          tone: "crit",
          text: `${inv.products?.name} · ${inv.stores?.name} em estoque crítico (${inv.quantity} un.)`,
        });
      } else if (inv.quantity <= inv.min_quantity) {
        list.push({
          tone: "warn",
          text: `${inv.products?.name} · ${inv.stores?.name} com estoque baixo`,
        });
      }
      const d = daysUntil(inv.product_batches?.expires_at ?? null);
      if (d !== null && d >= 0 && d <= 30 && inv.quantity > 0) {
        list.push({
          tone: "warn",
          text: `${inv.products?.name} · ${inv.stores?.name} vence em ${d} dias`,
        });
      }
    });
    (settlements ?? [])
      .filter((s) => s.status === "aguardando")
      .forEach((s) =>
        list.push({
          tone: "leaf",
          text: `${s.cooperatives?.name} aguarda repasse de ${brl(Number(s.net_amount))}`,
        }),
      );
    (transfers ?? [])
      .filter((t) => t.status !== "recebida" && t.status !== "cancelada")
      .forEach((t) =>
        list.push({
          tone: "muted",
          text: `Transferência pendente · ${t.from?.name} → ${t.to?.name} (${t.quantity} un.)`,
        }),
      );
    return list.slice(0, 8);
  }, [inventory, settlements, transfers]);

  const activeCoops = (cooperatives ?? []).filter((c) => c.status === "ativa").length;
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="text-sm text-muted-foreground">
            {greeting()} 👋 {user?.profile?.full_name ? user.profile.full_name.split(" ")[0] : ""}
          </p>
          <h1 className="mt-1 text-[34px] leading-none font-semibold">
            Visão Geral <span className="text-leaf">da Rede</span>
          </h1>
          <p className="mt-2 max-w-md text-[13px] text-muted-foreground">
            Onde a produção cooperativista encontra o mercado — quem produz → o que → onde → quanto
            recebe.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[12px]">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors",
                period === p.key
                  ? "bg-leaf font-medium text-primary-foreground"
                  : "border border-line text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Vendas" value={brl(total)} hint="Valor total comercializado" />
        <StatCard
          label="Cooperativas"
          value={`${activeCoops} / ${cooperatives?.length ?? 0}`}
          hint="Ativas na rede"
        />
        <StatCard
          label="Produtos"
          value={num(products?.length ?? 0)}
          hint="Com origem cooperativista"
        />
        <StatCard
          label="Lojas"
          value={num(stores?.length ?? 0)}
          hint={(stores ?? []).map((s) => s.name).join(" · ")}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Panel
            title="Desempenho das Lojas"
            action={<span className="font-mono text-[11px] text-muted-foreground">Vendas no período</span>}
            padded={false}
          >
            {isLoading ? (
              <div className="p-5">
                <LoadingRows rows={3} />
              </div>
            ) : (
              <div className="divide-y divide-line">
                {perStore.map(({ store, value, pct }) => (
                  <Link
                    key={store.id}
                    to="/lojas/$id"
                    params={{ id: store.id }}
                    className="grid grid-cols-12 items-center gap-3 px-5 py-3.5 hover:bg-panel-2"
                  >
                    <div className="col-span-5 sm:col-span-4">
                      <div className="text-[13px] font-medium">{store.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {store.address}
                      </div>
                    </div>
                    <div className="col-span-7 sm:col-span-5">
                      <div className="h-1.5 overflow-hidden rounded-full bg-line">
                        <div className="h-full bg-leaf" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                        {brl(value)}
                      </div>
                    </div>
                    <div className="col-span-12 text-right font-mono text-[12px] text-muted-foreground sm:col-span-3">
                      {store.city}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="Produtos em Destaque"
            subtitle="Ranking por valor comercializado no período"
            action={
              <Link to="/produtos" className="font-mono text-[12px] text-leaf hover:text-leaf-2">
                Ver todos →
              </Link>
            }
          >
            {topProducts.length === 0 ? (
              <EmptyState
                title="Ainda sem vendas neste período"
                description="Os destaques aparecem assim que houver vendas registradas."
              />
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-md border border-line bg-panel-2 text-base">
                      {medals[i]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium">{p.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {num(p.qty)} un · {brl(p.value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel
            title="Atenção"
            action={<span className="font-mono text-[11px] text-clay">{alerts.length} itens</span>}
            padded={false}
          >
            {alerts.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Nenhum alerta no momento" />
              </div>
            ) : (
              <ul className="space-y-2 p-3 text-[12px]">
                {alerts.map((a, i) => (
                  <li key={i} className="flex items-start gap-2.5 px-2 py-1.5">
                    <span
                      className={cn(
                        "mt-1 size-2 shrink-0 rounded-full",
                        a.tone === "crit" && "bg-crit",
                        a.tone === "warn" && "bg-warn",
                        a.tone === "leaf" && "bg-leaf",
                        a.tone === "muted" && "bg-muted-foreground",
                      )}
                    />
                    <span className="text-muted-foreground">{a.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <section className="panel rise border-leaf/25 bg-leaf/5 p-5">
            <div className="flex items-center gap-2">
              <span>🌱</span>
              <h2 className="text-[16px] font-semibold">Impacto da Rede</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="font-mono text-[19px] font-semibold text-leaf">{brl(total)}</div>
                <div className="text-[11px] text-muted-foreground">comercializados</div>
              </div>
              <div>
                <div className="font-mono text-[19px] font-semibold">{cooperatives?.length ?? 0}</div>
                <div className="text-[11px] text-muted-foreground">cooperativas</div>
              </div>
              <div>
                <div className="font-mono text-[19px] font-semibold">
                  {new Set((cooperatives ?? []).map((c) => c.city)).size}
                </div>
                <div className="text-[11px] text-muted-foreground">municípios</div>
              </div>
              <div>
                <div className="font-mono text-[19px] font-semibold">{products?.length ?? 0}</div>
                <div className="text-[11px] text-muted-foreground">produtos</div>
              </div>
            </div>
            <Link
              to="/impacto"
              className="mt-4 block border-t border-leaf/15 pt-3 font-mono text-[11px] text-leaf"
            >
              Ver painel de impacto →
            </Link>
          </section>

          <Panel title="🌱 Destaques da Rede" subtitle="Inteligência cooperativa, sem competição.">
            {(cooperatives ?? []).length === 0 ? (
              <EmptyState title="Sem cooperativas cadastradas" />
            ) : (
              <div className="space-y-2">
                {(cooperatives ?? []).slice(0, 3).map((c) => (
                  <Link
                    key={c.id}
                    to="/cooperativas/$id"
                    params={{ id: c.id }}
                    className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-panel-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        📍 {c.city} · {c.region}
                      </div>
                    </div>
                    <Tag tone="leaf">{c.status}</Tag>
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
