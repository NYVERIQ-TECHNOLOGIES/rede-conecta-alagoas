import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import {
  useStores,
  useInventory,
  useSales,
  useCreateStore,
  useDeleteStore,
} from "@/lib/queries";
import { useCurrentUser } from "@/lib/session";
import { brl, num } from "@/lib/format";
import { LoadingRows, PageHeader, Panel, StatusDot } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/lojas/")({
  head: () => ({
    meta: [
      { title: "Nossas Lojas — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Lojas da rede em Maceió, Arapiraca e Piaçabuçu: vendas, estoque e responsáveis.",
      },
      { property: "og:title", content: "Nossas Lojas — ALAGOAS+COOPERATIVA" },
      {
        property: "og:description",
        content: "Pontos de comercialização da rede cooperativista alagoana.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Lojas,
});

const inputCls =
  "w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf";

function Lojas() {
  const [form, setForm] = useState(false);
  const { data: user } = useCurrentUser();
  const { data: stores, isLoading } = useStores();
  const { data: inventory } = useInventory();
  const { data: sales } = useSales();
  const createStore = useCreateStore();
  const deleteStore = useDeleteStore();

  const isAdmin = (user?.roles ?? []).includes("admin");

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const el = e.currentTarget;
    try {
      await createStore.mutateAsync({
        name: String(fd.get("name")).trim(),
        city: String(fd.get("city")).trim(),
        address: String(fd.get("address") ?? "").trim() || null,
        manager_name: String(fd.get("manager_name") ?? "").trim() || null,
        opening_hours: String(fd.get("opening_hours") ?? "").trim() || null,
      });
      toast.success("Loja cadastrada");
      el.reset();
      setForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar loja");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Remover a loja ${name}? Estoque e vendas vinculados impedirão a remoção.`))
      return;
    try {
      await deleteStore.mutateAsync(id);
      toast.success("Loja removida");
    } catch {
      toast.error("Não foi possível remover: a loja possui estoque, vendas ou vínculos.");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="📍 Nossas Lojas"
        title="Lojas da Rede"
        description="Cada loja é uma vitrine da produção cooperativista alagoana."
        action={
          isAdmin ? (
            <button
              onClick={() => setForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-md bg-leaf px-3 py-2 text-[13px] text-primary-foreground"
            >
              {form ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
              {form ? "Fechar" : "Nova loja"}
            </button>
          ) : undefined
        }
      />

      {isAdmin && form && (
        <Panel
          title="Cadastrar loja"
          subtitle="A nova unidade passa a receber entradas, vendas e transferências imediatamente"
        >
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1.5">
              <span className="label-mono">Nome *</span>
              <input name="name" required maxLength={100} className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Município *</span>
              <input name="city" required maxLength={100} className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Endereço</span>
              <input name="address" maxLength={200} className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Responsável</span>
              <input name="manager_name" maxLength={100} className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Horário de funcionamento</span>
              <input name="opening_hours" maxLength={100} placeholder="Seg–Sáb, 8h–18h" className={inputCls} />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={createStore.isPending}
                className="rounded-md bg-leaf px-4 py-2 text-[13px] text-primary-foreground disabled:opacity-60"
              >
                {createStore.isPending ? "Salvando…" : "Cadastrar loja"}
              </button>
            </div>
          </form>
        </Panel>
      )}

      {isLoading ? (
        <LoadingRows />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(stores ?? []).map((store) => {
            const stock = (inventory ?? [])
              .filter((i) => i.store_id === store.id)
              .reduce((a, i) => a + i.quantity, 0);
            const total = (sales ?? [])
              .filter((s) => s.store_id === store.id)
              .reduce((a, s) => a + Number(s.total), 0);
            return (
              <div key={store.id} className="panel rise relative p-5 transition-colors hover:border-leaf/40">
                <Link to="/lojas/$id" params={{ id: store.id }} className="block">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-[18px] font-semibold">{store.name}</h2>
                      <p className="font-mono text-[11px] text-muted-foreground">{store.address}</p>
                    </div>
                    <StatusDot status={store.status} />
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <dt className="label-mono">Vendas</dt>
                      <dd className="mt-1 font-mono text-[16px] text-leaf">{brl(total)}</dd>
                    </div>
                    <div>
                      <dt className="label-mono">Estoque</dt>
                      <dd className="mt-1 font-mono text-[16px]">{num(stock)}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-[12px] text-muted-foreground">
                    Responsável: {store.manager_name ?? "—"} · {store.opening_hours ?? "—"}
                  </p>
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(store.id, store.name)}
                    title="Remover loja"
                    className="absolute bottom-4 right-4 rounded-md border border-line p-1.5 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Panel title="Expansão" subtitle="A arquitetura permite novas lojas sem alterar o sistema.">
        <p className="text-[13px] text-muted-foreground">
          Use o botão “Nova loja” para cadastrar unidades. A unidade de Piaçabuçu está preparada
          para análises ligadas ao fluxo de moradores e turistas do Rio São Francisco.
        </p>
      </Panel>
    </>
  );
}
