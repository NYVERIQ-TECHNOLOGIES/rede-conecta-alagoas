import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCancelOrder, useConfirmOrder, useOrder } from "@/lib/queries";
import { brl, dateTimeBR, num } from "@/lib/format";
import { DELIVERY_LABEL } from "@/lib/domain";
import { EmptyState, LoadingRows, OrderStatusTag, Panel } from "@/components/kit";

export const Route = createFileRoute("/pdv/pedido/$id")({
  head: () => ({
    meta: [
      { title: "PDV · Pedido — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Detalhe do pedido: itens, endereço de entrega e ações do PDV.",
      },
      { property: "og:title", content: "PDV · Pedido — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: PedidoDetalhe,
});

function PedidoDetalhe() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useOrder(id);
  const confirmOrder = useConfirmOrder();
  const cancelOrder = useCancelOrder();

  async function confirmar() {
    if (!order) return;
    try {
      await confirmOrder.mutateAsync(order.id);
      toast.success(`Pedido #${String(order.code).padStart(4, "0")} confirmado`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível confirmar o pedido");
    }
  }

  async function cancelar() {
    if (!order) return;
    if (!confirm(`Cancelar o pedido #${String(order.code).padStart(4, "0")}?`)) return;
    try {
      await cancelOrder.mutateAsync(order.id);
      toast.success("Pedido cancelado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível cancelar o pedido");
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 rise">
        <div className="max-w-3xl">
          <p className="label-mono">Pedido #{order ? String(order.code).padStart(4, "0") : "…"}</p>
          <h1 className="mt-1 text-[30px] leading-tight font-bold text-primary">
            {order?.customers?.full_name ?? "Detalhe do pedido"}
          </h1>
          {order && (
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {dateTimeBR(order.created_at)}
            </p>
          )}
        </div>
        <Link to="/pdv/pedidos" className="font-mono text-[12px] text-leaf">
          ← Pedidos
        </Link>
      </div>

      {isLoading ? (
        <div className="p-5">
          <LoadingRows rows={5} />
        </div>
      ) : !order ? (
        <EmptyState
          title="Pedido não encontrado"
          description="O pedido pode ter sido removido ou você não tem acesso a ele."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="panel p-4">
              <div className="label-mono">Status</div>
              <div className="mt-2">
                <OrderStatusTag status={order.status} />
              </div>
            </div>
            <div className="panel p-4">
              <div className="label-mono">Tipo</div>
              <div className="mt-2 text-[16px] font-semibold">
                {DELIVERY_LABEL[order.delivery_type]}
              </div>
            </div>
            <div className="panel p-4">
              <div className="label-mono">Pagamento</div>
              <div className="mt-2 text-[16px] font-semibold capitalize">
                {order.payment_method}
              </div>
            </div>
            <div className="panel p-4">
              <div className="label-mono">Total</div>
              <div className="mt-2 font-mono text-[18px] font-bold text-leaf">
                {brl(Number(order.total))}
              </div>
            </div>
          </div>

          {order.is_demo && (
            <p className="text-[12px] text-muted-foreground">
              Pedido de demonstração — não gera venda real.
            </p>
          )}

          <div className="grid gap-3 lg:grid-cols-3">
            <Panel
              title="Itens"
              subtitle={`${num(order.order_items?.length ?? 0)} itens`}
              className="lg:col-span-2"
              padded={false}
            >
              {(order.order_items ?? []).length === 0 ? (
                <div className="p-5">
                  <EmptyState title="Sem itens no pedido" />
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {(order.order_items ?? []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px]">{item.products?.name ?? "Produto"}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {num(item.quantity)} × {brl(Number(item.unit_price))} ·{" "}
                          {item.cooperatives?.name ?? "Rede cooperativista"}
                        </div>
                      </div>
                      <div className="font-mono text-[13px] text-leaf">
                        {brl(Number(item.total))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <div className="space-y-3">
              {order.delivery_type === "entrega" && (
                <Panel title="Endereço de entrega">
                  {order.customer_addresses ? (
                    <div className="space-y-1 text-[13px]">
                      <p className="font-medium">{order.customer_addresses.label ?? "Endereço"}</p>
                      <p>
                        {order.customer_addresses.street}
                        {order.customer_addresses.number
                          ? `, ${order.customer_addresses.number}`
                          : ""}
                      </p>
                      <p>
                        {order.customer_addresses.neighborhood ?? "—"},{" "}
                        {order.customer_addresses.city} - {order.customer_addresses.state}
                      </p>
                      {order.customer_addresses.complement && (
                        <p>{order.customer_addresses.complement}</p>
                      )}
                      {order.customer_addresses.zip && (
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {order.customer_addresses.zip}
                        </p>
                      )}
                    </div>
                  ) : (
                    <EmptyState title="Sem endereço informado" />
                  )}
                </Panel>
              )}

              <Panel title="Resumo">
                <div className="space-y-2 font-mono text-[12px]">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{brl(Number(order.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Desconto</span>
                    <span>{brl(Number(order.discount))}</span>
                  </div>
                  <div className="flex justify-between text-[16px] font-semibold text-leaf">
                    <span>Total</span>
                    <span>{brl(Number(order.total))}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {order.status === "criado" && (
                    <button
                      onClick={confirmar}
                      disabled={confirmOrder.isPending}
                      className="rounded-md bg-leaf px-4 py-2 text-[13px] font-medium text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      Confirmar pedido
                    </button>
                  )}
                  {order.status !== "cancelado" && (
                    <button
                      onClick={cancelar}
                      disabled={cancelOrder.isPending}
                      className="rounded-md border border-crit/40 px-4 py-2 text-[13px] font-medium text-crit hover:bg-crit/10 disabled:opacity-50"
                    >
                      Cancelar pedido
                    </button>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        </>
      )}
    </>
  );
}
