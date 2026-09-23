import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useOrders } from "@/lib/queries";
import { brl, dateTimeBR, num } from "@/lib/format";
import {
  EmptyState,
  LoadingRows,
  MetricCard,
  OrderStatusTag,
  PageHeader,
  Panel,
} from "@/components/kit";

export const Route = createFileRoute("/cooperativa/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos dos Seus Produtos — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Pedidos feitos na rede que incluem produtos da sua cooperativa.",
      },
      { property: "og:title", content: "Pedidos dos Seus Produtos — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Pedidos,
});

function Pedidos() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: orders, isLoading } = useOrders();

  const rows = useMemo(
    () =>
      (orders ?? [])
        .map((o) => {
          const items = (o.order_items ?? []).filter((i) => i.cooperative_id === coopId);
          return { order: o, items, myTotal: items.reduce((a, i) => a + Number(i.total), 0) };
        })
        .filter((r) => r.items.length > 0),
    [orders, coopId],
  );

  const open = rows.filter((r) => !["concluido", "cancelado"].includes(r.order.status)).length;

  if (isLoading) {
    return <LoadingRows rows={7} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para acompanhar seus pedidos."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="🛒 Comercialização"
        title="Pedidos dos Seus Produtos"
        description="Pedidos realizados por clientes da rede que incluem itens da sua cooperativa."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard label="Pedidos" value={num(rows.length)} />
        <MetricCard label="Em aberto" value={num(open)} tone="clay" />
        <MetricCard
          label="Valor (seus itens)"
          value={brl(rows.reduce((a, r) => a + r.myTotal, 0))}
          tone="leaf"
        />
      </div>

      <Panel title={`Pedidos (${num(rows.length)})`} padded={false}>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Nenhum pedido com seus produtos"
              description="Quando clientes pedirem seus itens, eles aparecem aqui."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {rows.slice(0, 80).map(({ order: o, myTotal }) => (
              <div key={o.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3.5">
                <div className="col-span-4 sm:col-span-2">
                  <div className="font-mono text-[12px] font-medium">#{String(o.code)}</div>
                  <div className="truncate font-mono text-[11px] text-muted-foreground">
                    {dateTimeBR(o.created_at)}
                  </div>
                </div>
                <div className="col-span-5 truncate text-[13px] sm:col-span-4">
                  {o.stores?.name ?? "—"}
                </div>
                <div className="col-span-3 text-right font-mono text-[13px] font-semibold text-leaf sm:col-span-3">
                  {brl(myTotal)}
                </div>
                <div className="col-span-12 flex justify-end sm:col-span-3">
                  <OrderStatusTag status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
