import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useCooperatives } from "@/lib/queries";
import { EmptyState, LoadingRows, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/cooperativa/responsaveis")({
  head: () => ({
    meta: [
      { title: "Responsáveis — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Responsáveis legais da sua cooperativa e como os perfis são definidos na rede.",
      },
      { property: "og:title", content: "Responsáveis — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Responsaveis,
});

function Responsaveis() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: cooperatives, isLoading } = useCooperatives();

  const coop = (cooperatives ?? []).find((c) => c.id === coopId);

  if (isLoading) {
    return <LoadingRows rows={4} />;
  }

  if (!coopId || !coop) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Peça à administração da rede para associar seu perfil à cooperativa."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="🧑‍⚖️ Minha Cooperativa"
        title="Responsáveis Legais"
        description="Quem representa juridicamente a cooperativa e como os perfis de acesso são definidos."
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="Responsável pela cooperativa">
          {coop.responsible_name ? (
            <div className="flex items-start gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-leaf/10 text-lg font-bold text-leaf">
                {coop.responsible_name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <div className="text-[15px] font-medium">{coop.responsible_name}</div>
                <div className="mt-1 text-[12px] text-muted-foreground">
                  {coop.name} · {coop.city}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground">
              Nenhum responsável cadastrado. A administração da rede pode registrar esse dado.
            </p>
          )}
        </Panel>

        <Panel title="História da cooperativa">
          {coop.history ? (
            <p className="text-[13px] leading-relaxed text-muted-foreground">{coop.history}</p>
          ) : (
            <p className="text-[12px] text-muted-foreground">
              A história da cooperativa ainda não foi cadastrada.
            </p>
          )}
          <Tag tone="muted">{coop.status}</Tag>
        </Panel>
      </div>

      <Panel title="Como os perfis funcionam">
        <div className="space-y-3 text-[13px] text-muted-foreground">
          <p>
            Cada pessoa da rede tem um <span className="font-semibold text-foreground">papel</span>{" "}
            que define a experiência que ela acessa: administração, ponto de venda, cooperativa ou
            cliente.
          </p>
          <p>
            <span className="font-semibold text-foreground">Quem define:</span> a administração da
            rede é quem associa perfis (papel <Tag tone="leaf">Cooperativa</Tag>) a esta
            cooperativa, além de registrar o responsável legal e os dados de contato.
          </p>
          <p>
            Depois que o perfil é vinculado ao{" "}
            <code className="font-mono text-[11px]">cooperative_id</code> da sua cooperativa, a
            pessoa passa a enxergar este painel gerencial com produtos, vendas e repasses exclusivos
            daqui.
          </p>
        </div>
      </Panel>
    </>
  );
}
