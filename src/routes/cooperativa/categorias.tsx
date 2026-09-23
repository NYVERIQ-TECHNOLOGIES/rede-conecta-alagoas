import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useCategories, useProducts } from "@/lib/queries";
import { num } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/cooperativa/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Como seus produtos se distribuem pelas categorias da rede.",
      },
      { property: "og:title", content: "Categorias — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Categorias,
});

function Categorias() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: categories, isLoading } = useCategories();
  const { data: products } = useProducts();

  const myProducts = useMemo(
    () => (products ?? []).filter((p) => p.cooperative_id === coopId),
    [products, coopId],
  );

  const groups = useMemo(() => {
    const byCategory = new Map<string, typeof myProducts>();
    const uncategorized: typeof myProducts = [];
    myProducts.forEach((p) => {
      if (p.category_id) {
        byCategory.set(p.category_id, [...(byCategory.get(p.category_id) ?? []), p]);
      } else {
        uncategorized.push(p);
      }
    });
    const list = (categories ?? []).map((c) => ({
      category: c,
      items: byCategory.get(c.id) ?? [],
    }));
    if (uncategorized.length > 0) {
      list.push({ category: null, items: uncategorized });
    }
    return list.filter((g) => g.items.length > 0);
  }, [myProducts, categories]);

  if (isLoading) {
    return <LoadingRows rows={5} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para ver suas categorias."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="🏷️ Produtos"
        title="Categorias"
        description="A distribuição dos seus produtos pelas categorias da rede, com contagem por grupo."
      />

      {groups.length === 0 ? (
        <Panel>
          <EmptyState
            title="Sem produtos categorizados"
            description="Cadastre produtos e escolha categorias para organizar seu catálogo."
          />
        </Panel>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) =>
            g.category ? (
              <div key={g.category.id} className="panel rise p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid size-14 place-items-center rounded-md border border-line bg-panel-2 text-3xl">
                    {g.category.emoji ?? "🏷️"}
                  </div>
                  <Tag tone="leaf">{num(g.items.length)}</Tag>
                </div>
                <h2 className="mt-3 text-[16px] font-semibold">{g.category.name}</h2>
                <ul className="mt-3 space-y-1.5 border-t border-line pt-3 text-[13px] text-muted-foreground">
                  {g.items.map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div key="sem-categoria" className="panel rise p-5">
                <div className="grid size-14 place-items-center rounded-md border border-line bg-panel-2 text-3xl">
                  ?
                </div>
                <Tag tone="muted">{num(g.items.length)}</Tag>
                <h2 className="mt-3 text-[16px] font-semibold">Sem categoria</h2>
                <ul className="mt-3 space-y-1.5 border-t border-line pt-3 text-[13px] text-muted-foreground">
                  {g.items.map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
      )}
    </>
  );
}
