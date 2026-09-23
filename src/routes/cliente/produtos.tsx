import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCategories, useProducts } from "@/lib/queries";
import { brl } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Tag } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cliente/produtos")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { q?: string } => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Produtos — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Catálogo de produtos das cooperativas da rede Alagoas+Cooperativa.",
      },
      { property: "og:title", content: "Produtos — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Produtos,
});

type ProductView = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  unit: string;
  status: string;
  category_id: string | null;
  description: string | null;
  origin: string | null;
  cooperatives?: { name: string; city: string; region: string | null } | null;
  product_categories?: { name: string; emoji: string | null } | null;
};

type SortKey = "nome" | "preco_asc" | "preco_desc";

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

function Produtos() {
  const { q } = Route.useSearch();
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("nome");

  const list = useMemo(() => {
    const needle = (q ?? "").trim().toLowerCase();
    const filtered = ((products ?? []) as ProductView[]).filter(
      (p) =>
        p.status === "ativa" &&
        (cat === null || p.category_id === cat) &&
        (needle === "" ||
          `${p.name} ${p.description ?? ""} ${p.origin ?? ""}`.toLowerCase().includes(needle)),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "preco_asc") return Number(a.price) - Number(b.price);
      if (sort === "preco_desc") return Number(b.price) - Number(a.price);
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [products, cat, q, sort]);

  return (
    <>
      <PageHeader
        eyebrow="🛍️ Catálogo da rede"
        title="Produtos"
        description={`${q ? `Resultados para “${q}” · ` : ""}Produtos ativos das cooperativas parceiras.`}
        action={
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf"
          >
            <option value="nome">Nome (A–Z)</option>
            <option value="preco_asc">Menor preço</option>
            <option value="preco_desc">Maior preço</option>
          </select>
        }
      />

      <div className="flex flex-wrap gap-1.5 font-mono text-[12px]">
        <button
          onClick={() => setCat(null)}
          className={cn(
            "rounded-md px-3 py-1.5",
            cat === null
              ? "bg-leaf text-primary-foreground"
              : "border border-line text-muted-foreground hover:text-foreground",
          )}
        >
          Todos
        </button>
        {(categories ?? []).map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={cn(
              "rounded-md px-3 py-1.5",
              cat === c.id
                ? "bg-leaf text-primary-foreground"
                : "border border-line text-muted-foreground hover:text-foreground",
            )}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <LoadingRows rows={6} />
        </div>
      ) : list.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Nenhum produto encontrado"
            description={
              q
                ? "Tente outra busca ou remova os filtros."
                : "Ainda não há produtos ativos neste catálogo."
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProductTile key={p.id} p={p} />
          ))}
        </div>
      )}
    </>
  );
}
