import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/session";
import { useCategories, useCreateProduct } from "@/lib/queries";
import { EmptyState, PageHeader, Panel } from "@/components/kit";

export const Route = createFileRoute("/cooperativa/produto-novo")({
  head: () => ({
    meta: [
      { title: "Novo Produto — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Cadastre um produto da sua cooperativa na rede de comercialização.",
      },
      { property: "og:title", content: "Novo Produto — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: NovoProduto,
});

const inputCls =
  "w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf";

function NovoProduto() {
  const router = useRouter();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!coopId) return;
    const fd = new FormData(e.currentTarget);
    try {
      setSaving(true);
      await createProduct.mutateAsync({
        name: String(fd.get("name")),
        description: (fd.get("description") as string) || null,
        price: Number(fd.get("price")),
        unit: String(fd.get("unit") || "un"),
        cooperative_id: coopId,
        category_id: (fd.get("category_id") as string) || null,
        image_url: (fd.get("image_url") as string) || null,
        city: (fd.get("city") as string) || null,
        status: "ativa",
      });
      toast.success("Produto cadastrado");
      await router.invalidate();
      navigate({ to: "/cooperativa/produtos" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível cadastrar");
    } finally {
      setSaving(false);
    }
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Para cadastrar produtos é preciso que seu perfil esteja associado a uma cooperativa."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="➕ Produtos"
        title="Novo Produto"
        description="Descreva o produto com unidade, preço e categoria — ele nasce ativo e passa a ser produzido pela sua cooperativa."
      />

      <Panel title="Cadastrar produto">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="label-mono">Nome *</span>
            <input
              name="name"
              required
              placeholder="Ex.: Farinha de mandioca"
              className={inputCls}
            />
          </label>
          <label className="space-y-1.5">
            <span className="label-mono">Unidade *</span>
            <input
              name="unit"
              required
              defaultValue="un"
              placeholder="Ex.: kg, un, pacote"
              className={inputCls}
            />
          </label>
          <label className="space-y-1.5">
            <span className="label-mono">Preço de venda (R$) *</span>
            <input name="price" type="number" step="0.01" min="0" required className={inputCls} />
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
            <span className="label-mono">Município de origem</span>
            <input name="city" placeholder="Ex.: União dos Palmares" className={inputCls} />
          </label>
          <label className="space-y-1.5">
            <span className="label-mono">Imagem (URL)</span>
            <input name="image_url" type="url" placeholder="https://…" className={inputCls} />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="label-mono">Descrição</span>
            <textarea name="description" rows={3} className={inputCls} />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving || createProduct.isPending}
              className="rounded-md bg-leaf px-5 py-2.5 text-[13px] font-medium text-primary-foreground disabled:opacity-60"
            >
              {saving || createProduct.isPending ? "Salvando…" : "Cadastrar produto"}
            </button>
          </div>
        </form>
      </Panel>
    </>
  );
}
