import { type FormEvent, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  useCustomerAddresses,
  useCustomerProfile,
  useDeleteAddress,
  useSaveAddress,
} from "@/lib/queries";
import { EmptyState, LoadingRows, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/cliente/enderecos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Endereços — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Cadastre seus endereços para receber pedidos da rede." },
    ],
  }),
  component: Enderecos,
});

const inputCls =
  "w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf";

function Empty(v: FormDataEntryValue | null) {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function Enderecos() {
  const { data: profile, isLoading: loadingProfile } = useCustomerProfile();
  const { data: addresses, isLoading } = useCustomerAddresses();
  const save = useSaveAddress();
  const del = useDeleteAddress();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const editing = (addresses ?? []).find((a) => a.id === editingId) ?? null;
  const formOpen = adding || editingId !== null;

  function closeForm() {
    setAdding(false);
    setEditingId(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    const fd = new FormData(e.currentTarget);
    try {
      await save.mutateAsync({
        id: editingId ?? undefined,
        customer_id: profile.id,
        label: Empty(fd.get("label")),
        street: String(fd.get("street")),
        number: Empty(fd.get("number")),
        complement: Empty(fd.get("complement")),
        neighborhood: Empty(fd.get("neighborhood")),
        city: String(fd.get("city")),
        state: String(fd.get("state")),
        zip: Empty(fd.get("zip")),
        is_default: fd.get("is_default") === "on",
      });
      toast.success(editingId ? "Endereço atualizado" : "Endereço cadastrado");
      closeForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o endereço.");
    }
  }

  function handleDelete(a: { id: string; label: string | null; street: string }) {
    if (!confirm(`Remover o endereço "${a.label ?? a.street}"?`)) return;
    del.mutate(a.id, {
      onSuccess: () => toast.success("Endereço removido"),
      onError: (error) =>
        toast.error(
          error instanceof Error ? error.message : "Não foi possível remover o endereço.",
        ),
    });
  }

  if (isLoading || loadingProfile) return <LoadingRows rows={6} />;

  if (!profile) {
    return (
      <div className="space-y-4">
        <PageHeader
          eyebrow="📍 Meus endereços"
          title="Endereços"
          description="Cadastre onde você quer receber seus pedidos."
        />
        <EmptyState
          title="Complete seu perfil primeiro"
          description="Cadastre seu nome na conta antes de adicionar endereços."
        />
        <Link
          to="/cliente/conta"
          className="block text-center text-[13px] font-semibold text-leaf hover:underline"
        >
          Ir para Minha conta
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="📍 Meus endereços"
        title="Endereços"
        description="Cadastre onde você quer receber seus pedidos da rede."
        action={
          <button
            onClick={() => (formOpen ? closeForm() : (setEditingId(null), setAdding(true)))}
            className="flex items-center gap-1.5 rounded-md bg-leaf px-3 py-2 text-[13px] text-primary-foreground"
          >
            {formOpen ? (
              <>
                <X className="size-3.5" /> Fechar
              </>
            ) : (
              <>
                <Plus className="size-3.5" /> Novo endereço
              </>
            )}
          </button>
        }
      />

      {formOpen && (
        <Panel
          title={editingId !== null && editing ? "Editar endereço" : "Novo endereço"}
          action={
            editing && (
              <button
                onClick={closeForm}
                className="rounded-md border border-line px-3 py-1.5 text-[12px] text-muted-foreground"
              >
                Cancelar
              </button>
            )
          }
        >
          <form
            key={editing?.id ?? "novo"}
            onSubmit={handleSubmit}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <label className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <span className="label-mono">Identificação (opcional)</span>
              <input
                name="label"
                defaultValue={editing?.label ?? ""}
                placeholder="Casa, Trabalho…"
                className={inputCls}
              />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Rua *</span>
              <input
                name="street"
                required
                defaultValue={editing?.street ?? ""}
                className={inputCls}
              />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Número</span>
              <input name="number" defaultValue={editing?.number ?? ""} className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Complemento</span>
              <input
                name="complement"
                defaultValue={editing?.complement ?? ""}
                placeholder="Bloco, apto…"
                className={inputCls}
              />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Bairro</span>
              <input
                name="neighborhood"
                defaultValue={editing?.neighborhood ?? ""}
                className={inputCls}
              />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Cidade *</span>
              <input name="city" required defaultValue={editing?.city ?? ""} className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">UF *</span>
              <input
                name="state"
                required
                maxLength={2}
                defaultValue={editing?.state ?? ""}
                placeholder="AL"
                className={inputCls}
              />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">CEP</span>
              <input
                name="zip"
                defaultValue={editing?.zip ?? ""}
                placeholder="00000-000"
                className={inputCls}
              />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
              <input
                name="is_default"
                type="checkbox"
                defaultChecked={editing?.is_default ?? false}
                className="size-4 accent-leaf"
              />
              <span className="text-[13px]">Endereço padrão de entrega</span>
            </label>
            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={save.isPending}
                className="rounded-md bg-leaf px-5 py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-60"
              >
                {save.isPending
                  ? "Salvando…"
                  : editing
                    ? "Salvar alterações"
                    : "Cadastrar endereço"}
              </button>
            </div>
          </form>
        </Panel>
      )}

      {!formOpen &&
        (isLoading ? (
          <LoadingRows rows={4} />
        ) : (addresses ?? []).length === 0 ? (
          <EmptyState
            title="Nenhum endereço cadastrado"
            description="Adicione um endereço para receber seus pedidos em casa."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {(addresses ?? []).map((a) => (
              <div key={a.id} className="panel rise p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-leaf" />
                    <h2 className="truncate text-[15px] font-semibold">{a.label ?? "Endereço"}</h2>
                    {a.is_default && <Tag tone="leaf">Padrão</Tag>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      aria-label="Editar endereço"
                      onClick={() => {
                        setAdding(false);
                        setEditingId(a.id);
                      }}
                      className="grid size-7 place-items-center rounded-md border border-line text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      aria-label="Remover endereço"
                      onClick={() => handleDelete(a)}
                      className="grid size-7 place-items-center rounded-md border border-line text-muted-foreground hover:border-crit/40 hover:text-crit"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {a.street}, {a.number ?? "s/n"}
                  {a.complement ? ` — ${a.complement}` : ""}
                  {a.neighborhood ? ` · ${a.neighborhood}` : ""}
                  <br />
                  {a.city}/{a.state}
                  {a.zip ? ` · ${a.zip}` : ""}
                </p>
              </div>
            ))}
          </div>
        ))}
    </>
  );
}
