import { createFileRoute, Link } from "@tanstack/react-router";
import { useProducts } from "@/lib/queries";
import { brl } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, ProductCard } from "@/components/kit";

export const Route = createFileRoute("/pdv/catalogo")({
  head: () => ({
    meta: [
      { title: "PDV · Catálogo — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Catálogo de produtos ativos da rede cooperativista.",
      },
      { property: "og:title", content: "PDV · Catálogo — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: CatalogoPdv,
});

function CatalogoPdv() {
  const { data: products, isLoading } = useProducts();

  const list = (products ?? []).filter((p) => p.status === "ativa");

  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Catálogo da Rede"
        description="Todos os produtos ativos comercializáveis. A ativação no balcão da loja é feita em Produtos disponíveis."
      />

      <Panel>
        <p className="text-[12px] text-muted-foreground">
          Para exibir um produto na sua loja, ative-o em{" "}
          <Link to="/pdv/produtos" className="font-medium text-leaf hover:text-leaf-2">
            Produtos disponíveis
          </Link>
          . O preço exibido é o cadastrado pela cooperativa de origem.
        </p>
      </Panel>

      {isLoading ? (
        <LoadingRows rows={6} />
      ) : list.length === 0 ? (
        <EmptyState
          title="Nenhum produto ativo no catálogo"
          description="Os produtos aparecem aqui quando a cooperativa os cadastra e ativa."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <ProductCard
              key={p.id}
              to="/pdv/produtos"
              product={{
                id: p.id,
                name: p.name,
                price: p.price,
                image_url: p.image_url,
                cooperatives: p.cooperatives,
                product_categories: p.product_categories,
              }}
              meta={<span className="text-[11px] text-muted-foreground">Ativar no balcão</span>}
            />
          ))}
        </div>
      )}

      <p className="text-center font-mono text-[11px] text-muted-foreground">
        {list.length} produtos ativos · {brl(list.reduce((acc, p) => acc + Number(p.price), 0))} em
        preços sugeridos
      </p>
    </>
  );
}
