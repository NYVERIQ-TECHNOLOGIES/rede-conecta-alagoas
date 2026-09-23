import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useSales } from "@/lib/queries";
import { brl, dateTimeBR, num } from "@/lib/format";
import { EmptyState, LoadingRows, MetricCard, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/pdv/historico-financeiro")({
  head: () => ({
    meta: [
      { title: "PDV · Histórico financeiro — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Últimas vendas da loja com subtotal e média diária.",
      },
      { property: "og:title", content: "PDV · Histórico financeiro — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: HistoricoFinanceiro,
});

function HistoricoFinanceiro() {
  const { data: user } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const { data: sales, isLoading } = useSales();

  const list = useMemo(
    () => (sales ?? []).filter((s) => (storeId ? s.store_id === storeId : false)).slice(0, 50),
    [sales, storeId],
  );

  const subtotal = list.reduce((acc, s) => acc + Number(s.total), 0);
  const dias = new Set(list.map((s) => s.created_at.slice(0, 10))).size;
  const media = dias ? subtotal / dias : 0;

  return (
    <>
      <PageHeader
        eyebrow="Histórico financeiro"
        title="Últimas Vendas"
        description="As 50 vendas mais recentes da loja, com subtotal e média diária."
      />

      {!storeId ? (
        <EmptyState
          title="Loja não vinculada ao seu perfil"
          description="Vincule sua loja para consultar o histórico."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <MetricCard
              label="Subtotal"
              value={brl(subtotal)}
              tone="leaf"
              hint={`${num(list.length)} vendas`}
            />
            <MetricCard label="Média diária" value={brl(media)} hint={`em ${num(dias)} dias`} />
            <MetricCard
              label="Maior venda"
              value={brl(Math.max(0, ...list.map((s) => Number(s.total))))}
            />
          </div>

          <Panel title="Vendas recentes" padded={false}>
            {isLoading ? (
              <div className="p-5">
                <LoadingRows rows={6} />
              </div>
            ) : list.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Nenhuma venda registrada" />
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
                    <div className="col-span-4 text-[12px] capitalize text-muted-foreground sm:col-span-4">
                      {s.payment_method}
                    </div>
                    <div className="col-span-3 text-right font-mono text-[13px] font-semibold text-leaf sm:col-span-3">
                      {brl(Number(s.total))}
                    </div>
                    <div className="col-span-12 flex justify-end sm:col-span-1">
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
