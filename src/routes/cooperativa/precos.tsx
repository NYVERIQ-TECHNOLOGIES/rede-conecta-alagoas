import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useProducts } from "@/lib/queries";
import { brl, num } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/cooperativa/precos")({
  head: () => ({
    meta: [
      { title: "Preços e Custos — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Preço de venda, custo de produção e margem dos seus produtos na rede.",
      },
      { property: "og:title", content: "Preços e Custos — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Precos,
});

function Precos() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: products, isLoading } = useProducts();

  const list = useMemo(
    () =>
      (products ?? [])
        .filter((p) => p.cooperative_id === coopId)
        .map((p) => {
          const price = Number(p.price);
          const cost = Number(p.cost ?? 0);
          const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
          return { product: p, price, cost, margin };
        }),
    [products, coopId],
  );

  if (isLoading) {
    return <LoadingRows rows={6} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para ver seus preços."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="💲 Produtos"
        title="Preços, Custos e Margem"
        description="Leitura transparente de preços e custos cadastrados. Para alterar valores, procure a administração da rede."
      />

      <Panel
        title={`Preços (${num(list.length)})`}
        subtitle="Custo de produção registrado e margem calculada sobre o preço de venda"
        padded={false}
      >
        {list.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nenhum produto cadastrado" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 font-mono text-[10px] text-muted-foreground">
              <span className="col-span-4 sm:col-span-5">Produto</span>
              <span className="col-span-2 sm:col-span-2 text-right">Preço</span>
              <span className="col-span-2 sm:col-span-2 text-right">Custo</span>
              <span className="col-span-2 sm:col-span-2 text-right">Margem</span>
              <span className="col-span-2 sm:col-span-1 text-right">Status</span>
            </div>
            {list.map(({ product: p, price, cost, margin }) => (
              <div key={p.id} className="grid grid-cols-12 items-center gap-2 px-5 py-3">
                <div className="col-span-4 sm:col-span-5">
                  <div className="truncate text-[13px]">{p.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {p.product_categories?.emoji} {p.product_categories?.name ?? "Sem categoria"} ·{" "}
                    {p.unit}
                  </div>
                </div>
                <div className="col-span-2 text-right font-mono text-[13px] text-leaf sm:col-span-2">
                  {brl(price)}
                </div>
                <div className="col-span-2 text-right font-mono text-[12px] text-muted-foreground sm:col-span-2">
                  {brl(cost)}
                </div>
                <div className="col-span-2 text-right sm:col-span-2">
                  <Tag tone={margin >= 0 ? "good" : "crit"}>
                    {margin.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                  </Tag>
                </div>
                <div className="col-span-2 text-right sm:col-span-1">
                  <Tag
                    tone={p.status === "ativa" ? "leaf" : p.status === "pendente" ? "warn" : "crit"}
                  >
                    {p.status}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="panel rise border-leaf/25 bg-leaf/5 p-4 text-[12px] text-muted-foreground">
        Os preços e custos são cadastrados pela administração da rede. Se precisar atualizar algo,
        entre em contato com o responsável da rede.
      </div>
    </>
  );
}
