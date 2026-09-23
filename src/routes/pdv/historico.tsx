import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useOrdersByStore } from "@/lib/queries";
import { brl, dateTimeBR, num, periodRange, type PeriodKey } from "@/lib/format";
import {
  EmptyState,
  LoadingRows,
  OrderStatusTag,
  PageHeader,
  Panel,
  PeriodFilter,
} from "@/components/kit";

export const Route = createFileRoute("/pdv/historico")({
  head: () => ({
    meta: [
      { title: "PDV · Histórico de Pedidos — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Histórico dos pedidos da loja nos últimos dias.",
      },
      { property: "og:title", content: "PDV · Histórico de Pedidos — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: HistoricoPdv,
});

function HistoricoPdv() {
  const { data: user } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const { data: orders, isLoading } = useOrdersByStore(storeId);

  const list = useMemo(() => {
    const range = periodRange(period);
    return (orders ?? []).filter((o) => new Date(o.created_at) >= range.start);
  }, [orders, period]);

  const total = list
    .filter((o) => o.status !== "cancelado")
    .reduce((acc, o) => acc + Number(o.total), 0);

  return (
    <>
      <PageHeader
        eyebrow="Histórico"
        title="Histórico de Pedidos"
        description="Pedidos da loja no período selecionado, para consulta rápida."
        action={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      {!storeId ? (
        <EmptyState
          title="Loja não vinculada ao seu perfil"
          description="Vincule sua loja para consultar o histórico."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
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
              <div className="label-mono">Cancelados</div>
              <div className="mt-2 font-display text-[24px] font-bold text-clay">
                {num(list.filter((o) => o.status === "cancelado").length)}
              </div>
            </div>
          </div>

          <Panel title="Pedidos do período" padded={false}>
            {isLoading ? (
              <div className="p-5">
                <LoadingRows rows={6} />
              </div>
            ) : list.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Nenhum pedido no período" />
              </div>
            ) : (
              <div className="divide-y divide-line">
                {list.map((o) => (
                  <div key={o.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                    <div className="col-span-4 sm:col-span-3">
                      <div className="font-mono text-[12px] font-medium">
                        #{String(o.code).padStart(4, "0")}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {dateTimeBR(o.created_at)}
                      </div>
                    </div>
                    <div className="col-span-4 text-[13px] sm:col-span-3">
                      {o.customers?.full_name ?? "Cliente"}
                    </div>
                    <div className="col-span-2 hidden font-mono text-[11px] capitalize text-muted-foreground sm:col-span-2 sm:block">
                      {o.delivery_type}
                    </div>
                    <div className="col-span-2 flex justify-end font-mono text-[13px] font-semibold text-leaf sm:col-span-2">
                      {brl(Number(o.total))}
                    </div>
                    <div className="col-span-12 flex justify-end sm:col-span-2">
                      <OrderStatusTag status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}
    </>
  );
}
