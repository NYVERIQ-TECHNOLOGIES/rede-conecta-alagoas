import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useUsers } from "@/lib/queries";
import { useCurrentUser, ROLE_LABELS } from "@/lib/session";
import { dateTimeBR, num } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, SearchInput, Tag } from "@/components/kit";

export const Route = createFileRoute("/cooperativa/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários da Cooperativa — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Pessoas vinculadas à sua cooperativa e os papéis que possuem na rede.",
      },
      { property: "og:title", content: "Usuários da Cooperativa — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: UsuariosCooperativa,
});

const TONES: Record<string, "good" | "warn" | "crit" | "leaf" | "clay" | "muted"> = {
  cooperativa: "leaf",
  admin: "clay",
  gerente: "good",
  operador: "good",
  consulta: "muted",
  cliente: "muted",
};

function UsuariosCooperativa() {
  const [q, setQ] = useState("");
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: rows, isLoading } = useUsers();

  const list = useMemo(
    () =>
      (rows ?? [])
        .filter((r) => r.profile.cooperative_id === coopId)
        .filter((r) => {
          if (!q) return true;
          return (
            (r.profile.full_name ?? "").toLowerCase().includes(q.toLowerCase()) ||
            (r.profile.email ?? "").toLowerCase().includes(q.toLowerCase())
          );
        }),
    [rows, q, coopId],
  );

  if (isLoading) {
    return <LoadingRows rows={6} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para listar seus usuários."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="👥 Minha Cooperativa"
        title="Usuários da Cooperativa"
        description="Pessoas que têm o perfil vinculado à sua cooperativa na rede e os papéis de acesso."
        action={
          <SearchInput value={q} onChange={setQ} placeholder="Buscar pessoa…" className="w-56" />
        }
      />

      <Panel title={`Pessoas vinculadas (${num(list.length)})`} padded={false}>
        {list.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Nenhum usuário vinculado"
              description="Quando a administração associa perfis à sua cooperativa, eles aparecem aqui."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {list.map(({ profile, roles }) => (
              <div
                key={profile.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium">{profile.full_name || "Sem nome"}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {profile.email ?? "—"}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {roles.length === 0 ? (
                    <Tag tone="muted">Sem papel</Tag>
                  ) : (
                    roles.map((r) => (
                      <Tag key={r} tone={TONES[r] ?? "muted"}>
                        {ROLE_LABELS[r]}
                      </Tag>
                    ))
                  )}
                  <span className="font-mono text-[10px] text-muted-foreground">
                    desde {dateTimeBR(profile.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
