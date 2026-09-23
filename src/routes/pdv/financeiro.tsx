import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useOrdersByStore, useSales } from "@/lib/queries";
import { brl, dateTimeBR, num, periodRange, type PeriodKey } from "@/lib/format";
import {
  EmptyState,
  LoadingRows,
  MetricCard,
  PageHeader,
  Panel,
  PeriodFilter,
  Tag,
} from "@/components/kit";

export const Route = createFileRoute("/pdv/financeiro")({
  head: () => ({
    meta: [
      { title: "PDV · Valores — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Valores da loja: vendas do período, recebido no dia e pedidos em aberto.",
      },
      { property: "og:title", content: "PDV · Valores — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: FinanceiroPdv,
});

function FinanceiroPdv() {
  const { data: user } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const [period, setPeriod] = useState<PeriodKey>("mes");
  const range = periodRange(period);
  const { data: sales, isLoading } = useSales(range.start.toISOString());
  const { data: orders } = useOrdersByStore(storeId);

  const list = useMemo(
    () => (sales ?? []).filter((s) => (storeId ? s.store_id === storeId : false)),
    [sales, storeId],
  );

  const concluidas = list.filter((s) => s.status === "concluida");
  const totalPeriodo = concluidas.reduce((acc, s) => acc + Number(s.total), 0);

  const inicioHoje = periodRange("hoje").start.getTime();
  const recebidoHoje = concluidas
    .filter((s) => new Date(s.created_at).getTime() >= inicioHoje)
    .reduce((acc, s) => acc + Number(s.total), 0);

  const emPedidos = (orders ?? [])
    .filter((o) => o.status !== "cancelado" && o.status !== "concluido")
    .reduce((acc, o) => acc + Number(o.total), 0);

  return (
    <>
      <PageHeader
        eyebrow="Financeiro"
        title="Valores da Loja"
        description="Quanto a loja vendeu no período, quanto entrou hoje e o que ainda está em pedidos."
        action={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      {!storeId ? (
        <EmptyState
          title="Loja não vinculada ao seu perfil"
          description="Vincule sua loja para acompanhar os valores."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <MetricCard
              label="Total vendido"
              value={brl(totalPeriodo)}
              tone="leaf"
              hint={`${num(concluidas.length)} vendas no período`}
            />
            <MetricCard
              label="Recebido hoje"
              value={brl(recebidoHoje)}
              hint="vendas concluídas do dia"
            />
            <MetricCard
              label="Em pedidos"
              value={brl(emPedidos)}
              hint="não cancelados e não concluídos"
              tone="clay"
            />
          </div>

          <Panel title={`Vendas do período (${num(list.length)})`} padded={false}>
            {isLoading ? (
              <div className="p-5">
                <LoadingRows rows={6} />
              </div>
            ) : list.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Nenhuma venda no período" />
              </div>
            ) : (
              <div className="divide-y divide-line">
                {list.map((s) => (
                  <div key={s.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                    <div className="col-span-5 sm:col-span-4">
                      <div className="font-mono text-[12px] font-medium">
                        #{String(s.code).padStart(4, "0")}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {dateTimeBR(s.created_at)}
                      </div>
                    </div>
                    <div className="col-span-4 text-[12px] capitalize text-muted-foreground sm:col-span-3">
                      {s.payment_method}
                    </div>
                    <div className="col-span-3 text-right font-mono text-[13px] font-semibold text-leaf sm:col-span-3">
                      {brl(Number(s.total))}
                    </div>
                    <div className="col-span-12 flex justify-end sm:col-span-2">
                      <Tag tone={s.status === "concluida" ? "good" : "crit"}>{s.status}</Tag>
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
