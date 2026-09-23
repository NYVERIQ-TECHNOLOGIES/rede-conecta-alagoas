import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useOrders } from "@/lib/queries";
import { brl, dateTimeBR, num } from "@/lib/format";
import { EmptyState, LoadingRows, OrderStatusTag, PageHeader, Panel } from "@/components/kit";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/domain";

export const Route = createFileRoute("/admin/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Pedidos realizados pelos clientes em toda a rede." },
      { property: "og:title", content: "Pedidos — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Pedidos,
});

const STATUSES: (OrderStatus | "todos")[] = [
  "todos",
  "criado",
  "confirmado",
  "separacao",
  "pronto",
  "entregue",
  "concluido",
  "cancelado",
];

function Pedidos() {
  const [status, setStatus] = useState<OrderStatus | "todos">("todos");
  const { data: orders, isLoading } = useOrders();

  const list = useMemo(
    () => (orders ?? []).filter((o) => status === "todos" || o.status === status),
    [orders, status],
  );

  const total = list
    .filter((o) => o.status !== "cancelado")
    .reduce((a, o) => a + Number(o.total), 0);

  return (
    <>
      <PageHeader
        eyebrow="🧾 Operação · Pedidos"
        title="Pedidos da Rede"
        description="Pedidos feitos por clientes e a serem processados pelos PDVs. A venda confirmada alimenta os indicadores da rede."
      />

      <div className="flex flex-wrap gap-1.5 font-mono text-[12px]">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-md px-3 py-1.5 capitalize transition-colors",
              status === s
                ? "bg-leaf font-medium text-primary-foreground"
                : "border border-line text-muted-foreground hover:text-foreground",
            )}
          >
            {s === "todos" ? "Todos" : s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="panel p-4">
          <div className="label-mono">Pedidos</div>
          <div className="mt-2 font-display text-[24px] font-bold text-primary">
            {num(list.length)}
          </div>
        </div>
        <div className="panel p-4">
          <div className="label-mono">Valor (não cancelados)</div>
          <div className="mt-2 font-display text-[24px] font-bold text-leaf">{brl(total)}</div>
        </div>
        <div className="panel p-4">
          <div className="label-mono">Pendentes</div>
          <div className="mt-2 font-display text-[24px] font-bold text-clay">
            {num(list.filter((o) => !["concluido", "cancelado"].includes(o.status)).length)}
          </div>
        </div>
      </div>

      <Panel title={`Pedidos (${num(list.length)})`} padded={false}>
        {isLoading ? (
          <div className="p-5">
            <LoadingRows rows={7} />
          </div>
        ) : list.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nenhum pedido neste filtro" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {list.map((o) => (
              <div key={o.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3.5">
                <div className="col-span-4 sm:col-span-3">
                  <div className="font-mono text-[12px] font-medium">#{String(o.code)}</div>
                  <div className="truncate text-[13px]">{o.customers?.full_name ?? "Cliente"}</div>
                </div>
                <div className="col-span-4 sm:col-span-3 font-mono text-[12px] text-muted-foreground">
                  {o.stores?.name ?? "—"}
                </div>
                <div className="hidden font-mono text-[11px] text-muted-foreground sm:col-span-3 sm:block">
                  {dateTimeBR(o.created_at)}
                </div>
                <div className="col-span-4 flex justify-end gap-2 sm:col-span-3">
                  <span className="font-mono text-[13px] font-semibold text-leaf">
                    {brl(Number(o.total))}
                  </span>
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
