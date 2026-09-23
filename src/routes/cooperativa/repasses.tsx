import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useSettlements } from "@/lib/queries";
import { brl, dateBR, num } from "@/lib/format";
import { EmptyState, LoadingRows, MetricCard, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/cooperativa/repasses")({
  head: () => ({
    meta: [
      { title: "Repasses — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Repasses da rede para a sua cooperativa: valores brutos, comissão e líquido.",
      },
      { property: "og:title", content: "Repasses — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Repasses,
});

function settlementTone(status: string): "good" | "warn" | "crit" {
  if (status === "repassado") return "good";
  if (status === "aguardando") return "warn";
  return "crit";
}

function Repasses() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: settlements, isLoading } = useSettlements();

  const rows = useMemo(
    () => (settlements ?? []).filter((s) => s.cooperative_id === coopId),
    [settlements, coopId],
  );

  const gross = rows.reduce((a, s) => a + Number(s.gross_amount), 0);
  const commission = rows.reduce((a, s) => a + Number(s.commission_amount), 0);
  const net = rows.reduce((a, s) => a + Number(s.net_amount), 0);
  const pending = rows
    .filter((s) => s.status === "aguardando")
    .reduce((a, s) => a + Number(s.net_amount), 0);

  if (isLoading) {
    return <LoadingRows rows={5} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para acompanhar seus repasses."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="💰 Financeiro"
        title="Repasses da Rede"
        description="Cada período comercializado gera um repasse: bruto, comissão da rede e o líquido da sua cooperativa."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Total bruto" value={brl(gross)} />
        <MetricCard label="Comissão da rede" value={brl(commission)} />
        <MetricCard label="Líquido da cooperativa" value={brl(net)} tone="leaf" />
        <MetricCard label="A receber" value={brl(pending)} tone="clay" />
      </div>

      <Panel title={`Repasses gerados (${num(rows.length)})`} padded={false}>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Nenhum repasse gerado ainda"
              description="Os períodos comercializados serão consolidados pela rede."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {rows.map((s) => {
              const paid = s.status === "repassado" && s.paid_at != null;
              return (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[12px]">
                      {dateBR(s.period_start)} – {dateBR(s.period_end)}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      vencimento {dateBR(s.due_date)}
                      {paid && ` · pago em ${dateBR(s.paid_at)}`}
                    </div>
                  </div>
                  <div className="hidden flex-wrap gap-4 font-mono text-[11px] text-muted-foreground sm:flex">
                    <span>bruto {brl(Number(s.gross_amount))}</span>
                    <span>comissão {brl(Number(s.commission_amount))}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[14px] font-semibold text-leaf">
                      {brl(Number(s.net_amount))}
                    </span>
                    <Tag tone={settlementTone(s.status)}>{s.status}</Tag>
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
