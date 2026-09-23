import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HandCoins, PlusCircle, ShoppingBasket } from "lucide-react";
import { useCurrentUser } from "@/lib/session";
import { useCooperatives, useOrders, useProducts, useSales } from "@/lib/queries";
import { brl, greeting, num, periodRange } from "@/lib/format";
import {
  Bars,
  EmptyState,
  LoadingRows,
  MetricCard,
  PageHeader,
  Panel,
  QuickActions,
  Tag,
} from "@/components/kit";

export const Route = createFileRoute("/cooperativa/")({
  head: () => ({
    meta: [
      { title: "Dashboard da Cooperativa — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content:
          "Painel gerencial da cooperativa: produtos, vendas dos seus produtos, repasses e estoque sob responsabilidade.",
      },
      { property: "og:title", content: "Dashboard da Cooperativa — ALAGOAS+COOPERATIVA" },
      {
        property: "og:description",
        content: "Quem produz acompanha cada real vendido na rede cooperativista de Alagoas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: cooperatives, isLoading } = useCooperatives();
  const { data: products } = useProducts();
  const { data: monthSales } = useSales(periodRange("mes").start.toISOString());
  const { data: allSales } = useSales();
  const { data: orders } = useOrders();

  const coop = (cooperatives ?? []).find((c) => c.id === coopId);

  const myProducts = useMemo(
    () => (products ?? []).filter((p) => p.cooperative_id === coopId),
    [products, coopId],
  );

  const myOrderCount = useMemo(
    () =>
      (orders ?? []).filter((o) => (o.order_items ?? []).some((i) => i.cooperative_id === coopId))
        .length,
    [orders, coopId],
  );

  const monthValue = useMemo(
    () =>
      (monthSales ?? []).reduce(
        (acc, s) =>
          acc +
          (s.sale_items ?? [])
            .filter((i) => i.cooperative_id === coopId)
            .reduce((a, i) => a + Number(i.total), 0),
        0,
      ),
    [monthSales, coopId],
  );

  const toReceive = useMemo(
    () =>
      (allSales ?? []).reduce(
        (acc, s) =>
          acc +
          (s.sale_items ?? [])
            .filter((i) => i.cooperative_id === coopId)
            .reduce((a, i) => a + Number(i.net_amount), 0),
        0,
      ),
    [allSales, coopId],
  );

  const topSellers = useMemo(() => {
    const map = new Map<string, { label: string; qty: number }>();
    (monthSales ?? []).forEach((s) =>
      (s.sale_items ?? [])
        .filter((i) => i.cooperative_id === coopId)
        .forEach((item) => {
          const prev = map.get(item.product_id) ?? {
            label: item.products?.name ?? "Produto",
            qty: 0,
          };
          map.set(item.product_id, {
            label: prev.label,
            qty: prev.qty + Number(item.quantity),
          });
        }),
    );
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [monthSales, coopId]);

  if (isLoading) {
    return <LoadingRows rows={6} />;
  }

  if (!coopId || !coop) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Entre em contato com a administração da rede para vincular seu perfil a uma cooperativa e começar a acompanhar seus produtos e repasses."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`${greeting()} ${user?.profile?.full_name?.split(" ")[0] ?? ""}`}
        title="Sua Cooperativa"
        description={`${coop.name} · ${coop.city} · ${coop.region ?? "Alagoas"} — os indicadores abaixo refletem apenas o que é produzido por vocês.`}
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="panel rise p-5">
          <div className="label-mono">Sua cooperativa</div>
          <h2 className="mt-2 text-[20px] leading-tight font-bold text-primary">{coop.name}</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            📍 {coop.city}
            {coop.region ? ` · ${coop.region}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Tag
              tone={coop.status === "ativa" ? "good" : coop.status === "pendente" ? "warn" : "crit"}
            >
              {coop.status}
            </Tag>
            <Tag tone="leaf">{num(myProducts.length)} produtos</Tag>
          </div>
          <Link
            to="/cooperativa/dados"
            className="mt-4 inline-block font-mono text-[11px] text-leaf hover:text-leaf-2"
          >
            Ver todos os dados →
          </Link>
        </section>

        <section className="panel rise p-5">
          <div className="label-mono">Produção</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-[30px] leading-none font-bold text-primary">
              {num(myProducts.filter((p) => p.status === "ativa").length)}
            </span>
            <span className="text-[13px] text-muted-foreground">produtos ativos</span>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            {num(myProducts.length)} produtos cadastrados no total, com origem em{" "}
            {num(new Set(myProducts.map((p) => p.city).filter(Boolean)).size)} municípios.
          </p>
        </section>

        <section className="panel rise p-5">
          <div className="label-mono">Rede</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-[30px] leading-none font-bold text-primary">
              {num(myOrderCount)}
            </span>
            <span className="text-[13px] text-muted-foreground">pedidos com seus produtos</span>
          </div>
          <Link
            to="/cooperativa/pedidos"
            className="mt-2 inline-block font-mono text-[11px] text-leaf hover:text-leaf-2"
          >
            Acompanhar pedidos →
          </Link>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Produtos ativos"
          value={num(myProducts.filter((p) => p.status === "ativa").length)}
          hint="Comercializáveis na rede"
          tone="leaf"
        />
        <MetricCard
          label="Vendas no mês"
          value={brl(monthValue)}
          hint="Apenas produtos da sua cooperativa"
        />
        <MetricCard
          label="A receber"
          value={brl(toReceive)}
          hint="Soma líquida ainda não repassada"
          tone="clay"
        />
        <MetricCard
          label="Pedidos dos seus produtos"
          value={num(myOrderCount)}
          hint="Em todas as lojas da rede"
        />
      </div>

      <QuickActions
        actions={[
          { label: "Novo produto", icon: PlusCircle, to: "/cooperativa/produto-novo" },
          { label: "Meus produtos", icon: ShoppingBasket, to: "/cooperativa/produtos" },
          { label: "Repasses", icon: HandCoins, to: "/cooperativa/repasses" },
        ]}
      />

      <Panel
        title="Mais vendidos (meus produtos)"
        subtitle="Quantidade comercializada no mês atual"
        action={<span className="font-mono text-[11px] text-muted-foreground">mês atual</span>}
      >
        {topSellers.length === 0 ? (
          <EmptyState
            title="Ainda sem vendas dos seus produtos neste mês"
            description="Assim que os PDVs registrarem vendas dos seus produtos, o ranking aparece aqui."
          />
        ) : (
          <Bars
            items={topSellers.map((t) => ({ label: t.label, value: t.qty }))}
            format={(v) => (v === 1 ? "1 unidade vendida" : `${num(v)} unidades vendidas`)}
          />
        )}
      </Panel>
    </>
  );
}
