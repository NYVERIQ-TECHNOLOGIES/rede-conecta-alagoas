import { createFileRoute } from "@tanstack/react-router";
import { useCategories, useCooperatives, useStores } from "@/lib/queries";
import { useCurrentUser } from "@/lib/session";
import { num } from "@/lib/format";
import { PageHeader, Panel, StatusDot, Tag } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Perfis de acesso, lojas, categorias e parâmetros da rede cooperativista.",
      },
      { property: "og:title", content: "Configurações — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Administração da rede em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const { data: user } = useCurrentUser();
  const { data: stores } = useStores();
  const { data: coops } = useCooperatives();
  const { data: categories } = useCategories();

  return (
    <>
      <PageHeader
        eyebrow="⚙️ Administração"
        title="Configurações"
        description="Parâmetros da rede, perfis de acesso e estrutura de lojas."
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="Sua conta">
          <dl className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nome</dt>
              <dd>{user?.profile?.full_name ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">E-mail</dt>
              <dd className="font-mono text-[12px]">{user?.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Perfis</dt>
              <dd className="flex gap-1.5">
                {(user?.roles ?? []).map((r) => (
                  <Tag key={r} tone="leaf">
                    {r}
                  </Tag>
                ))}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel title="Perfis de acesso" subtitle="Definidos por papel, nunca no perfil do usuário">
          <ul className="space-y-2 text-[13px] text-muted-foreground">
            <li>👑 Administrador — acesso total à rede</li>
            <li>🏪 Gerente de Loja — operação da sua unidade</li>
            <li>🛒 Operador de Caixa — PDV e consultas</li>
            <li>🤝 Cooperativa — extrato e produtos próprios</li>
            <li>👁️ Consulta — visualização institucional</li>
          </ul>
        </Panel>
      </div>

      <Panel title="Lojas" padded={false}>
        <div className="divide-y divide-line">
          {(stores ?? []).map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <div className="text-[13px]">{s.name}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{s.address}</div>
              </div>
              <StatusDot status={s.status} />
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title={`Categorias (${num(categories?.length ?? 0)})`}>
          <div className="flex flex-wrap gap-1.5">
            {(categories ?? []).map((c) => (
              <Tag key={c.id}>
                {c.emoji} {c.name}
              </Tag>
            ))}
          </div>
        </Panel>
        <Panel title={`Cooperativas (${num(coops?.length ?? 0)})`}>
          <div className="space-y-2 text-[13px]">
            {(coops ?? []).map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span>{c.name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  comissão {(Number(c.commission_rate) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
