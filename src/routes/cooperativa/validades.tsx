import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useInventory } from "@/lib/queries";
import { dateBR, daysUntil, num } from "@/lib/format";
import {
  EmptyState,
  LoadingRows,
  MetricCard,
  PageHeader,
  Panel,
  ValidityTag,
} from "@/components/kit";

export const Route = createFileRoute("/cooperativa/validades")({
  head: () => ({
    meta: [
      { title: "Validades dos Seus Produtos — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Lotes e vencimentos dos produtos da sua cooperativa nas lojas da rede.",
      },
      { property: "og:title", content: "Validades dos Seus Produtos — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Validades,
});

function Validades() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: inventory, isLoading } = useInventory();

  const rows = useMemo(
    () =>
      (inventory ?? [])
        .filter(
          (i) =>
            i.products?.cooperative_id === coopId &&
            i.product_batches?.expires_at != null &&
            Number(i.quantity) > 0,
        )
        .map((i) => ({ ...i, days: daysUntil(i.product_batches?.expires_at ?? null) ?? 0 }))
        .sort((a, b) => a.days - b.days),
    [inventory, coopId],
  );

  const expired = rows.filter((r) => r.days < 0).length;
  const urgent = rows.filter((r) => r.days >= 0 && r.days <= 15).length;

  if (isLoading) {
    return <LoadingRows rows={5} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para acompanhar validades."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="⚠️ Estoque"
        title="Validades dos Seus Produtos"
        description="Lotes com data de validade cadastrada. Antecipe ações para não perder produção."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard label="Lotes monitorados" value={num(rows.length)} />
        <MetricCard label="Vencidos" value={num(expired)} tone="clay" />
        <MetricCard label="Vencem em até 15 dias" value={num(urgent)} tone="leaf" />
      </div>

      <Panel title="Lotes com validade" padded={false}>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Nenhum lote com validade no momento"
              description="Lotes de produtos sem validade cadastrada não aparecem aqui."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium">{r.products?.name}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {r.stores?.name} · lote {r.product_batches?.batch_code ?? "—"} ·{" "}
                    {dateBR(r.product_batches?.expires_at)}
                  </div>
                </div>
                <span className="font-mono text-[12px] text-muted-foreground">
                  {num(r.quantity)} un
                </span>
                <ValidityTag expiresAt={r.product_batches?.expires_at ?? null} />
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
