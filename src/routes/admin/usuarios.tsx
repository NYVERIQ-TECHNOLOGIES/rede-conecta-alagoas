import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAddRole, useRemoveRole, useUsers } from "@/lib/queries";
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

const ALL_ROLES: AppRole[] = ["admin", "gerente", "operador", "cooperativa", "consulta", "cliente"];

function Usuarios() {
  const [q, setQ] = useState("");
  const { data: rows, isLoading } = useUsers();
  const { data: me } = useCurrentUser();
  const addRole = useAddRole();
  const removeRole = useRemoveRole();

  const list = useMemo(
    () =>
      (rows ?? []).filter(
        (r) =>
          (r.profile.full_name ?? "").toLowerCase().includes(q.toLowerCase()) ||
          (r.profile.email ?? "").toLowerCase().includes(q.toLowerCase()),
      ),
    [rows, q],
  );

  async function grant(userId: string, role: AppRole) {
    try {
      await addRole.mutateAsync({ user_id: userId, role });
      toast.success(`Papel ${ROLE_LABELS[role]} concedido`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível conceder o papel");
    }
  }

  async function revoke(userId: string, role: AppRole, isSelf: boolean) {
    if (isSelf && role === "admin") {
      toast.error("Você não pode remover seu próprio papel de administrador.");
      return;
    }
    if (!window.confirm(`Remover o papel ${ROLE_LABELS[role]}?`)) return;
    try {
      await removeRole.mutateAsync({ user_id: userId, role });
      toast.success("Papel removido");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível remover o papel");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="👤 Administração · Usuários"
        title="Usuários e Papéis"
        description="Cada pessoa na rede é associada à experiência pela qual seu papel garante acesso. Papéis são concedidos aqui."
        action={
          <SearchInput value={q} onChange={setQ} placeholder="Buscar usuário…" className="w-56" />
        }
      />

      <Panel
        title={`Usuários (${num(list.length)})`}
        subtitle="Clique em + para conceder um papel"
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
                        {profile.email ?? "—"}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {roles.map((r) => (
                        <span key={r} className="inline-flex items-center gap-1">
                          <Tag tone={r === "admin" ? "clay" : "leaf"}>{ROLE_LABELS[r]}</Tag>
                          <button
                            onClick={() => revoke(profile.id, r, isSelf)}
                            title={`Remover ${ROLE_LABELS[r]}`}
                            className="rounded-md border border-line px-1 text-[10px] text-muted-foreground hover:border-crit/40 hover:text-crit"
                          >
                            −
                          </button>
                        </span>
                      ))}
                      <span className="mx-1 w-px bg-line" />
                      {ALL_ROLES.filter((r) => !roles.includes(r)).map((r) => {
                        if (isSelf && r === "admin") return null;
                        return (
                          <button
                            key={r}
                            onClick={() => grant(profile.id, r)}
                            title={`Conceder ${ROLE_LABELS[r]}`}
                            className="rounded-md border border-dashed border-line px-1.5 py-0.5 text-[10px] text-muted-foreground hover:border-leaf hover:text-leaf"
                          >
                            + {ROLE_LABELS[r]}
                          </button>
                        );
                      })}
                      <span className="font-mono text-[10px] text-muted-foreground">
                        desde {dateTimeBR(profile.created_at)}
                      </span>
                    </div>
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

function num(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}
