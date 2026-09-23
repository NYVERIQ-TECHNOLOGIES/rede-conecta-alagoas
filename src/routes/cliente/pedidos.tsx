import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useOrders } from "@/lib/queries";
import { brl, dateTimeBR, num } from "@/lib/format";
import { DELIVERY_LABEL } from "@/lib/domain";
import { EmptyState, LoadingRows, OrderStatusTag, PageHeader, Panel } from "@/components/kit";

export const Route = createFileRoute("/cliente/pedidos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Meus pedidos — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Acompanhe o andamento dos seus pedidos na rede." },
    ],
  }),
  component: Pedidos,
});

function Pedidos() {
  const { data: orders, isLoading } = useOrders();

  return (
    <>
      <PageHeader
        eyebrow="🧾 Meus pedidos"
        title="Meus pedidos"
        description="Acompanhe o andamento das suas compras na rede cooperativista."
      />

      <Panel title={`Pedidos (${num((orders ?? []).length)})`} padded={false}>
        {isLoading ? (
          <div className="p-5">
            <LoadingRows rows={6} />
          </div>
        ) : (orders ?? []).length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Você ainda não fez pedidos"
              description="Explore o catálogo e comece suas compras da rede."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {(orders ?? []).map((o) => (
              <Link
                key={o.id}
                to="/cliente/pedido/$id"
                params={{ id: o.id }}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-panel-2"
              >
                <div className="min-w-0">
                  <div className="font-mono text-[13px] font-medium">
                    #{String(o.code).padStart(4, "0")}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {dateTimeBR(o.created_at)} · {DELIVERY_LABEL[o.delivery_type]} ·{" "}
                    {o.stores?.name ?? "Loja"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-semibold text-leaf">
                    {brl(Number(o.total))}
                  </span>
                  <OrderStatusTag status={o.status} />
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
