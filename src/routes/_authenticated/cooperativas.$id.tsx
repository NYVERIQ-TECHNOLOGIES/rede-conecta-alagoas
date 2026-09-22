import { createFileRoute, Link } from "@tanstack/react-router";
import { useCooperatives, useProducts, useSettlements } from "@/lib/queries";
import { brl, dateBR, num } from "@/lib/format";
import { EmptyState, PageHeader, Panel, StatCard, StatusDot, Tag } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/cooperativas/$id")({
  head: () => ({
    meta: [
      { title: "Perfil da Cooperativa — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "História, produtos e repasses de uma cooperativa parceira da rede alagoana.",
      },
      { property: "og:title", content: "Perfil da Cooperativa — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Quem produz, onde produz e quanto recebe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CooperativaDetalhe,
});

function CooperativaDetalhe() {
  const { id } = Route.useParams();
  const { data: coops } = useCooperatives();
  const { data: products } = useProducts();
  const { data: settlements } = useSettlements();

  const coop = (coops ?? []).find((c) => c.id === id);
  const items = (products ?? []).filter((p) => p.cooperative_id === id);
  const rows = (settlements ?? []).filter((s) => s.cooperative_id === id);
  const total = rows.reduce((a, s) => a + Number(s.net_amount), 0);

  return (
    <>
      <PageHeader
        eyebrow="🤝 Cooperativa"
        title={coop?.name ?? "Cooperativa"}
        description={`📍 ${coop?.city ?? ""} · ${coop?.region ?? ""}`}
        action={
          <Link to="/cooperativas" className="font-mono text-[12px] text-leaf">
            ← Todas as cooperativas
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Repassado" value={brl(total)} tone="leaf" />
        <StatCard label="Produtos" value={num(items.length)} />
        <StatCard label="Famílias" value={num(coop?.families_reached ?? 0)} />
        <StatCard
          label="Situação"
          value={<StatusDot status={coop?.status ?? "pendente"} />}
          hint={`Comissão da rede: ${((coop?.commission_rate ?? 0) * 100).toFixed(0)}%`}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel title="História" className="lg:col-span-2">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {coop?.history ?? coop?.description ?? "História ainda não cadastrada."}
          </p>
        </Panel>
        <Panel title="Contato">
          <dl className="space-y-3 text-[13px]">
            <div>
              <dt className="label-mono">Responsável</dt>
              <dd>{coop?.responsible_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="label-mono">Telefone</dt>
              <dd className="font-mono">{coop?.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="label-mono">E-mail</dt>
              <dd className="font-mono break-all">{coop?.email ?? "—"}</dd>
            </div>
          </dl>
        </Panel>
      </div>

      <Panel title="Produtos" padded={false}>
        {items.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nenhum produto cadastrado" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {items.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div className="text-[13px]">
                  {p.product_categories?.emoji} {p.name}
                </div>
                <span className="font-mono text-[12px] text-leaf">{brl(Number(p.price))}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Repasses" padded={false}>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nenhum repasse gerado" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {rows.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3 font-mono text-[12px]">
                <span className="text-muted-foreground">
                  {dateBR(s.period_start)} – {dateBR(s.period_end)}
                </span>
                <span>{brl(Number(s.net_amount))}</span>
                <Tag tone={s.status === "repassado" ? "good" : s.status === "aguardando" ? "warn" : "crit"}>
                  {s.status}
                </Tag>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
