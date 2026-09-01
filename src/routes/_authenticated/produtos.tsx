import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCategories, useInventory, useProducts } from "@/lib/queries";
import { brl, num } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Tag } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos da Rede — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content:
          "Catálogo dos produtos cooperativistas de Alagoas com origem, preço e disponibilidade.",
      },
      { property: "og:title", content: "Produtos da Rede — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Cada produto carrega o nome de quem o produziu." },
    ],
  }),
  component: Produtos,
});

function Produtos() {
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts();
  const { data: inventory } = useInventory();

  const list = (products ?? [])
    .filter((p) => (cat ? p.category_id === cat : true))
    .filter((p) => `${p.name} ${p.cooperatives?.name}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        eyebrow="🛍️ Catálogo"
        title="Produtos da Rede"
        description="Todo produto exibe sua origem: cooperativa, município e história."
        action={
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar produto ou cooperativa"
            className="w-64 rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf"
          />
        }
      />

      <div className="flex flex-wrap gap-1.5 font-mono text-[12px]">
        <button
          onClick={() => setCat(null)}
          className={cn(
            "rounded-md px-3 py-1.5",
            cat === null ? "bg-leaf text-primary-foreground" : "border border-line text-muted-foreground",
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
              cat === c.id ? "bg-leaf text-primary-foreground" : "border border-line text-muted-foreground",
            )}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingRows rows={6} />
      ) : list.length === 0 ? (
        <EmptyState title="Nenhum produto encontrado" description="Ajuste a busca ou a categoria." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => {
            const stock = (inventory ?? [])
              .filter((i) => i.product_id === p.id)
              .reduce((a, i) => a + i.quantity, 0);
            return (
              <article key={p.id} className="panel rise flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] text-muted-foreground">
                      {p.product_categories?.emoji} {p.product_categories?.name}
                    </div>
                    <h2 className="mt-1 text-[17px] leading-tight font-semibold">{p.name}</h2>
                  </div>
                  <Tag tone={stock > 0 ? "good" : "crit"}>{num(stock)} un</Tag>
                </div>
                <p className="mt-2 line-clamp-2 text-[12px] text-muted-foreground">
                  {p.description}
                </p>
                <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
                  <Link
                    to="/cooperativas/$id"
                    params={{ id: p.cooperative_id }}
                    className="text-[12px] text-leaf hover:text-leaf-2"
                  >
                    🤝 {p.cooperatives?.name}
                    <span className="block text-[11px] text-muted-foreground">
                      📍 {p.cooperatives?.city}
                    </span>
                  </Link>
                  <span className="font-mono text-[18px] font-semibold">{brl(Number(p.price))}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
