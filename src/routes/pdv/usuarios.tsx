import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser, ROLE_LABELS } from "@/lib/session";
import { useUsers } from "@/lib/queries";
import { dateTimeBR, num } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/pdv/usuarios")({
  head: () => ({
    meta: [
      { title: "PDV · Usuários — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Usuários vinculados à loja com seus papéis na rede.",
      },
      { property: "og:title", content: "PDV · Usuários — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: UsuariosPdv,
});

function UsuariosPdv() {
  const { data: user } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const { data: rows, isLoading } = useUsers();

  const list = useMemo(
    () => (rows ?? []).filter((r) => r.profile.store_id === storeId),
    [rows, storeId],
  );

  return (
    <>
      <PageHeader
        eyebrow="Usuários"
        title="Usuários do PDV"
        description="Perfis vinculados à sua loja e seus papéis. A gestão de papéis é feita na experiência de administração."
      />

      {!storeId ? (
        <EmptyState
          title="Loja não vinculada ao seu perfil"
          description="Vincule sua loja para visualizar a equipe."
        />
      ) : (
        <Panel title={`Equipe (${num(list.length)})`} padded={false}>
          {isLoading ? (
            <div className="p-5">
              <LoadingRows rows={5} />
            </div>
          ) : list.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Nenhum usuário vinculado a esta loja"
                description="Os usuários aparecem aqui quando o perfil deles é vinculado à loja."
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
                      {profile.email ?? "—"} · desde {dateTimeBR(profile.created_at)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {roles.length === 0 ? (
                      <Tag tone="muted">Sem função</Tag>
                    ) : (
                      roles.map((r) => (
                        <Tag key={r} tone={r === "admin" ? "clay" : "leaf"}>
                          {ROLE_LABELS[r]}
                        </Tag>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </>
  );
}
