import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuditLogs } from "@/lib/queries";
import { dateTimeBR } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, SearchInput, Tag } from "@/components/kit";

export const Route = createFileRoute("/admin/logs")({
  head: () => ({
    meta: [
      { title: "Logs / Atividades — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Trilha de auditoria das atividades na rede." },
      { property: "og:title", content: "Logs / Atividades — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Logs,
});

const ACTION_COLOR: Record<string, "good" | "warn" | "crit" | "leaf" | "muted"> = {
  venda_registrada: "good",
  pedido_criado: "leaf",
  pedido_processado: "good",
  pedido_cancelado: "crit",
  entrada_registrada: "leaf",
  transferencia_recebida: "warn",
  repasse_gerado: "good",
};

function Logs() {
  const [q, setQ] = useState("");
  const { data: logs, isLoading } = useAuditLogs();

  const list = useMemo(
    () =>
      (logs ?? []).filter(
        (l) =>
          (l.action ?? "").toLowerCase().includes(q.toLowerCase()) ||
          (l.entity ?? "").toLowerCase().includes(q.toLowerCase()),
      ),
    [logs, q],
  );

  return (
    <>
      <PageHeader
        eyebrow="📋 Administração · Logs"
        title="Atividades da Rede"
        description="Trilha de auditoria registrada em cada operação: vendas, pedidos, entradas, transferências e repasses."
        action={
          <SearchInput value={q} onChange={setQ} placeholder="Buscar ação…" className="w-56" />
        }
      />

      <Panel title={`Eventos (${list.length})`} padded={false}>
        {isLoading ? (
          <div className="p-5">
            <LoadingRows rows={8} />
          </div>
        ) : list.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Sem eventos registrados ainda" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {list.map((l) => (
              <div
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Tag tone={ACTION_COLOR[l.action] ?? "muted"}>{l.action ?? "—"}</Tag>
                  <div className="min-w-0">
                    <div className="truncate text-[13px]">{l.entity ?? "—"}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      usuário {l.user_id ? String(l.user_id).slice(0, 8) : "—"}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {dateTimeBR(l.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
