import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useTransfers } from "@/lib/queries";
import { dateTimeBR, num } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/pdv/movimentacoes")({
  head: () => ({
    meta: [
      { title: "PDV · Movimentações — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Transferências de estoque em que a loja é origem ou destino.",
      },
      { property: "og:title", content: "PDV · Movimentações — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: MovimentacoesPdv,
});

function MovimentacoesPdv() {
  const { data: user } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const { data: transfers, isLoading } = useTransfers();

  const list = useMemo(
    () =>
      (transfers ?? []).filter((t) =>
        storeId ? t.from_store_id === storeId || t.to_store_id === storeId : false,
      ),
    [transfers, storeId],
  );

  return (
    <>
      <PageHeader
        eyebrow="Movimentações"
        title="Entre Lojas"
        description="Transferências de estoque em que a sua loja é origem ou destino."
      />

      {!storeId ? (
        <EmptyState
          title="Loja não vinculada ao seu perfil"
          description="Vincule sua loja para acompanhar as movimentações."
        />
      ) : (
        <Panel title={`Movimentações (${num(list.length)})`} padded={false}>
          {isLoading ? (
            <div className="p-5">
              <LoadingRows rows={5} />
            </div>
          ) : list.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Nenhuma movimentação"
                description="Transferências envolvendo a sua loja aparecem aqui."
              />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {list.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-[13px]">{t.products?.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {t.from?.name} → {t.to?.name} · {num(t.quantity)} un
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {dateTimeBR(t.created_at)}
                    </div>
                  </div>
                  <Tag
                    tone={
                      t.status === "recebida" ? "good" : t.status === "cancelada" ? "crit" : "warn"
                    }
                  >
                    {t.status}
                  </Tag>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </>
  );
}
