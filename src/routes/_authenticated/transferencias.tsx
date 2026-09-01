import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProducts, useStores, useTransfers } from "@/lib/queries";
import { dateTimeBR, num } from "@/lib/format";
import { EmptyState, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/transferencias")({
  head: () => ({
    meta: [
      { title: "Transferências — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Transferência de estoque entre as lojas da rede, com confirmação de recebimento.",
      },
      { property: "og:title", content: "Transferências — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Movimentação de produtos entre lojas da rede." },
    ],
  }),
  component: Transferencias,
});

function Transferencias() {
  const qc = useQueryClient();
  const { data: stores } = useStores();
  const { data: products } = useProducts();
  const { data: transfers } = useTransfers();
  const [form, setForm] = useState({ from_store_id: "", to_store_id: "", product_id: "", quantity: "" });
  const [saving, setSaving] = useState(false);

  const field = "w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf";
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (form.from_store_id === form.to_store_id) {
      toast.error("Escolha lojas diferentes.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("stock_transfers").insert({
      from_store_id: form.from_store_id,
      to_store_id: form.to_store_id,
      product_id: form.product_id,
      quantity: Number(form.quantity),
      status: "solicitada",
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Transferência solicitada.");
    setForm({ ...form, quantity: "" });
    qc.invalidateQueries({ queryKey: ["transfers"] });
  }

  async function receive(id: string) {
    const { error } = await supabase.rpc("complete_transfer", { _transfer_id: id });
    if (error) return toast.error(error.message);
    toast.success("Transferência recebida.");
    qc.invalidateQueries({ queryKey: ["transfers"] });
    qc.invalidateQueries({ queryKey: ["inventory"] });
  }

  return (
    <>
      <PageHeader
        eyebrow="🔄 Transferências"
        title="Entre Lojas"
        description="Equilibre o estoque da rede sem perder rastreabilidade da cooperativa de origem."
      />
      <Panel title="Nova transferência">
        <form onSubmit={create} className="grid gap-4 sm:grid-cols-4">
          <label className="space-y-1.5">
            <span className="label-mono">De</span>
            <select className={field} value={form.from_store_id} onChange={(e) => set("from_store_id", e.target.value)}>
              <option value="">Origem</option>
              {(stores ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="label-mono">Para</span>
            <select className={field} value={form.to_store_id} onChange={(e) => set("to_store_id", e.target.value)}>
              <option value="">Destino</option>
              {(stores ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="label-mono">Produto</span>
            <select className={field} value={form.product_id} onChange={(e) => set("product_id", e.target.value)}>
              <option value="">Selecione</option>
              {(products ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="label-mono">Quantidade</span>
            <input type="number" min="1" className={field} value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
          </label>
          <div className="sm:col-span-4">
            <button disabled={saving} className="rounded-md bg-leaf px-5 py-2.5 text-[13px] font-medium text-primary-foreground disabled:opacity-60">
              {saving ? "Enviando…" : "Solicitar transferência"}
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Movimentações" padded={false}>
        {(transfers ?? []).length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nenhuma transferência registrada" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {(transfers ?? []).map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <div className="text-[13px]">{t.products?.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {t.from?.name} → {t.to?.name} · {num(t.quantity)} un · {dateTimeBR(t.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag tone={t.status === "recebida" ? "good" : t.status === "cancelada" ? "crit" : "warn"}>
                    {t.status}
                  </Tag>
                  {t.status !== "recebida" && t.status !== "cancelada" && (
                    <button
                      onClick={() => receive(t.id)}
                      className="rounded-md border border-leaf/40 px-3 py-1.5 font-mono text-[11px] text-leaf hover:bg-leaf/10"
                    >
                      Confirmar recebimento
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
