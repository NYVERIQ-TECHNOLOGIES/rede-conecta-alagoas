import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useSettlements } from "@/lib/queries";
import { brl, dateBR, num } from "@/lib/format";
import { EmptyState, LoadingRows, MetricCard, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/cooperativa/valores-receber")({
  head: () => ({
    meta: [
      { title: "Valores a Receber — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Repasses pendentes da sua cooperativa, com períodos e vencimentos.",
      },
      { property: "og:title", content: "Valores a Receber — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: ValoresReceber,
});

function ValoresReceber() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: settlements, isLoading } = useSettlements();

  const pending = useMemo(
    () =>
      (settlements ?? [])
        .filter((s) => s.cooperative_id === coopId && s.status === "aguardando")
        .sort((a, b) => (a.due_date ?? a.period_end).localeCompare(b.due_date ?? b.period_end)),
    [settlements, coopId],
  );

  const total = pending.reduce((a, s) => a + Number(s.net_amount), 0);

  if (isLoading) {
    return <LoadingRows rows={5} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para ver seus valores a receber."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="🪙 Financeiro"
        title="Valores a Receber"
        description="Repasses aguardando pagamento pela rede. O valor é o líquido, já descontada a comissão."
      />

      <MetricCard
        label="Total a receber"
        value={brl(total)}
        hint={`${num(pending.length)} períodos aguardando pagamento`}
        tone="clay"
      />

      <Panel title={`Repasses pendentes (${num(pending.length)})`} padded={false}>
        {pending.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Nada a receber"
              description="Todos os períodos foram repassados ou cancelados."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {pending.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[12px]">
                    {dateBR(s.period_start)} – {dateBR(s.period_end)}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    vencimento {dateBR(s.due_date)}
                    {s.due_date && s.due_date < new Date().toISOString().slice(0, 10)
                      ? " · vencido"
                      : ""}
                  </div>
                </div>
                <div className="hidden font-mono text-[11px] text-muted-foreground sm:block">
                  comissão {brl(Number(s.commission_amount))}
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[14px] font-semibold text-leaf">
                    {brl(Number(s.net_amount))}
                  </span>
                  <Tag tone="warn">{s.status}</Tag>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
