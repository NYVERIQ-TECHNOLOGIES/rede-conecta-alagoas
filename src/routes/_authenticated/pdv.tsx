import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCategories, useInventory, useProducts, useStores } from "@/lib/queries";
import { brl, num } from "@/lib/format";
import { EmptyState, PageHeader, Tag } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pdv")({
  head: () => ({
    meta: [
      { title: "PDV — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Ponto de venda das lojas da rede: carrinho rápido, PIX, cartão e dinheiro.",
      },
      { property: "og:title", content: "PDV — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Venda com origem cooperativista registrada." },
    ],
  }),
  component: PDV,
});

type CartItem = { product_id: string; name: string; price: number; qty: number; cooperative: string };
const PAYMENTS = [
  { key: "pix", label: "PIX" },
  { key: "dinheiro", label: "Dinheiro" },
  { key: "debito", label: "Débito" },
  { key: "credito", label: "Crédito" },
] as const;

function PDV() {
  const qc = useQueryClient();
  const { data: stores } = useStores();
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const { data: inventory } = useInventory();
  const [storeId, setStoreId] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState("0");
  const [payment, setPayment] = useState<(typeof PAYMENTS)[number]["key"]>("pix");
  const [saving, setSaving] = useState(false);

  const activeStore = storeId || stores?.[0]?.id || "";

  const available = useMemo(
    () =>
      (products ?? [])
        .filter((p) => (cat ? p.category_id === cat : true))
        .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
        .map((p) => ({
          ...p,
          stock: (inventory ?? [])
            .filter((i) => i.product_id === p.id && i.store_id === activeStore)
            .reduce((a, i) => a + i.quantity, 0),
        })),
    [products, cat, q, inventory, activeStore],
  );

  const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const total = Math.max(0, subtotal - Number(discount || 0));

  function add(p: (typeof available)[number]) {
    setCart((c) => {
      const found = c.find((i) => i.product_id === p.id);
      if (found) return c.map((i) => (i.product_id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [
        ...c,
        {
          product_id: p.id,
          name: p.name,
          price: Number(p.price),
          qty: 1,
          cooperative: p.cooperatives?.name ?? "",
        },
      ];
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((c) =>
      c
        .map((i) => (i.product_id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  }

  async function finish(): Promise<void> {
    if (!activeStore || cart.length === 0) {
      toast.error("Selecione a loja e adicione produtos.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc("register_sale", {
      _store_id: activeStore,
      _payment_method: payment,
      _discount: Number(discount || 0),
      _items: cart.map((i) => ({ product_id: i.product_id, quantity: i.qty })),
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Venda concluída — ${brl(total)}`);
    setCart([]);
    setDiscount("0");
    qc.invalidateQueries({ queryKey: ["inventory"] });
    qc.invalidateQueries({ queryKey: ["sales"] });
  }

  return (
    <>
      <PageHeader
        eyebrow="🛒 PDV"
        title="Ponto de Venda"
        description="Fluxo rápido: toque no produto, confira o carrinho e finalize."
        action={
          <select
            value={activeStore}
            onChange={(e) => setStoreId(e.target.value)}
            className="rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf"
          >
            {(stores ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[12px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produto"
              className="mr-2 w-52 rounded-md border border-line bg-panel-2 px-3 py-1.5 font-sans text-[13px] outline-none focus:border-leaf"
            />
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
                {c.emoji}
              </button>
            ))}
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {available.map((p) => (
              <button
                key={p.id}
                onClick={() => add(p)}
                disabled={p.stock <= 0}
                className="panel p-4 text-left transition-colors hover:border-leaf/50 disabled:opacity-40"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[14px] font-medium">{p.name}</span>
                  <Tag tone={p.stock > 0 ? "good" : "crit"}>{num(p.stock)}</Tag>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{p.cooperatives?.name}</div>
                <div className="mt-3 font-mono text-[17px] font-semibold text-leaf">
                  {brl(Number(p.price))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="panel flex h-fit flex-col p-5 lg:sticky lg:top-4">
          <h2 className="text-[17px] font-semibold">Carrinho</h2>
          {cart.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Carrinho vazio" description="Toque nos produtos para adicionar." />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {cart.map((i) => (
                <li key={i.product_id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[13px]">{i.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {i.cooperative} · {brl(i.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[12px]">
                    <button onClick={() => changeQty(i.product_id, -1)} className="size-6 rounded border border-line">
                      −
                    </button>
                    <span className="w-6 text-center">{i.qty}</span>
                    <button onClick={() => changeQty(i.product_id, 1)} className="size-6 rounded border border-line">
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 space-y-2 border-t border-line pt-4 font-mono text-[12px]">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{brl(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Desconto</span>
              <input
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 rounded border border-line bg-panel-2 px-2 py-1 text-right outline-none focus:border-leaf"
              />
            </div>
            <div className="flex justify-between text-[18px] font-semibold text-leaf">
              <span>Total</span>
              <span>{brl(total)}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-1.5 font-mono text-[12px]">
            {PAYMENTS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPayment(p.key)}
                className={cn(
                  "rounded-md px-3 py-2",
                  payment === p.key
                    ? "bg-leaf text-primary-foreground"
                    : "border border-line text-muted-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={finish}
            disabled={saving || cart.length === 0}
            className="mt-4 rounded-md bg-clay px-5 py-3 text-[14px] font-medium text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Registrando…" : "Finalizar venda"}
          </button>
        </aside>
      </div>
    </>
  );
}
