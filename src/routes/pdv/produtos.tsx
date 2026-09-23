import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/session";
import { useSetStoreProduct, useStoreProducts } from "@/lib/queries";
import { brl } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, SearchInput, Tag } from "@/components/kit";
import type { StoreProduct } from "@/lib/domain";

export const Route = createFileRoute("/pdv/produtos")({
  head: () => ({
    meta: [
      { title: "PDV · Produtos disponíveis — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Produtos que a loja ativa no balcão a partir do catálogo da rede.",
      },
      { property: "og:title", content: "PDV · Produtos disponíveis — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: ProdutosPdv,
});

function ProdutosPdv() {
  const { data: user } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const { data: storeProducts, isLoading } = useStoreProducts(storeId);
  const setStoreProduct = useSetStoreProduct();
  const [q, setQ] = useState("");

  const list = (storeProducts ?? []).filter((sp) =>
    (sp.products?.name ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  async function toggle(sp: StoreProduct) {
    const active = !sp.active;
    try {
      await setStoreProduct.mutateAsync({
        store_id: sp.store_id,
        product_id: sp.product_id,
        active,
      });
      toast.success(active ? "Produto disponível na loja" : "Produto indisponível");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível atualizar a disponibilidade",
      );
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Produtos"
        title="Produtos disponíveis"
        description="Ative ou desative produtos no balcão da sua loja. O catálogo da rede é gerenciado pela cooperativa."
        action={
          <SearchInput value={q} onChange={setQ} placeholder="Buscar produto…" className="w-56" />
        }
      />

      {!storeId ? (
        <EmptyState
          title="Loja não vinculada ao seu perfil"
          description="Vincule sua loja para configurar os produtos."
        />
      ) : isLoading ? (
        <LoadingRows rows={6} />
      ) : (storeProducts ?? []).length === 0 ? (
        <EmptyState
          title="Catálogo ainda não configurado para esta loja"
          description="Nenhum produto foi vinculado à loja. A cooperativa ou o administrador da rede precisa configurar o catálogo primeiro."
        />
      ) : list.length === 0 ? (
        <EmptyState title="Nenhum produto encontrado" description="Ajuste a busca." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((sp) => (
            <div key={sp.id} className="panel rise flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium">{sp.products?.name}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {sp.cooperatives?.name ?? "Rede cooperativista"}
                  </div>
                </div>
                <Tag tone={sp.active ? "good" : "muted"}>
                  {sp.active ? "Disponível" : "Indisponível"}
                </Tag>
              </div>
              <div className="mt-3 font-mono text-[17px] font-semibold text-leaf">
                {brl(Number(sp.products?.price ?? 0))}
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-line pt-3 text-[13px]">
                <input
                  type="checkbox"
                  checked={sp.active}
                  onChange={() => toggle(sp)}
                  disabled={setStoreProduct.isPending}
                  className="size-4 accent-leaf"
                />
                <span className="text-muted-foreground">Disponível no balcão</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
