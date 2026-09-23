import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HandCoins, PlusCircle, ShoppingBag } from "lucide-react";
import { useCurrentUser } from "@/lib/session";
import { useInventory, useOrdersByStore, useSales } from "@/lib/queries";
import { brl, greeting, num, periodRange } from "@/lib/format";
import { Bars, EmptyState, MetricCard, Panel, QuickActions } from "@/components/kit";

export const Route = createFileRoute("/pdv/")({
  head: () => ({
    meta: [
      { title: "PDV · Dashboard — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content:
          "Painel operacional do ponto de venda: vendas, pedidos, estoque e valores da sua loja.",
      },
      { property: "og:title", content: "PDV · Dashboard — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: DashboardPdv,
});

function DashboardPdv() {
  const { data: user } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const since = periodRange("hoje").start.toISOString();
  const { data: salesToday } = useSales(since);
  const { data: salesAll } = useSales();
  const { data: orders } = useOrdersByStore(storeId);
  const { data: inventory } = useInventory();

  const hoje = useMemo(
    () =>
      (salesToday ?? [])
        .filter((s) => (storeId ? s.store_id === storeId : false) && s.status === "concluida")
        .reduce((acc, s) => acc + Number(s.total), 0),
    [salesToday, storeId],
  );

  const vendasHoje = useMemo(
    () =>
      (salesToday ?? []).filter(
        (s) => (storeId ? s.store_id === storeId : false) && s.status === "concluida",
      ),
    [salesToday, storeId],
  );

  const pendentes = useMemo(
    () => (orders ?? []).filter((o) => o.status === "criado" || o.status === "confirmado"),
    [orders],
  );

  const estoqueAlerta = useMemo(
    () =>
      (inventory ?? []).filter(
        (i) => (storeId ? i.store_id === storeId : false) && i.quantity <= i.min_quantity,
      ),
    [inventory, storeId],
  );

  const aReceber = useMemo(
    () =>
      (orders ?? [])
        .filter((o) => o.status !== "cancelado")
        .reduce((acc, o) => acc + Number(o.total), 0),
    [orders],
  );

  const top = useMemo(() => {
    const map = new Map<string, { name: string; qty: number }>();
    (salesAll ?? [])
      .filter((s) => (storeId ? s.store_id === storeId : false))
      .forEach((s) =>
        s.sale_items.forEach((item) => {
          const prev = map.get(item.product_id) ?? {
            name: item.products?.name ?? "Produto",
            qty: 0,
          };
          map.set(item.product_id, { name: prev.name, qty: prev.qty + item.quantity });
        }),
      );
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [salesAll, storeId]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="text-sm text-muted-foreground">
            {greeting()}
            {user?.profile?.full_name ? `, ${user.profile.full_name.split(" ")[0]}` : ""}
          </p>
          <h1 className="mt-1 text-[34px] leading-none font-semibold">
            Ponto de <span className="text-leaf">Venda</span>
          </h1>
          <p className="mt-2 max-w-md text-[13px] text-muted-foreground">
            Operação da sua loja: registrar vendas, processar pedidos e acompanhar o estoque.
          </p>
        </div>
      </div>

      {!storeId ? (
        <EmptyState
          title="Loja não vinculada ao seu perfil"
          description="Seu usuário ainda não está associado a uma loja. Peça ao administrador da rede para vincular sua loja ao perfil."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              label="Vendas hoje"
              value={brl(hoje)}
              hint={`${num(vendasHoje.length)} vendas concluídas`}
              tone="leaf"
            />
            <MetricCard
              label="Pedidos pendentes"
              value={num(pendentes.length)}
              hint="criados ou confirmados"
              tone="clay"
            />
            <MetricCard
              label="Estoque alerta"
              value={num(estoqueAlerta.length)}
              hint="itens abaixo do mínimo"
            />
            <MetricCard label="A receber" value={brl(aReceber)} hint="em pedidos não cancelados" />
          </div>

          <QuickActions
            actions={[
              { label: "Nova venda", to: "/pdv/vendas-novo", icon: PlusCircle, tone: "leaf" },
              { label: "Pedidos", to: "/pdv/pedidos", icon: ShoppingBag },
              { label: "Repasses", to: "/pdv/repasses", icon: HandCoins },
            ]}
          />

          <Panel title="Mais vendidos" subtitle="Top 5 produtos por quantidade na sua loja">
            {top.length === 0 ? (
              <EmptyState
                title="Ainda sem vendas registradas"
                description="Os destaques aparecem assim que houver vendas na loja."
              />
            ) : (
              <Bars
                items={top.map((t) => ({ label: t.name, value: t.qty }))}
                format={(v) => `${num(v)} un`}
              />
            )}
          </Panel>
        </>
      )}
    </>
  );
}
