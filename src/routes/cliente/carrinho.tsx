import { useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Minus, Plus, Send, Trash2 } from "lucide-react";
import { useCustomerAddresses, usePlaceOrder, useStores } from "@/lib/queries";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/format";
import { DELIVERY_LABEL, type DeliveryType } from "@/lib/domain";
import { EmptyState, LoadingRows, PageHeader, Panel } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cliente/carrinho")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Carrinho — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Revise os itens, escolha a loja e finalize seu pedido." },
    ],
  }),
  component: Carrinho,
});

const PAYMENTS = [
  { key: "pix", label: "PIX" },
  { key: "credito", label: "Crédito" },
  { key: "debito", label: "Débito" },
  { key: "dinheiro", label: "Dinheiro" },
] as const;

const labelCls = "label-mono";
const selectCls =
  "w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

function Carrinho() {
  const cart = useCart();
  const { data: stores, isLoading: loadingStores } = useStores();
  const { data: addresses, isLoading: loadingAddresses } = useCustomerAddresses();
  const placeOrder = usePlaceOrder();
  const navigate = useNavigate();

  const [storeSel, setStoreSel] = useState("");
  const [delivery, setDelivery] = useState<DeliveryType>("retirada");
  const [addrSel, setAddrSel] = useState("");
  const [payment, setPayment] = useState<(typeof PAYMENTS)[number]["key"]>("pix");
  const [discount, setDiscount] = useState("0");

  const storeId = storeSel || stores?.[0]?.id || "";
  const address = (addresses ?? []).find((a) => a.id === addrSel) ?? addresses?.[0];
  const addressId = address?.id ?? null;

  const subtotal = cart.subtotal;
  const total = Math.max(0, subtotal - Math.abs(Number(discount || 0)));

  function finish() {
    if (cart.items.length === 0) {
      toast.error("Seu carrinho está vazio.");
      return;
    }
    if (!storeId) {
      toast.error("Selecione a loja para retirar ou entregar o pedido.");
      return;
    }
    if (delivery === "entrega" && !addressId) {
      toast.error("Selecione um endereço de entrega.");
      return;
    }
    placeOrder.mutate(
      {
        store_id: storeId,
        delivery_type: delivery,
        address_id: delivery === "entrega" ? addressId : null,
        payment_method: payment,
        discount: Math.abs(Number(discount || 0)),
        items: cart.items.map((i) => ({ product_id: i.product_id, quantity: i.qty })),
      },
      {
        onSuccess: (id) => {
          toast.success(`Pedido concluído — ${brl(total)}. Acompanhe em Meus pedidos.`);
          cart.clear();
          navigate({ to: "/cliente/pedido/$id", params: { id } });
        },
        onError: (error) =>
          toast.error(
            error instanceof Error ? error.message : "Não foi possível finalizar o pedido.",
          ),
      },
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="🛒 Checkout"
        title="Seu carrinho"
        description="Revise os itens, escolha a forma de retirada ou entrega e finalize."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Panel
            title={`Itens (${cart.count} ${cart.count === 1 ? "item" : "itens"})`}
            padded={false}
          >
            {cart.items.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="Carrinho vazio"
                  description="Adicione produtos do catálogo para começar suas compras."
                />
              </div>
            ) : (
              <div className="divide-y divide-line">
                {cart.items.map((i) => (
                  <div
                    key={i.product_id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {i.image_url ? (
                        <img
                          src={i.image_url}
                          alt={i.name}
                          className="size-10 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-panel-2 text-base">
                          🛍️
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium">{i.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {i.cooperative} · {i.unit}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-mono text-[12px]">
                        <button
                          aria-label="Diminuir quantidade"
                          onClick={() => cart.setQty(i.product_id, i.qty - 1)}
                          className="grid size-7 place-items-center rounded-md border border-line text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-7 text-center">{i.qty}</span>
                        <button
                          aria-label="Aumentar quantidade"
                          onClick={() => cart.setQty(i.product_id, i.qty + 1)}
                          className="grid size-7 place-items-center rounded-md border border-line text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <div className="font-mono text-[13px] font-semibold text-leaf">
                        {brl(i.price * i.qty)}
                      </div>
                      <button
                        aria-label="Remover item"
                        onClick={() => cart.remove(i.product_id)}
                        className="grid size-7 place-items-center rounded-md border border-line text-muted-foreground hover:border-crit/40 hover:text-crit"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <Panel title="Resumo">
            <div className="space-y-2 font-mono text-[12px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{brl(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Desconto</span>
                <input
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  className="w-24 rounded border border-line bg-panel-2 px-2 py-1 text-right outline-none focus:border-leaf"
                />
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-[16px] font-semibold text-leaf">
                <span>Total</span>
                <span>{brl(total)}</span>
              </div>
            </div>
          </Panel>

          <Panel title="Retirada ou entrega">
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(DELIVERY_LABEL) as DeliveryType[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDelivery(d)}
                  className={cn(
                    "rounded-md px-3 py-2 text-[13px]",
                    delivery === d
                      ? "bg-leaf text-primary-foreground"
                      : "border border-line text-muted-foreground",
                  )}
                >
                  {DELIVERY_LABEL[d]}
                </button>
              ))}
            </div>
          </Panel>

          {delivery === "entrega" && (
            <Panel title="Endereço de entrega">
              {loadingAddresses ? (
                <LoadingRows rows={2} />
              ) : (addresses ?? []).length === 0 ? (
                <div className="space-y-3">
                  <EmptyState
                    title="Nenhum endereço cadastrado"
                    description="Cadastre um endereço para receber seu pedido em casa."
                  />
                  <Link
                    to="/cliente/enderecos"
                    className="block text-center text-[13px] font-semibold text-leaf hover:underline"
                  >
                    Cadastrar endereço
                  </Link>
                </div>
              ) : (
                <select
                  value={address?.id ?? ""}
                  onChange={(e) => setAddrSel(e.target.value)}
                  className={selectCls}
                >
                  {(addresses ?? []).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label ?? "Endereço"} · {a.street}, {a.number ?? "s/n"} — {a.city}/{a.state}
                    </option>
                  ))}
                </select>
              )}
              <Link
                to="/cliente/enderecos"
                className="mt-3 block text-[12px] font-medium text-muted-foreground hover:text-leaf"
              >
                Gerenciar endereços
              </Link>
            </Panel>
          )}

          <Panel title="Loja para retirada">
            {loadingStores ? (
              <LoadingRows rows={2} />
            ) : (stores ?? []).length === 0 ? (
              <EmptyState
                title="Nenhuma loja cadastrada"
                description="Os pedidos precisam de uma loja para serem processados."
              />
            ) : (
              <Field label="Loja">
                <select
                  value={storeId}
                  onChange={(e) => setStoreSel(e.target.value)}
                  className={selectCls}
                >
                  {(stores ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.city}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </Panel>

          <Panel title="Pagamento">
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[12px]">
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
          </Panel>

          <button
            onClick={finish}
            disabled={placeOrder.isPending || cart.items.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-clay px-5 py-3 text-[14px] font-medium text-primary-foreground transition-colors disabled:opacity-50"
          >
            {placeOrder.isPending ? "Finalizando…" : "Finalizar pedido"}
            {!placeOrder.isPending && <Send className="size-4" />}
          </button>
        </aside>
      </div>
    </>
  );
}
