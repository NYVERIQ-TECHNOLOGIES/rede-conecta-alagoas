import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { MapPin, ShoppingCart } from "lucide-react";
import { useProducts, useStoresWithProduct } from "@/lib/queries";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/format";
import { EmptyState, LoadingRows, Panel } from "@/components/kit";

export const Route = createFileRoute("/cliente/produto/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Produto — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Detalhes do produto e onde encontrar na rede cooperativista.",
      },
    ],
  }),
  component: ProdutoDetalhe,
});

type ProductView = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  unit: string;
  status: string;
  description: string | null;
  ingredients: string | null;
  origin: string | null;
  cooperatives?: { name: string; city: string; region: string | null } | null;
  product_categories?: { name: string; emoji: string | null } | null;
};

function ProdutoDetalhe() {
  const { id } = Route.useParams();
  const { data: products, isLoading } = useProducts();
  const { data: stores, isLoading: loadingStores } = useStoresWithProduct(id, !!id);
  const cart = useCart();

  if (isLoading) return <LoadingRows rows={8} />;

  const product = ((products ?? []) as ProductView[]).find((p) => p.id === id);
  if (!product) {
    return (
      <EmptyState
        title="Produto não encontrado"
        description="Ele pode ter sido removido do catálogo ou ainda não está ativo."
      />
    );
  }

  function handleAdd() {
    cart.add({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      cooperative: product.cooperatives?.name ?? "Rede cooperativista",
      unit: product.unit,
      image_url: product.image_url,
    });
    toast.success(`${product.name} adicionado ao carrinho`);
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 rise">
        <div className="max-w-3xl">
          <p className="label-mono">
            {product.product_categories?.emoji ?? "🏷️"}{" "}
            {product.product_categories?.name ?? "Produto da rede"}
          </p>
          <h1 className="mt-1 text-[30px] leading-tight font-bold text-primary">{product.name}</h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {product.cooperatives?.name} · {product.cooperatives?.city} · {product.unit}
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-[34px] leading-none font-bold text-leaf">
            {brl(Number(product.price))}
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">{product.unit}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="panel rise overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="max-h-[420px] w-full object-cover"
              />
            ) : (
              <div className="grid min-h-64 place-items-center bg-panel-2 text-7xl">
                {product.product_categories?.emoji ?? "🛍️"}
              </div>
            )}
          </div>

          {product.description && (
            <Panel title="Descrição">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </Panel>
          )}

          {product.ingredients && (
            <Panel title="Ingredientes">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {product.ingredients}
              </p>
            </Panel>
          )}

          {product.origin && (
            <Panel title="Origem">
              <p className="text-[13px] leading-relaxed text-muted-foreground">{product.origin}</p>
            </Panel>
          )}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <Panel title="Comprar">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Preço</span>
                <span className="font-mono text-[18px] font-semibold text-leaf">
                  {brl(Number(product.price))}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Unidade</span>
                <span>{product.unit}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="text-muted-foreground">Cooperativa</span>
                <span className="text-right">{product.cooperatives?.name ?? "Rede"}</span>
              </div>
              <button
                onClick={handleAdd}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-leaf px-4 py-3 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-leaf/90"
              >
                <ShoppingCart className="size-4" /> Adicionar ao carrinho
              </button>
            </div>
          </Panel>

          <Panel title="Onde encontrar">
            {loadingStores ? (
              <LoadingRows rows={2} />
            ) : (stores ?? []).length === 0 ? (
              <p className="text-[12px] text-muted-foreground">
                Este produto está sendo organizado para as lojas. Em breve você poderá retirar.
              </p>
            ) : (
              <ul className="space-y-3">
                {(stores ?? []).map((s) => (
                  <li key={s.store_id} className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-leaf" />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium">{s.stores?.name ?? "Loja"}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {s.stores?.city} {s.stores?.address ? `· ${s.stores.address}` : ""}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </aside>
      </div>
    </>
  );
}
