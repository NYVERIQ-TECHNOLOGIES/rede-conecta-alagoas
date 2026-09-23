import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useInventory } from "@/lib/queries";
import { num } from "@/lib/format";
import {
  EmptyState,
  LoadingRows,
  MetricCard,
  PageHeader,
  Panel,
  StockTag,
  ValidityTag,
} from "@/components/kit";

export const Route = createFileRoute("/cooperativa/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque Sob Responsabilidade — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Posição do estoque dos seus produtos nas lojas da rede, por lote e validade.",
      },
      { property: "og:title", content: "Estoque Sob Responsabilidade — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Estoque,
});

function Estoque() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: inventory, isLoading } = useInventory();

  const rows = useMemo(
    () => (inventory ?? []).filter((i) => i.products?.cooperative_id === coopId),
    [inventory, coopId],
  );

  const totalQty = rows.reduce((a, i) => a + Number(i.quantity), 0);
  const alerts = rows.filter((i) => Number(i.quantity) <= Number(i.min_quantity)).length;

  if (isLoading) {
    return <LoadingRows rows={6} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para ver o estoque sob responsabilidade."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="📦 Estoque"
        title="Estoque sob Responsabilidade"
        description="Onde estão os seus produtos nas lojas da rede, com quantidade, lote e validade."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard label="Itens em estoque" value={num(totalQty)} tone="leaf" />
        <MetricCard label="Linhas de estoque" value={num(rows.length)} />
        <MetricCard label="Alertas (baixo/crítico)" value={num(alerts)} tone="clay" />
      </div>

      <Panel title="Posição de estoque" padded={false}>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Seus produtos ainda não têm estoque"
              description="Quando as lojas receberem seus produtos, as posições aparecem aqui."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {rows.map((i) => (
              <div
                key={i.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px]">{i.products?.name}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {i.stores?.name} · lote {i.product_batches?.batch_code ?? "sem lote"}
                  </div>
                </div>
                <StockTag
                  quantity={Number(i.quantity)}
                  min={Number(i.min_quantity)}
                  critical={Number(i.critical_quantity)}
                />
                <ValidityTag expiresAt={i.product_batches?.expires_at ?? null} />
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
