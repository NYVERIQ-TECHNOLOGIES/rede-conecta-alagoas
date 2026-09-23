import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useProducts, useTransfers } from "@/lib/queries";
import { dateTimeBR, num } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/cooperativa/movimentacoes")({
  head: () => ({
    meta: [
      { title: "Movimentações — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Transferências de estoque dos seus produtos entre as lojas da rede.",
      },
      { property: "og:title", content: "Movimentações — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Movimentacoes,
});

function Movimentacoes() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: products } = useProducts();
  const { data: transfers, isLoading } = useTransfers();

  const myProductIds = useMemo(
    () => new Set((products ?? []).filter((p) => p.cooperative_id === coopId).map((p) => p.id)),
    [products, coopId],
  );

  const rows = useMemo(
    () => (transfers ?? []).filter((t) => myProductIds.has(t.product_id)),
    [transfers, myProductIds],
  );

  if (isLoading) {
    return <LoadingRows rows={5} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para acompanhar as movimentações."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="🔄 Estoque"
        title="Movimentações dos Seus Produtos"
        description="Transferências de estoque entre lojas que envolvem produtos da sua cooperativa."
      />

      <Panel title="Transferências (entre lojas)" padded={false}>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Nenhuma movimentação registrada"
              description="Quando lojas trocarem estoque dos seus produtos, aparece aqui."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {rows.slice(0, 60).map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium">{t.products?.name}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {t.from?.name ?? "—"} → {t.to?.name ?? "—"} · {num(t.quantity)} un ·{" "}
                    {dateTimeBR(t.created_at)}
                  </div>
                </div>
                <Tag
                  tone={
                    t.status === "recebida"
                      ? "good"
                      : t.status === "cancelada"
                        ? "crit"
                        : t.status === "solicitada"
                          ? "warn"
                          : "muted"
                  }
                >
                  {t.status}
                </Tag>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
