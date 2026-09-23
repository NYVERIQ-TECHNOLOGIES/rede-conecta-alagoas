import { type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarDays, Mail, MapPin, Phone, SlidersHorizontal, UserRound } from "lucide-react";
import { useCreateCustomerProfile, useCustomerProfile } from "@/lib/queries";
import { dateBR } from "@/lib/format";
import { LoadingRows, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/cliente/conta")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Minha conta — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Seus dados na rede cooperativista, endereços e preferências.",
      },
    ],
  }),
  component: Conta,
});

const inputCls =
  "w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf";

const QUICK_LINKS = [
  { to: "/cliente/enderecos", label: "Meus endereços", icon: MapPin },
  { to: "/cliente/preferencias", label: "Preferências alimentares", icon: SlidersHorizontal },
];

function Conta() {
  const { data: profile, isLoading } = useCustomerProfile();
  const save = useCreateCustomerProfile();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await save.mutateAsync({
        full_name: String(fd.get("full_name")),
        email: String(fd.get("email")),
        phone: (fd.get("phone") as string) || undefined,
        cpf: (fd.get("cpf") as string) || undefined,
      });
      toast.success("Perfil salvo com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o perfil.");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="👤 Minha conta"
        title="Minha conta"
        description="Seus dados de compra e acesso às entregas da rede."
      />

      {isLoading ? (
        <LoadingRows rows={5} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Panel
            title="Dados pessoais"
            subtitle="Usado para identificar você nos pedidos e nas entregas."
          >
            <form
              key={profile?.id ?? "novo"}
              onSubmit={handleSubmit}
              className="grid gap-3 sm:grid-cols-2"
            >
              <label className="space-y-1.5">
                <span className="label-mono">Nome completo</span>
                <input
                  name="full_name"
                  required
                  defaultValue={profile?.full_name ?? ""}
                  className={inputCls}
                />
              </label>
              <label className="space-y-1.5">
                <span className="label-mono">E-mail</span>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={profile?.email ?? ""}
                  className={inputCls}
                />
              </label>
              <label className="space-y-1.5">
                <span className="label-mono">Telefone</span>
                <input
                  name="phone"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="(00) 00000-0000"
                  className={inputCls}
                />
              </label>
              <label className="space-y-1.5">
                <span className="label-mono">CPF</span>
                <input
                  name="cpf"
                  defaultValue={profile?.cpf ?? ""}
                  placeholder="000.000.000-00"
                  className={inputCls}
                />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={save.isPending}
                  className="rounded-md bg-leaf px-5 py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {save.isPending ? "Salvando…" : "Salvar perfil"}
                </button>
              </div>
            </form>
          </Panel>

          <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
            {profile && (
              <Panel title="Resumo">
                <div className="space-y-2.5 text-[13px]">
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <UserRound className="size-4 shrink-0 text-leaf" />
                    {profile.full_name ?? "Sem nome"}
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Mail className="size-4 shrink-0 text-leaf" />
                    {profile.email ?? "—"}
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Phone className="size-4 shrink-0 text-leaf" />
                      {profile.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <CalendarDays className="size-4 shrink-0 text-leaf" />
                    desde {dateBR(profile.created_at)}
                  </div>
                  {profile.cpf && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">CPF</span>
                      <Tag tone="muted">{profile.cpf}</Tag>
                    </div>
                  )}
                </div>
              </Panel>
            )}

            <Panel title="Acesso rápido">
              <div className="grid gap-2">
                {QUICK_LINKS.map((l) => {
                  const Icon = l.icon;
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="flex items-center gap-2.5 rounded-md border border-line px-3 py-2.5 text-[13px] font-medium transition-colors hover:border-leaf hover:text-leaf"
                    >
                      <Icon className="size-4 text-leaf" /> {l.label}
                    </Link>
                  );
                })}
              </div>
            </Panel>

            {!profile && (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Salve seu perfil para agilizar o check-out e habilitar endereços de entrega.
              </p>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
