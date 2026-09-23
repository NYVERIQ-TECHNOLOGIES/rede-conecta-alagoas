import { createFileRoute } from "@tanstack/react-router";
import { Check, MapPin, X } from "lucide-react";
import { useOrder } from "@/lib/queries";
import { brl, dateTimeBR } from "@/lib/format";
import { DELIVERY_LABEL, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/domain";
import { EmptyState, LoadingRows, OrderStatusTag, PageHeader, Panel, Tag } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cliente/pedido/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pedido — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Detalhes e acompanhamento do pedido." },
    ],
  }),
  component: Pedido,
});

const FLOW: OrderStatus[] = [
  "criado",
  "confirmado",
  "separacao",
  "pronto",
  "entregue",
  "concluido",
];

const PAYMENT_LABEL: Record<string, string> = {
  pix: "PIX",
  credito: "Crédito",
  debito: "Débito",
  dinheiro: "Dinheiro",
};

function Pedido() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) return <LoadingRows rows={8} />;

  if (!order) {
    return (
      <EmptyState
        title="Pedido não encontrado"
        description="Ele pode ter sido removido ou você não tem acesso a este pedido."
      />
    );
  }

  const code = String(order.code).padStart(4, "0");
  const cancelled = order.status === "cancelado";
  const idx = FLOW.indexOf(order.status);
  const items = order.order_items ?? [];

  return (
    <>
      <PageHeader
        eyebrow={`🧾 #${code}`}
        title={`Pedido ${code}`}
        description={`Realizado em ${dateTimeBR(order.created_at)}`}
        action={
          <div className="flex items-center gap-2">
            {order.is_demo && <Tag tone="warn">Demonstração</Tag>}
            <OrderStatusTag status={order.status} />
          </div>
        }
      />

      {cancelled ? (
        <div className="panel rise mt-6 border-crit/40 p-5">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-crit/10 text-crit">
              <X className="size-4" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-crit">Pedido cancelado</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {order.cancelled_reason ?? "O pedido foi cancelado."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="panel rise mt-6 overflow-x-auto p-5">
          <div className="flex min-w-max items-center">
            {FLOW.map((s, i) => {
              const done = i <= idx;
              const current = i === idx;
              return (
                <div key={s} className="flex items-center">
                  {i > 0 && (
                    <div
                      className={cn("h-px w-8 sm:w-14", done && idx >= 0 ? "bg-leaf" : "bg-line")}
                    />
                  )}
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full border",
                        done
                          ? "border-leaf bg-leaf text-primary-foreground"
                          : "border-line bg-panel-2 text-muted-foreground",
                        current && "ring-2 ring-leaf/40",
                      )}
                    >
                      {done ? (
                        <Check className="size-4" />
                      ) : (
                        <span className="font-mono text-[11px]">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "whitespace-nowrap font-mono text-[10px]",
                        current ? "font-bold text-leaf" : "text-muted-foreground",
                      )}
                    >
                      {ORDER_STATUS_LABEL[s]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Panel title={`Itens (${items.length})`} padded={false}>
            {items.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Sem itens registrados" />
              </div>
            ) : (
              <div className="divide-y divide-line">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {item.products?.image_url ? (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name ?? "Produto"}
                          className="size-10 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-panel-2 text-base">
                          🛍️
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium">
                          {item.products?.name ?? "Produto"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {item.cooperatives?.name} · {item.quantity} ×{" "}
                          {brl(Number(item.unit_price))}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-[13px] font-semibold text-leaf">
                      {brl(Number(item.total))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {order.delivery_type === "entrega" && (
            <Panel title="Endereço de entrega">
              {order.customer_addresses ? (
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {order.customer_addresses.label && (
                    <span className="font-medium text-foreground">
                      {order.customer_addresses.label} ·{" "}
                    </span>
                  )}
                  {order.customer_addresses.street}, {order.customer_addresses.number ?? "s/n"}
                  {order.customer_addresses.complement
                    ? ` — ${order.customer_addresses.complement}`
                    : ""}
                  <br />
                  {order.customer_addresses.neighborhood
                    ? `${order.customer_addresses.neighborhood} · `
                    : ""}
                  {order.customer_addresses.city}/{order.customer_addresses.state}
                  {order.customer_addresses.zip ? ` · ${order.customer_addresses.zip}` : ""}
                </p>
              ) : (
                <p className="text-[12px] text-muted-foreground">
                  Entrega solicitada, mas nenhum endereço foi registrado.
                </p>
              )}
            </Panel>
          )}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <Panel title="Pagamento">
            <div className="space-y-2 font-mono text-[12px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Forma</span>
                <span>{PAYMENT_LABEL[order.payment_method] ?? order.payment_method}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Entrega</span>
                <span>{DELIVERY_LABEL[order.delivery_type]}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{brl(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Desconto</span>
                <span>−{brl(Number(order.discount))}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-[16px] font-semibold text-leaf">
                <span>Total</span>
                <span>{brl(Number(order.total))}</span>
              </div>
            </div>
          </Panel>

          <Panel title="Loja">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-leaf" />
              <div className="min-w-0">
                <div className="text-[13px] font-medium">
                  {order.stores?.name ?? "Loja da rede"}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {order.stores?.city} {order.stores?.address ? `· ${order.stores.address}` : ""}
                </div>
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}
