import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useSales } from "@/lib/queries";
import { brl, dateTimeBR, num } from "@/lib/format";
import { EmptyState, LoadingRows, MetricCard, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/cooperativa/vendas")({
  head: () => ({
    meta: [
      { title: "Vendas dos Seus Produtos — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Vendas registradas na rede que contêm produtos da sua cooperativa.",
      },
      { property: "og:title", content: "Vendas dos Seus Produtos — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Vendas,
});

function Vendas() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: sales, isLoading } = useSales();

  const rows = useMemo(
    () =>
      (sales ?? [])
        .filter((s) => s.status !== "cancelada")
        .map((s) => {
          const items = (s.sale_items ?? []).filter((i) => i.cooperative_id === coopId);
          return { sale: s, items, myTotal: items.reduce((a, i) => a + Number(i.total), 0) };
        })
        .filter((r) => r.items.length > 0),
    [sales, coopId],
  );

  const total = rows.reduce((a, r) => a + r.myTotal, 0);
  const qty = rows.reduce((a, r) => a + r.items.reduce((x, i) => x + Number(i.quantity), 0), 0);

  if (isLoading) {
    return <LoadingRows rows={7} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para ver suas vendas."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="🧾 Comercialização"
        title="Vendas dos Seus Produtos"
        description="Cada venda abaixo contém ao menos um item produzido pela sua cooperativa. Os totais somam apenas os seus itens."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard label="Valor dos seus itens" value={brl(total)} tone="leaf" />
        <MetricCard label="Vendas com seus produtos" value={num(rows.length)} />
        <MetricCard label="Unidades vendidas" value={num(qty)} />
      </div>

      <Panel title={`Vendas (${num(rows.length)})`} padded={false}>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Nenhuma venda registrada"
              description="Assim que os PDVs venderem seus produtos, elas aparecem aqui."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 font-mono text-[10px] text-muted-foreground">
              <span className="col-span-3 sm:col-span-2">Código</span>
              <span className="col-span-4 sm:col-span-3">Loja</span>
              <span className="hidden sm:col-span-3 sm:block">Data</span>
              <span className="col-span-2 sm:col-span-2 text-right">Seus itens</span>
              <span className="col-span-3 text-right sm:col-span-2">Método</span>
            </div>
            {rows.slice(0, 80).map(({ sale: s, items, myTotal }) => (
              <div key={s.id} className="grid grid-cols-12 items-center gap-2 px-5 py-3">
                <div className="col-span-3 font-mono text-[12px] sm:col-span-2">
                  #{String(s.code)}
                </div>
                <div className="col-span-4 truncate text-[13px] sm:col-span-3">
                  {s.stores?.name ?? "—"}
                </div>
                <div className="hidden font-mono text-[11px] text-muted-foreground sm:col-span-3 sm:block">
                  {dateTimeBR(s.created_at)}
                </div>
                <div className="col-span-2 text-right font-mono text-[13px] font-semibold text-leaf sm:col-span-2">
                  {brl(myTotal)}
                </div>
                <div className="col-span-3 flex justify-end sm:col-span-2">
                  <Tag tone="muted">{s.payment_method}</Tag>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
