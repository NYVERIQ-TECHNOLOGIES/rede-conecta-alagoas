import { createFileRoute, Link } from "@tanstack/react-router";
import { useInventory, useSales, useStores } from "@/lib/queries";
import { brl, dateTimeBR, num } from "@/lib/format";
import { EmptyState, PageHeader, Panel, StatCard, Tag } from "@/components/kit";

export const Route = createFileRoute("/admin/lojas/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe da Loja — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Vendas, estoque e movimentações de uma loja da rede cooperativista alagoana.",
      },
      { property: "og:title", content: "Detalhe da Loja — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Painel operacional da loja na rede cooperativista." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LojaDetalhe,
});

function LojaDetalhe() {
  const { id } = Route.useParams();
  const { data: stores } = useStores();
  const { data: inventory } = useInventory();
  const { data: sales } = useSales();

  const store = (stores ?? []).find((s) => s.id === id);
  const stock = (inventory ?? []).filter((i) => i.store_id === id);
  const storeSales = (sales ?? []).filter((s) => s.store_id === id);
  const total = storeSales.reduce((a, s) => a + Number(s.total), 0);

  return (
    <>
      <PageHeader
        eyebrow="🏪 Loja"
        title={store?.name ?? "Loja"}
        description={`${store?.address ?? ""} · ${store?.city ?? ""}`}
        action={
          <Link to="/admin/lojas" className="font-mono text-[12px] text-leaf">
            ← Todas as lojas
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Vendas" value={brl(total)} tone="leaf" />
        <StatCard label="Nº de vendas" value={num(storeSales.length)} />
        <StatCard label="Itens em estoque" value={num(stock.reduce((a, i) => a + i.quantity, 0))} />
        <StatCard
          label="Responsável"
          value={<span className="text-[16px] font-sans">{store?.manager_name ?? "—"}</span>}
        />
      </div>

      <Panel title="Estoque da loja" padded={false}>
        {stock.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Sem itens em estoque" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {stock.map((i) => (
              <div key={i.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-[13px]">{i.products?.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {i.products?.cooperatives?.name}
                  </div>
                </div>
                <Tag
                  tone={
                    i.quantity <= i.critical_quantity
                      ? "crit"
                      : i.quantity <= i.min_quantity
                        ? "warn"
                        : "good"
                  }
                >
                  {num(i.quantity)} un
                </Tag>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Últimas vendas" padded={false}>
        {storeSales.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nenhuma venda registrada" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {storeSales.slice(0, 12).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-5 py-3 font-mono text-[12px]"
              >
                <span className="text-muted-foreground">{dateTimeBR(s.created_at)}</span>
                <span>{s.payment_method}</span>
                <span className="text-leaf">{brl(Number(s.total))}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
