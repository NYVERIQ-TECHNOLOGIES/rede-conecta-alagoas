import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2, Plus, X } from "lucide-react";
import {
  useCategories,
  useCooperatives,
  useCreateProduct,
  useDeleteProduct,
  useInventory,
  useProducts,
} from "@/lib/queries";
import { useCurrentUser } from "@/lib/session";
import { brl, num } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, Tag } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/produtos")({
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Produtos,
});

const inputCls =
  "w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf";

function Produtos() {
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(false);
  const { data: user } = useCurrentUser();
  const { data: categories } = useCategories();
  const { data: coops } = useCooperatives();
  const { data: products, isLoading } = useProducts();
  const { data: inventory } = useInventory();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();

  const isAdmin = (user?.roles ?? []).includes("admin");

  const list = (products ?? [])
    .filter((p) => (cat ? p.category_id === cat : true))
    .filter((p) => `${p.name} ${p.cooperatives?.name}`.toLowerCase().includes(q.toLowerCase()));

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createProduct.mutateAsync({
        name: String(fd.get("name")),
        cooperative_id: String(fd.get("cooperative_id")),
        category_id: (fd.get("category_id") as string) || null,
        description: (fd.get("description") as string) || null,
        origin: (fd.get("origin") as string) || null,
        city: (fd.get("city") as string) || null,
        unit: String(fd.get("unit") || "un"),
        weight: fd.get("weight") ? Number(fd.get("weight")) : null,
        price: Number(fd.get("price")),
        cost: Number(fd.get("cost") || 0),
      });
      toast.success("Produto cadastrado");
      setForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível cadastrar");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover o produto "${name}"?`)) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Produto removido");
    } catch {
      toast.error("Produto com estoque ou vendas não pode ser removido");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="🛍️ Catálogo"
        title="Produtos da Rede"
        description="Todo produto exibe sua origem: cooperativa, município e história."
        action={
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produto ou cooperativa"
              className="w-64 rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf"
            />
            {isAdmin && (
              <button
                onClick={() => setForm((v) => !v)}
                className="flex items-center gap-1.5 rounded-md bg-leaf px-3 py-2 text-[13px] text-primary-foreground"
              >
                {form ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
                {form ? "Fechar" : "Novo produto"}
              </button>
            )}
          </div>
        }
      />

      {isAdmin && form && (
        <Panel title="Cadastrar produto" subtitle="Vincule o produto à cooperativa que o produz">
          {(coops ?? []).length === 0 ? (
            <EmptyState
              title="Cadastre uma cooperativa primeiro"
              description="Todo produto pertence a uma cooperativa da rede."
            />
          ) : (
            <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-1.5">
                <span className="label-mono">Nome</span>
                <input name="name" required className={inputCls} />
              </label>
              <label className="space-y-1.5">
                <span className="label-mono">Cooperativa</span>
                <select name="cooperative_id" required className={inputCls}>
                  {(coops ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="label-mono">Categoria</span>
                <select name="category_id" className={inputCls}>
                  <option value="">Sem categoria</option>
                  {(categories ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="label-mono">Preço de venda (R$)</span>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className={inputCls}
                />
              </label>
              <label className="space-y-1.5">
                <span className="label-mono">Custo (R$)</span>
                <input name="cost" type="number" step="0.01" min="0" className={inputCls} />
              </label>
              <label className="space-y-1.5">
                <span className="label-mono">Unidade</span>
                <input name="unit" defaultValue="un" className={inputCls} />
              </label>
              <label className="space-y-1.5">
                <span className="label-mono">Peso</span>
                <input name="weight" type="number" step="0.001" min="0" className={inputCls} />
              </label>
              <label className="space-y-1.5">
                <span className="label-mono">Município</span>
                <input name="city" className={inputCls} />
              </label>
              <label className="space-y-1.5">
                <span className="label-mono">Origem</span>
                <input name="origin" className={inputCls} />
              </label>
              <label className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <span className="label-mono">Descrição</span>
                <textarea name="description" rows={2} className={inputCls} />
              </label>
              <div className="sm:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  disabled={createProduct.isPending}
                  className="rounded-md bg-leaf px-4 py-2 text-[13px] text-primary-foreground disabled:opacity-60"
                >
                  {createProduct.isPending ? "Salvando…" : "Cadastrar produto"}
                </button>
              </div>
            </form>
          )}
        </Panel>
      )}

      <div className="flex flex-wrap gap-1.5 font-mono text-[12px]">
        <button
          onClick={() => setCat(null)}
          className={cn(
            "rounded-md px-3 py-1.5",
            cat === null
              ? "bg-leaf text-primary-foreground"
              : "border border-line text-muted-foreground",
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
                : "border border-line text-muted-foreground",
            )}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingRows rows={6} />
      ) : list.length === 0 ? (
        <EmptyState
          title="Nenhum produto encontrado"
          description="Ajuste a busca ou cadastre um novo produto."
        />
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
                  <div className="flex items-center gap-2">
                    <Tag tone={stock > 0 ? "good" : "crit"}>{num(stock)} un</Tag>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        aria-label={`Remover ${p.name}`}
                        className="grid size-7 place-items-center rounded-md border border-line text-muted-foreground hover:border-crit/40 hover:text-crit"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-[12px] text-muted-foreground">
                  {p.description}
                </p>
                <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
                  <Link
                    to="/admin/cooperativas/$id"
                    params={{ id: p.cooperative_id }}
                    className="text-[12px] text-leaf hover:text-leaf-2"
                  >
                    🤝 {p.cooperatives?.name}
                    <span className="block text-[11px] text-muted-foreground">
                      📍 {p.cooperatives?.city}
                    </span>
                  </Link>
                  <span className="font-mono text-[18px] font-semibold">
                    {brl(Number(p.price))}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
