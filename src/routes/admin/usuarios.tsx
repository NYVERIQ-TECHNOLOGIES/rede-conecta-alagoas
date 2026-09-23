import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCreateUser, useSetUserRoles, useStores, useUsers } from "@/lib/queries";
import { useCurrentUser, ROLE_LABELS, type AppRole } from "@/lib/session";
import { dateTimeBR } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, SearchInput, Tag } from "@/components/kit";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Gestão de usuários e papéis da rede." },
      { property: "og:title", content: "Usuários — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Usuarios,
});

const CREATE_ROLES: { value: AppRole; label: string }[] = [
  { value: "admin", label: "Administrador da rede" },
  { value: "gerente", label: "PDV · Gerente" },
  { value: "operador", label: "PDV · Operador" },
  { value: "consulta", label: "Consulta" },
];

const PROFILE_OPTIONS: { value: AppRole; label: string }[] = [
  { value: "cliente", label: "Cliente da rede" },
  { value: "gerente", label: "PDV · Gerente" },
  { value: "operador", label: "PDV · Operador" },
  { value: "cooperativa", label: "Cooperativa" },
  { value: "consulta", label: "Consulta" },
  { value: "admin", label: "Administração (master)" },
];

const PRIORITY: Record<AppRole, number> = {
  admin: 0,
  gerente: 1,
  operador: 2,
  cooperativa: 3,
  consulta: 4,
  cliente: 5,
};

function mainRole(roles: AppRole[]): AppRole {
  return [...roles].sort((a, b) => PRIORITY[a] - PRIORITY[b])[0] ?? "cliente";
}

function Usuarios() {
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const { data: rows, isLoading } = useUsers();
  const { data: me } = useCurrentUser();
  const { data: stores } = useStores();
  const createUser = useCreateUser();

  const list = useMemo(
    () =>
      (rows ?? []).filter(
        (r) =>
          (r.profile.full_name ?? "").toLowerCase().includes(q.toLowerCase()) ||
          (r.profile.email ?? "").toLowerCase().includes(q.toLowerCase()),
      ),
    [rows, q],
  );

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const role = String(fd.get("role")) as AppRole;
    const needsStore = role === "gerente" || role === "operador";
    try {
      await createUser.mutateAsync({
        email: String(fd.get("email")),
        password: String(fd.get("password")),
        full_name: String(fd.get("full_name")),
        role,
        store_id: needsStore ? (fd.get("store_id") as string) || undefined : undefined,
      });
      toast.success("Acesso criado — o usuário já pode entrar com o e-mail e a senha definidos");
      setAdding(false);
      e.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível criar o acesso");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="👤 Administração · Usuários"
        title="Usuários e Perfis"
        description="Aqui o master define o perfil de cada pessoa na rede — troque o perfil de qualquer usuário para passá-lo para outro papel. Administradores e PDVs são cadastrados aqui; cooperativas e clientes entram pelo cadastro público."
        action={
          <div className="flex items-center gap-2">
            <SearchInput value={q} onChange={setQ} placeholder="Buscar usuário…" className="w-56" />
            <button
              onClick={() => setAdding((v) => !v)}
              className="rounded-md bg-leaf px-3 py-2 text-[13px] text-primary-foreground"
            >
              {adding ? "Fechar" : "+ Novo acesso"}
            </button>
          </div>
        }
      />

      {adding && (
        <Panel
          title="Cadastrar acesso — PDV e administração"
          subtitle="O usuário entra com o e-mail/senha definidos aqui (sem confirmação de e-mail)"
        >
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1.5">
              <span className="label-mono">Nome completo</span>
              <input
                name="full_name"
                required
                className="w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf"
              />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">E-mail</span>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf"
              />
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Perfil</span>
              <select
                name="role"
                defaultValue="operador"
                className="w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf"
              >
                {CREATE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Loja (PDV)</span>
              <select
                name="store_id"
                className="w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf"
              >
                <option value="">— Sem vínculo —</option>
                {(stores ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.city}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="label-mono">Senha (mín. 6)</span>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={createUser.isPending}
                className="rounded-md bg-leaf px-4 py-2 text-[13px] text-primary-foreground disabled:opacity-60"
              >
                {createUser.isPending ? "Criando…" : "Cadastrar acesso"}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground sm:col-span-2 lg:col-span-2">
              Perfis de PDV (gerente/operador) devem estar vinculados a uma loja. Perfis de
              administrador não exigem loja.
            </p>
          </form>
        </Panel>
      )}

      <Panel
        title={`Usuários (${num(list.length)})`}
        subtitle="Defina o perfil de cada usuário para controlar a experiência e o acesso"
        padded={false}
      >
        {isLoading ? (
          <div className="p-5">
            <LoadingRows rows={7} />
          </div>
        ) : list.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nenhum usuário encontrado" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {list.map(({ profile, roles }) => {
              const isSelf = profile.id === me?.userId;
              return (
                <div key={profile.id} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium">
                        {profile.full_name || "Sem nome"}
                        {isSelf ? (
                          <span className="ml-1.5 text-[11px] text-leaf">(você)</span>
                        ) : null}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {profile.email ?? "—"} · desde {dateTimeBR(profile.created_at)}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {roles.map((r) => (
                          <Tag key={r} tone={r === "admin" ? "clay" : "leaf"}>
                            {ROLE_LABELS[r]}
                          </Tag>
                        ))}
                      </div>
                    </div>
                    <ProfileSetter
                      userId={profile.id}
                      roles={roles}
                      stores={stores ?? []}
                      isSelf={isSelf}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </>
  );
}

function ProfileSetter({
  userId,
  roles,
  stores,
  isSelf,
}: {
  userId: string;
  roles: AppRole[];
  stores: { id: string; name: string; city: string }[];
  isSelf: boolean;
}) {
  const setUserRoles = useSetUserRoles();
  const [role, setRole] = useState<AppRole>(mainRole(roles));
  const [storeId, setStoreId] = useState("");

  const needsStore = role === "gerente" || role === "operador";
  const current = mainRole(roles);
  const changed = role !== current || (needsStore && storeId.trim() !== "");

  async function apply() {
    try {
      await setUserRoles.mutateAsync({
        user_id: userId,
        role,
        store_id: needsStore ? storeId || undefined : undefined,
      });
      toast.success(`Perfil do usuário definido como ${ROLE_LABELS[role]}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível definir o perfil");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as AppRole)}
        disabled={isSelf}
        title={
          isSelf ? "Você não pode alterar o próprio perfil de administração" : "Definir perfil"
        }
        className="rounded-md border border-line bg-panel-2 px-2.5 py-1.5 text-[12px] outline-none focus:border-leaf disabled:opacity-60"
      >
        {PROFILE_OPTIONS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      {needsStore && (
        <select
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="rounded-md border border-line bg-panel-2 px-2.5 py-1.5 text-[12px] outline-none focus:border-leaf"
        >
          <option value="">Loja…</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.city}
            </option>
          ))}
        </select>
      )}
      <button
        onClick={apply}
        disabled={!changed || setUserRoles.isPending}
        className="rounded-md border border-leaf bg-leaf/10 px-3 py-1.5 text-[12px] text-leaf hover:bg-leaf/20 disabled:opacity-40"
      >
        {setUserRoles.isPending ? "Salvando…" : "Definir perfil"}
      </button>
    </div>
  );
}

function num(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}
