import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProducts, useStores } from "@/lib/queries";
import { PageHeader, Panel } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/entradas")({
  head: () => ({
    meta: [
      { title: "Entrada de Produtos — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Registro de entrada de lotes cooperativistas com validade e rastreabilidade.",
      },
      { property: "og:title", content: "Entrada de Produtos — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Recebimento de produtos das cooperativas nas lojas." },
    ],
  }),
  component: Entradas,
});

function Entradas() {
  const qc = useQueryClient();
  const { data: stores } = useStores();
  const { data: products } = useProducts();
  const [form, setForm] = useState({
    store_id: "",
    product_id: "",
    quantity: "",
    batch_code: "",
    produced_at: "",
    expires_at: "",
    document: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.store_id || !form.product_id || !form.quantity) {
      toast.error("Preencha loja, produto e quantidade.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc("register_entry", {
      _store_id: form.store_id,
      _product_id: form.product_id,
      _quantity: Number(form.quantity),
      _batch_code: form.batch_code || `LOTE-${Date.now()}`,
      _produced_at: form.produced_at || new Date().toISOString().slice(0, 10),
      _expires_at: form.expires_at || new Date(Date.now() + 180 * 86_400_000).toISOString().slice(0, 10),
      _document: form.document,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Entrada registrada com sucesso.");
    setForm({ ...form, quantity: "", batch_code: "", document: "" });
    qc.invalidateQueries({ queryKey: ["inventory"] });
  }

  const field = "w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf";

  return (
    <>
      <PageHeader
        eyebrow="📥 Entradas"
        title="Entrada de Produtos"
        description="Cada entrada gera lote, movimentação e rastreabilidade até a cooperativa de origem."
      />
      <Panel title="Registrar recebimento">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="label-mono">Loja</span>
            <select className={field} value={form.store_id} onChange={(e) => set("store_id", e.target.value)}>
              <option value="">Selecione</option>
              {(stores ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="label-mono">Produto</span>
            <select className={field} value={form.product_id} onChange={(e) => set("product_id", e.target.value)}>
              <option value="">Selecione</option>
              {(products ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.cooperatives?.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="label-mono">Quantidade</span>
            <input type="number" min="1" className={field} value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className="label-mono">Lote</span>
            <input className={field} value={form.batch_code} onChange={(e) => set("batch_code", e.target.value)} placeholder="Gerado automaticamente se vazio" />
          </label>
          <label className="space-y-1.5">
            <span className="label-mono">Produção</span>
            <input type="date" className={field} value={form.produced_at} onChange={(e) => set("produced_at", e.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className="label-mono">Validade</span>
            <input type="date" className={field} value={form.expires_at} onChange={(e) => set("expires_at", e.target.value)} />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="label-mono">Documento / observação</span>
            <input className={field} value={form.document} onChange={(e) => set("document", e.target.value)} placeholder="Nota, recibo ou termo de consignação" />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-leaf px-5 py-2.5 text-[13px] font-medium text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Registrando…" : "Registrar entrada"}
            </button>
          </div>
        </form>
      </Panel>
    </>
  );
}
