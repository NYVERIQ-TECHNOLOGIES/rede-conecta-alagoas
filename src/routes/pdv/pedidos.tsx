import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/session";
import { useCancelOrder, useConfirmOrder, useOrdersByStore } from "@/lib/queries";
import { brl, dateTimeBR, num } from "@/lib/format";
import { DELIVERY_LABEL, type Order } from "@/lib/domain";
import { EmptyState, LoadingRows, OrderStatusTag, PageHeader, Panel } from "@/components/kit";

export const Route = createFileRoute("/pdv/pedidos")({
  head: () => ({
    meta: [
      { title: "PDV · Pedidos — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Pedidos dos clientes para a loja: confirmar, cancelar ou acompanhar.",
      },
      { property: "og:title", content: "PDV · Pedidos — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: PedidosPdv,
});

function PedidosPdv() {
  const { data: user } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const { data: orders, isLoading } = useOrdersByStore(storeId);
  const confirmOrder = useConfirmOrder();
  const cancelOrder = useCancelOrder();

  const list = orders ?? [];

  async function confirmar(o: Order) {
    try {
      await confirmOrder.mutateAsync(o.id);
      toast.success(`Pedido #${String(o.code).padStart(4, "0")} confirmado`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível confirmar o pedido");
    }
  }

  async function cancelar(o: Order) {
    if (!confirm(`Cancelar o pedido #${String(o.code).padStart(4, "0")}?`)) return;
    try {
      await cancelOrder.mutateAsync(o.id);
      toast.success("Pedido cancelado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível cancelar o pedido");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Pedidos"
        title="Pedidos da Loja"
        description="Pedidos feitos pelos clientes para a sua loja. Confirme para transformar em venda ou cancele quando necessário."
      />

      {!storeId ? (
        <EmptyState
          title="Loja não vinculada ao seu perfil"
          description="Vincule sua loja para processar pedidos."
        />
      ) : (
        <Panel title={`Pedidos (${num(list.length)})`} padded={false}>
          {isLoading ? (
            <div className="p-5">
              <LoadingRows rows={7} />
            </div>
          ) : list.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Nenhum pedido para esta loja" />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {list.map((o) => (
                <div
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                >
                  <Link to="/pdv/pedido/$id" params={{ id: o.id }} className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12px] font-medium">
                        #{String(o.code).padStart(4, "0")}
                      </span>
                      <OrderStatusTag status={o.status} />
                    </div>
                    <div className="mt-0.5 text-[13px]">{o.customers?.full_name ?? "Cliente"}</div>
                    {o.is_demo && (
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        Pedido de demonstração
                      </div>
                    )}
                  </Link>
                  <div className="hidden text-right font-mono text-[11px] text-muted-foreground sm:block">
                    <div className="capitalize">{DELIVERY_LABEL[o.delivery_type]}</div>
                    <div>{dateTimeBR(o.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-semibold text-leaf">
                      {brl(Number(o.total))}
                    </span>
                    {o.status === "criado" && (
                      <button
                        onClick={() => confirmar(o)}
                        disabled={confirmOrder.isPending}
                        className="rounded-md border border-leaf/40 px-3 py-1 font-mono text-[11px] text-leaf hover:bg-leaf/10 disabled:opacity-50"
                      >
                        Confirmar
                      </button>
                    )}
                    {o.status !== "cancelado" && (
                      <button
                        onClick={() => cancelar(o)}
                        disabled={cancelOrder.isPending}
                        className="rounded-md border border-crit/40 px-3 py-1 font-mono text-[11px] text-crit hover:bg-crit/10 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </>
  );
}
