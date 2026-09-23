import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCategories, useProducts } from "@/lib/queries";
import { brl } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Tag } from "@/components/kit";

export const Route = createFileRoute("/cliente/categorias/$slug")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Categoria — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Produtos de uma categoria da rede cooperativista." },
    ],
  }),
  component: Categoria,
});

type ProductView = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  unit: string;
  status: string;
  category_id: string | null;
  cooperatives?: { name: string; city: string; region: string | null } | null;
  product_categories?: { name: string; emoji: string | null } | null;
};

function ProductTile({ p }: { p: ProductView }) {
  return (
    <div className="panel group rise flex flex-col overflow-hidden p-4 transition-colors hover:border-leaf/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to="/cliente/produto/$id"
            params={{ id: p.id }}
            className="block text-[15px] leading-snug font-medium hover:text-leaf"
          >
            {p.name}
          </Link>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {p.cooperatives?.name ?? "Rede cooperativista"}
          </div>
        </div>
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            className="size-12 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="grid size-12 shrink-0 place-items-center rounded-md border border-line bg-panel-2 text-base">
            {p.product_categories?.emoji ?? "🛍️"}
          </div>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <div className="font-mono text-[17px] font-semibold text-leaf">{brl(Number(p.price))}</div>
        <Tag tone="muted">{p.unit}</Tag>
      </div>
    </div>
  );
}

function Categoria() {
  const { slug } = Route.useParams();
  const { data: categories, isLoading: loadingCats } = useCategories();
  const { data: products, isLoading: loadingProducts } = useProducts();

  const categoria = (categories ?? []).find((c) => c.slug === slug);

  const rows = useMemo(
    () =>
      ((products ?? []) as ProductView[]).filter(
        (p) => p.status === "ativa" && categoria !== undefined && p.category_id === categoria.id,
      ),
    [products, categoria],
  );

  if (loadingCats || loadingProducts) return <LoadingRows rows={8} />;

  if (!categoria) {
    return (
      <EmptyState
        title="Categoria não encontrada"
        description="Use o início do catálogo para navegar pelas categorias disponíveis."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`${categoria.emoji ?? "🏷️"} Categoria`}
        title={categoria.name}
        description={`${rows.length} produto(s) ativo(s) nesta categoria.`}
      />
      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Nenhum produto nesta categoria"
            description="Os produtos aparecem aqui assim que forem ativados."
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <ProductTile key={p.id} p={p} />
          ))}
        </div>
      )}
    </>
  );
}
