import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useCooperatives } from "@/lib/queries";
import { num } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/cooperativa/dados")({
  head: () => ({
    meta: [
      { title: "Dados da Cooperativa — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content:
          "Informações públicas da sua cooperativa na rede: identificação, contato e comissão.",
      },
      { property: "og:title", content: "Dados da Cooperativa — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: DadosCooperativa,
});

function DadosCooperativa() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: cooperatives, isLoading } = useCooperatives();

  const coop = (cooperatives ?? []).find((c) => c.id === coopId);

  if (isLoading) {
    return <LoadingRows rows={5} />;
  }

  if (!coopId || !coop) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Peça à administração da rede para associar seu perfil à cooperativa."
      />
    );
  }

  const rows: { label: string; value: string }[] = [
    { label: "Nome", value: coop.name },
    { label: "CNPJ", value: coop.cnpj ?? "—" },
    { label: "Município", value: coop.city },
    { label: "Região", value: coop.region ?? "—" },
    { label: "Telefone", value: coop.phone ?? "—" },
    { label: "E-mail", value: coop.email ?? "—" },
    {
      label: "Comissão da rede",
      value: `${(Number(coop.commission_rate) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`,
    },
    { label: "Famílias atendidas", value: num(coop.families_reached ?? 0) },
  ];

  return (
    <>
      <PageHeader
        eyebrow="🏢 Minha Cooperativa"
        title="Dados da Cooperativa"
        description="Informações públicas da sua cooperativa na rede. Alterações são feitas pela administração."
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel title={coop.name} subtitle={`${coop.city} · ${coop.region ?? "Alagoas"}`}>
          <div className="flex flex-wrap items-center gap-2">
            <Tag
              tone={coop.status === "ativa" ? "good" : coop.status === "pendente" ? "warn" : "crit"}
            >
              {coop.status}
            </Tag>
          </div>
          {coop.description && (
            <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
              {coop.description}
            </p>
          )}
        </Panel>

        <Panel title="Cadastro" className="lg:col-span-2">
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.label}>
                <div className="label-mono text-[10px]">{r.label}</div>
                <div className="mt-0.5 text-[14px]">{r.value}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
