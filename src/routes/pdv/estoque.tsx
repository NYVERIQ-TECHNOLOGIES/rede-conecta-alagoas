import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useInventory } from "@/lib/queries";
import { num } from "@/lib/format";
import {
  EmptyState,
  LoadingRows,
  PageHeader,
  Panel,
  StockTag,
  ValidityTag,
} from "@/components/kit";

export const Route = createFileRoute("/pdv/estoque")({
  head: () => ({
    meta: [
      { title: "PDV · Estoque — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Posição de estoque da loja por produto e lote.",
      },
      { property: "og:title", content: "PDV · Estoque — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: EstoquePdv,
});

function EstoquePdv() {
  const { data: user } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const { data: inventory, isLoading } = useInventory();

  const list = useMemo(
    () => (inventory ?? []).filter((i) => (storeId ? i.store_id === storeId : false)),
    [inventory, storeId],
  );

  const totalItens = list.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <>
      <PageHeader
        eyebrow="Estoque"
        title="Estoque da Loja"
        description="Posição de estoque por produto e lote, com alertas de nível. Somente leitura nesta fase."
      />

      {!storeId ? (
        <EmptyState
          title="Loja não vinculada ao seu perfil"
          description="Vincule sua loja para visualizar o estoque."
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="panel p-4">
              <div className="label-mono">Unidades</div>
              <div className="mt-2 font-display text-[24px] font-bold text-primary">
                {num(totalItens)}
              </div>
            </div>
            <div className="panel p-4">
              <div className="label-mono">Linhas / SKUs</div>
              <div className="mt-2 font-display text-[24px] font-bold text-primary">
                {num(list.length)}
              </div>
            </div>
            <div className="panel p-4">
              <div className="label-mono">Em alerta</div>
              <div className="mt-2 font-display text-[24px] font-bold text-clay">
                {num(list.filter((i) => i.quantity <= i.min_quantity).length)}
              </div>
            </div>
          </div>

          <Panel title={`Posição de estoque (${num(list.length)})`} padded={false}>
            {isLoading ? (
              <div className="p-5">
                <LoadingRows rows={6} />
              </div>
            ) : list.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="Sem itens em estoque"
                  description="A loja ainda não possui estoque registrado."
                />
              </div>
            ) : (
              <div className="divide-y divide-line">
                {list.map((i) => (
                  <div key={i.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                    <div className="col-span-12 sm:col-span-4">
                      <div className="text-[13px]">{i.products?.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {i.stores?.name} · {i.products?.cooperatives?.name}
                      </div>
                    </div>
                    <div className="col-span-4 font-mono text-[12px] text-muted-foreground sm:col-span-3">
                      lote {i.product_batches?.batch_code ?? "—"}
                    </div>
                    <div className="col-span-4 font-mono text-[13px] sm:col-span-1">
                      {num(i.quantity)} un
                    </div>
                    <div className="col-span-4 flex flex-wrap justify-end gap-2 sm:col-span-4">
                      <ValidityTag expiresAt={i.product_batches?.expires_at} />
                      <StockTag
                        quantity={i.quantity}
                        min={i.min_quantity}
                        critical={i.critical_quantity}
                      />
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
