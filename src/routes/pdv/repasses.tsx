import { createFileRoute } from "@tanstack/react-router";
import { useSettlements } from "@/lib/queries";
import { brl, dateBR, num } from "@/lib/format";
import {
  EmptyState,
  LoadingRows,
  MetricCard,
  PageHeader,
  Panel,
  StatusDot,
} from "@/components/kit";

export const Route = createFileRoute("/pdv/repasses")({
  head: () => ({
    meta: [
      { title: "PDV · Repasses — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Repasses às cooperativas: períodos, valores brutos e situação da rede.",
      },
      { property: "og:title", content: "PDV · Repasses — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: RepassesPdv,
});

function RepassesPdv() {
  const { data: settlements, isLoading } = useSettlements();

  const rows = settlements ?? [];
  const totalBruto = rows.reduce((acc, s) => acc + Number(s.gross_amount), 0);
  const aguardando = rows
    .filter((s) => s.status === "aguardando")
    .reduce((acc, s) => acc + Number(s.net_amount), 0);

  return (
    <>
      <PageHeader
        eyebrow="Repasses"
        title="Repasses à Rede"
        description="Panorama dos repasses às cooperativas. Cada real vendido volta para quem produziu."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard
          label="Valor da rede"
          value={brl(totalBruto)}
          tone="leaf"
          hint="soma dos repasses gerados"
        />
        <MetricCard
          label="Aguardando"
          value={brl(aguardando)}
          hint="líquido a repassar"
          tone="clay"
        />
        <MetricCard label="Períodos gerados" value={num(rows.length)} hint="repasses da rede" />
      </div>

      <Panel title="Histórico de repasses" padded={false}>
        {isLoading ? (
          <div className="p-5">
            <LoadingRows rows={6} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Nenhum repasse gerado ainda"
              description="Os repasses aparecem aqui conforme os períodos forem fechados pela administração."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {rows.map((s) => (
              <div key={s.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                <div className="col-span-12 sm:col-span-4">
                  <div className="text-[13px]">{s.cooperatives?.name ?? "Cooperativa"}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {dateBR(s.period_start)} – {dateBR(s.period_end)}
                  </div>
                </div>
                <div className="col-span-4 font-mono text-[12px] text-muted-foreground sm:col-span-2">
                  bruto {brl(Number(s.gross_amount))}
                </div>
                <div className="col-span-4 font-mono text-[12px] text-muted-foreground sm:col-span-2">
                  comissão {brl(Number(s.commission_amount))}
                </div>
                <div className="col-span-4 font-mono text-[13px] text-leaf sm:col-span-2">
                  {brl(Number(s.net_amount))}
                </div>
                <div className="col-span-12 flex justify-end sm:col-span-2">
                  <StatusDot status={s.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
