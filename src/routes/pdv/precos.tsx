import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useStoreProducts } from "@/lib/queries";
import { brl } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/pdv/precos")({
  head: () => ({
    meta: [
      { title: "PDV · Preços — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Preço de venda dos produtos da loja, definido pela cooperativa.",
      },
      { property: "og:title", content: "PDV · Preços — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: PrecosPdv,
});

function PrecosPdv() {
  const { data: user } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const { data: storeProducts, isLoading } = useStoreProducts(storeId);

  const list = storeProducts ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Preços"
        title="Preços da Loja"
        description="Preço de venda dos produtos da sua loja. O valor vem da cooperativa de origem e é atualizado por ela."
      />

      {!storeId ? (
        <EmptyState
          title="Loja não vinculada ao seu perfil"
          description="Vincule sua loja para consultar os preços."
        />
      ) : (
        <Panel title="Produto × Preço" padded={false}>
          {isLoading ? (
            <div className="p-5">
              <LoadingRows rows={5} />
            </div>
          ) : list.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Catálogo ainda não configurado para esta loja"
                description="Sem produtos vinculados à loja ainda. A cooperativa ou o administrador precisa configurar o catálogo."
              />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {list.map((sp) => (
                <div key={sp.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3.5">
                  <div className="col-span-12 sm:col-span-6">
                    <div className="text-[13px]">{sp.products?.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {sp.cooperatives?.name ?? "Rede cooperativista"}
                    </div>
                  </div>
                  <div className="col-span-4 font-mono text-[13px] font-semibold text-leaf sm:col-span-3">
                    {brl(Number(sp.products?.price ?? 0))}
                  </div>
                  <div className="col-span-4 sm:col-span-3">
                    <Tag tone={sp.active ? "good" : "muted"}>
                      {sp.active ? "Disponível" : "Indisponível"}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      <p className="text-[11px] text-muted-foreground">
        O preço é definido pela cooperativa e não pode ser alterado no PDV nesta fase.
      </p>
    </>
  );
}
