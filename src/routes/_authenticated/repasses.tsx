import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCooperatives, useSettlements } from "@/lib/queries";
import { brl, dateBR, num } from "@/lib/format";
import { EmptyState, PageHeader, Panel, StatCard, Tag } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/repasses")({
  head: () => ({
    meta: [
      { title: "Repasses — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Repasses às cooperativas: valores brutos, comissão da rede e valor líquido.",
      },
      { property: "og:title", content: "Repasses — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Transparência financeira com quem produz." },
    ],
  }),
  component: Repasses,
});

function Repasses() {
  const qc = useQueryClient();
  const { data: settlements } = useSettlements();
  const { data: coops } = useCooperatives();
  const [coop, setCoop] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [busy, setBusy] = useState(false);

  const rows = settlements ?? [];
  const aguardando = rows.filter((s) => s.status === "aguardando");
  const field = "rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf";

  async function generate(): Promise<void> {
    if (!coop || !start || !end) {
      toast.error("Escolha cooperativa e período.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.rpc("generate_settlement", {
      _cooperative_id: coop,
      _start: start,
      _end: end,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Repasse gerado.");
    qc.invalidateQueries({ queryKey: ["settlements"] });
  }

  async function markPaid(id: string): Promise<void> {
    const { error } = await supabase
      .from("cooperative_settlements")
      .update({ status: "repassado", paid_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Repasse confirmado.");
    qc.invalidateQueries({ queryKey: ["settlements"] });
  }

  return (
    <>
      <PageHeader
        eyebrow="💰 Financeiro"
        title="Repasses às Cooperativas"
        description="Cada real vendido volta para quem produziu, com a comissão da rede transparente."
      />

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total repassado" value={brl(rows.filter((s) => s.status === "repassado").reduce((a, s) => a + Number(s.net_amount), 0))} tone="leaf" />
        <StatCard label="Aguardando" value={brl(aguardando.reduce((a, s) => a + Number(s.net_amount), 0))} tone="clay" />
        <StatCard label="Períodos gerados" value={num(rows.length)} />
      </div>

      <Panel title="Gerar repasse">
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1.5">
            <span className="label-mono">Cooperativa</span>
            <select className={field} value={coop} onChange={(e) => setCoop(e.target.value)}>
              <option value="">Selecione</option>
              {(coops ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="label-mono">Início</span>
            <input type="date" className={field} value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className="label-mono">Fim</span>
            <input type="date" className={field} value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
          <button
            onClick={generate}
            disabled={busy}
            className="rounded-md bg-leaf px-5 py-2.5 text-[13px] font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Gerando…" : "Gerar repasse"}
          </button>
        </div>
      </Panel>

      <Panel title="Histórico de repasses" padded={false}>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nenhum repasse gerado ainda" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {rows.map((s) => (
              <div key={s.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                <div className="col-span-12 sm:col-span-4">
                  <div className="text-[13px]">{s.cooperatives?.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {dateBR(s.period_start)} – {dateBR(s.period_end)}
                  </div>
                </div>
                <div className="col-span-4 sm:col-span-2 font-mono text-[12px] text-muted-foreground">
                  bruto {brl(Number(s.gross_amount))}
                </div>
                <div className="col-span-4 sm:col-span-2 font-mono text-[12px] text-muted-foreground">
                  comissão {brl(Number(s.commission_amount))}
                </div>
                <div className="col-span-4 sm:col-span-2 font-mono text-[13px] text-leaf">
                  {brl(Number(s.net_amount))}
                </div>
                <div className="col-span-12 sm:col-span-2 flex justify-end gap-2">
                  <Tag tone={s.status === "repassado" ? "good" : s.status === "aguardando" ? "warn" : "crit"}>
                    {s.status}
                  </Tag>
                  {s.status === "aguardando" && (
                    <button
                      onClick={() => markPaid(s.id)}
                      className="rounded-md border border-leaf/40 px-3 py-1 font-mono text-[11px] text-leaf hover:bg-leaf/10"
                    >
                      Confirmar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
