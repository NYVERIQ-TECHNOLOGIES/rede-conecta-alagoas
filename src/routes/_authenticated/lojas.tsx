import { createFileRoute, Link } from "@tanstack/react-router";
import { useStores, useInventory, useSales } from "@/lib/queries";
import { brl, num } from "@/lib/format";
import { LoadingRows, PageHeader, Panel, StatusDot } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/lojas")({
  head: () => ({
    meta: [
      { title: "Nossas Lojas — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Lojas da rede em Maceió, Arapiraca e Piaçabuçu: vendas, estoque e responsáveis.",
      },
      { property: "og:title", content: "Nossas Lojas — ALAGOAS+COOPERATIVA" },
      {
        property: "og:description",
        content: "Pontos de comercialização da rede cooperativista alagoana.",
      },
    ],
  }),
  component: Lojas,
});

function Lojas() {
  const { data: stores, isLoading } = useStores();
  const { data: inventory } = useInventory();
  const { data: sales } = useSales();

  return (
    <>
      <PageHeader
        eyebrow="📍 Nossas Lojas"
        title="Lojas da Rede"
        description="Cada loja é uma vitrine da produção cooperativista alagoana."
      />
      {isLoading ? (
        <LoadingRows />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(stores ?? []).map((store) => {
            const stock = (inventory ?? [])
              .filter((i) => i.store_id === store.id)
              .reduce((a, i) => a + i.quantity, 0);
            const total = (sales ?? [])
              .filter((s) => s.store_id === store.id)
              .reduce((a, s) => a + Number(s.total), 0);
            return (
              <Link
                key={store.id}
                to="/lojas/$id"
                params={{ id: store.id }}
                className="panel rise p-5 transition-colors hover:border-leaf/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-[18px] font-semibold">{store.name}</h2>
                    <p className="font-mono text-[11px] text-muted-foreground">{store.address}</p>
                  </div>
                  <StatusDot status={store.status} />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <dt className="label-mono">Vendas</dt>
                    <dd className="mt-1 font-mono text-[16px] text-leaf">{brl(total)}</dd>
                  </div>
                  <div>
                    <dt className="label-mono">Estoque</dt>
                    <dd className="mt-1 font-mono text-[16px]">{num(stock)}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-[12px] text-muted-foreground">
                  Responsável: {store.manager_name ?? "—"} · {store.opening_hours ?? "—"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
      <Panel title="Expansão" subtitle="A arquitetura permite novas lojas sem alterar o sistema.">
        <p className="text-[13px] text-muted-foreground">
          Novas unidades podem ser cadastradas em Configurações. A unidade de Piaçabuçu está
          preparada para análises ligadas ao fluxo de moradores e turistas do Rio São Francisco.
        </p>
      </Panel>
    </>
  );
}
