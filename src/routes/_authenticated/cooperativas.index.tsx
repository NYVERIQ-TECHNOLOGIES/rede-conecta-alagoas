import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import {
  useCooperatives,
  useCreateCooperative,
  useDeleteCooperative,
  useProducts,
  useSettlements,
} from "@/lib/queries";
import { useCurrentUser } from "@/lib/session";
import { brl } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, StatusDot } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/cooperativas/")({
  head: () => ({
    meta: [
      { title: "Cooperativas — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content:
          "Cooperativas parceiras da rede alagoana: municípios, produtos e valores comercializados.",
      },
      { property: "og:title", content: "Cooperativas — ALAGOAS+COOPERATIVA" },
      {
        property: "og:description",
        content: "Quem produz na rede de comercialização cooperativista de Alagoas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cooperativas,
});

const inputCls =
  "w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf";

function Cooperativas() {
  const [q, setQ] = useState("");
  const [form, setForm] = useState(false);
  const { data: user } = useCurrentUser();
  const { data: coops, isLoading } = useCooperatives();
  const { data: products } = useProducts();
  const { data: settlements } = useSettlements();
  const createCoop = useCreateCooperative();
  const deleteCoop = useDeleteCooperative();

  const isAdmin = (user?.roles ?? []).includes("admin");

  const list = (coops ?? []).filter((c) =>
    `${c.name} ${c.city} ${c.region}`.toLowerCase().includes(q.toLowerCase()),
  );

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createCoop.mutateAsync({
        name: String(fd.get("name")),
        city: String(fd.get("city")),
        region: (fd.get("region") as string) || null,
        cnpj: (fd.get("cnpj") as string) || null,
        responsible_name: (fd.get("responsible_name") as string) || null,
        phone: (fd.get("phone") as string) || null,
        email: (fd.get("email") as string) || null,
        families_reached: fd.get("families_reached") ? Number(fd.get("families_reached")) : null,
        commission_rate: Number(fd.get("commission_rate") || 0) / 100,
        description: (fd.get("description") as string) || null,
        history: (fd.get("history") as string) || null,
      });
      toast.success("Cooperativa cadastrada");
      setForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível cadastrar");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover a cooperativa "${name}"?`)) return;
    try {
      await deleteCoop.mutateAsync(id);
      toast.success("Cooperativa removida");
    } catch {
      toast.error("Remova antes os produtos e repasses vinculados a esta cooperativa");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="🤝 Quem produz"
        title="Cooperativas da Rede"
        description="Cada cooperativa é uma comunidade produtiva com história, território e produção própria."
        action={
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome ou município"
              className="w-64 rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf"
            />
            {isAdmin && (
              <button
                onClick={() => setForm((v) => !v)}
                className="flex items-center gap-1.5 rounded-md bg-leaf px-3 py-2 text-[13px] text-primary-foreground"
              >
                {form ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
                {form ? "Fechar" : "Nova cooperativa"}
              </button>
            )}
          </div>
        }
      />

      {isAdmin && form && (
        <Panel title="Cadastrar cooperativa" subtitle="Território, contato e taxa de comissão da rede">
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1.5">
              <span className="label-mono">Nome</span>
              <input name="name" required className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Município</span>
              <input name="city" required className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Região</span>
              <input name="region" placeholder="Sertão, Agreste, Litoral…" className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">CNPJ</span>
              <input name="cnpj" className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Responsável</span>
              <input name="responsible_name" className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Telefone</span>
              <input name="phone" className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">E-mail</span>
              <input name="email" type="email" className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Famílias atendidas</span>
              <input name="families_reached" type="number" min="0" className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Comissão da rede (%)</span>
              <input
                name="commission_rate"
                type="number"
                step="0.5"
                min="0"
                max="100"
                defaultValue="10"
                className={inputCls}
              />
            </label>
            <label className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <span className="label-mono">Descrição</span>
              <textarea name="description" rows={2} className={inputCls} />
            </label>
            <label className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <span className="label-mono">História</span>
              <textarea name="history" rows={3} className={inputCls} />
            </label>
            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={createCoop.isPending}
                className="rounded-md bg-leaf px-4 py-2 text-[13px] text-primary-foreground disabled:opacity-60"
              >
                {createCoop.isPending ? "Salvando…" : "Cadastrar cooperativa"}
              </button>
            </div>
          </form>
        </Panel>
      )}

      {isLoading ? (
        <LoadingRows />
      ) : list.length === 0 ? (
        <EmptyState
          title="Nenhuma cooperativa cadastrada"
          description="Use o botão “Nova cooperativa” para começar a montar a rede."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const count = (products ?? []).filter((p) => p.cooperative_id === c.id).length;
            const value = (settlements ?? [])
              .filter((s) => s.cooperative_id === c.id)
              .reduce((a, s) => a + Number(s.net_amount), 0);
            return (
              <div key={c.id} className={cn("panel rise p-5 transition-colors hover:border-leaf/40")}>
                <div className="flex items-start justify-between gap-3">
                  <Link to="/cooperativas/$id" params={{ id: c.id }} className="min-w-0">
                    <h2 className="text-[17px] leading-tight font-semibold">{c.name}</h2>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      📍 {c.city} · {c.region}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2">
                    <StatusDot status={c.status} />
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        aria-label={`Remover ${c.name}`}
                        className="grid size-7 place-items-center rounded-md border border-line text-muted-foreground hover:border-crit/40 hover:text-crit"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <Link to="/cooperativas/$id" params={{ id: c.id }} className="block">
                  <p className="mt-3 line-clamp-3 text-[12px] text-muted-foreground">
                    {c.history ?? c.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3 font-mono text-[11px]">
                    <span className="text-muted-foreground">{count} produtos</span>
                    <span className="text-leaf">{brl(value)} repassados</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
