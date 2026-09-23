import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useProducts, useStores, useStoresWithProduct } from "@/lib/queries";
import { num } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/cooperativa/pdvs")({
  head: () => ({
    meta: [
      { title: "PDVs — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Lojas da rede e presença dos seus produtos nos pontos de venda.",
      },
      { property: "og:title", content: "PDVs — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: PDVs,
});

function AvailabilityRow({ productId, productName }: { productId: string; productName: string }) {
  const { data, isLoading } = useStoresWithProduct(productId, true);
  const rows = data ?? [];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
      <div className="min-w-0">
        <div className="truncate text-[13px] font-medium">{productName}</div>
        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
          {isLoading
            ? "Consultando lojas…"
            : rows.length === 0
              ? "Não disponível em nenhuma loja"
              : rows
                  .map((r) => r.stores?.name)
                  .filter(Boolean)
                  .join(" · ")}
        </div>
      </div>
      <Tag tone={rows.length > 0 ? "good" : "muted"}>
        {num(rows.length)} PDV{rows.length === 1 ? "" : "s"}
      </Tag>
    </div>
  );
}

function PDVs() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: stores, isLoading } = useStores();
  const { data: products } = useProducts();

  const activeProducts = useMemo(
    () =>
      (products ?? [])
        .filter((p) => p.cooperative_id === coopId && p.status === "ativa")
        .slice(0, 24),
    [products, coopId],
  );

  if (isLoading) {
    return <LoadingRows rows={5} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para acompanhar os PDVs."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="🏪 Comercialização"
        title="PDVs Atendidos"
        description="Os pontos de venda da rede e a presença dos seus produtos em cada loja."
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel title="PDVs da rede" className="lg:col-span-1" padded={false}>
          <div className="divide-y divide-line">
            {(stores ?? []).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="truncate text-[13px]">{s.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{s.city}</div>
                </div>
                <Tag
                  tone={s.status === "ativa" ? "good" : s.status === "pendente" ? "warn" : "crit"}
                >
                  {s.status}
                </Tag>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Seus produtos nos PDVs"
          subtitle="Quantos pontos de venda ativos carregam cada produto"
          className="lg:col-span-2"
          padded={false}
        >
          {activeProducts.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Nenhum produto ativo"
                description="Ative produtos para vê-los nos pontos de venda da rede."
              />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {activeProducts.map((p) => (
                <AvailabilityRow key={p.id} productId={p.id} productName={p.name} />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
