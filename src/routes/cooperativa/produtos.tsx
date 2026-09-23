import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useCurrentUser } from "@/lib/session";
import { useDeleteProduct, useProducts } from "@/lib/queries";
import { num } from "@/lib/format";
import {
  EmptyState,
  LoadingRows,
  PageHeader,
  Panel,
  ProductCard,
  SearchInput,
  Tag,
} from "@/components/kit";

export const Route = createFileRoute("/cooperativa/produtos")({
  head: () => ({
    meta: [
      { title: "Meus Produtos — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Produtos da sua cooperativa na rede, com preço, categoria e status de ativação.",
      },
      { property: "og:title", content: "Meus Produtos — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: MeusProdutos,
});

function MeusProdutos() {
  const [q, setQ] = useState("");
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();

  const list = useMemo(
    () =>
      (products ?? [])
        .filter((p) => p.cooperative_id === coopId)
        .filter((p) => p.name.toLowerCase().includes(q.toLowerCase())),
    [products, q, coopId],
  );

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover o produto "${name}"?`)) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Produto removido");
    } catch {
      toast.error("Produto com estoque ou vendas não pode ser removido");
    }
  }

  if (isLoading) {
    return <LoadingRows rows={6} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para gerenciar produtos."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="🛍️ Produtos"
        title="Meus Produtos"
        description="O catálogo da sua cooperativa: cadastre, acompanhe o status e remova o que não produz mais."
        action={
          <SearchInput value={q} onChange={setQ} placeholder="Buscar produto…" className="w-56" />
        }
      />

      <Panel
        title={`Catálogo (${num(list.length)})`}
        subtitle="Apenas os produtos da sua cooperativa aparecem aqui"
      >
        {list.length === 0 ? (
          <EmptyState
            title="Nenhum produto cadastrado"
            description="Cadastre seu primeiro produto para começar a comercializar pela rede."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <ProductCard
                key={p.id}
                to="/cooperativa/produtos"
                product={{
                  id: p.id,
                  name: p.name,
                  price: Number(p.price),
                  image_url: p.image_url,
                  cooperatives: p.cooperatives ?? { name: "Minha cooperativa" },
                  product_categories: p.product_categories,
                }}
                meta={
                  <Tag
                    tone={p.status === "ativa" ? "good" : p.status === "pendente" ? "warn" : "crit"}
                  >
                    {p.status}
                  </Tag>
                }
                action={
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    aria-label={`Remover ${p.name}`}
                    className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[11px] text-muted-foreground hover:border-crit/40 hover:text-crit"
                  >
                    <Trash2 className="size-3.5" />
                    Excluir
                  </button>
                }
              />
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
