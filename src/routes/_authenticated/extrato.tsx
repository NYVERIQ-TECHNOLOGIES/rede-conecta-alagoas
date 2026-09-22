import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useProducts, useSales, useSettlements } from "@/lib/queries";
import { brl, dateBR, num } from "@/lib/format";
import { EmptyState, PageHeader, Panel, StatCard, Tag } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/extrato")({
  head: () => ({
    meta: [
      { title: "Meu Extrato — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Extrato da cooperativa: produtos vendidos, valores e repasses recebidos.",
      },
      { property: "og:title", content: "Meu Extrato — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Transparência total para quem produz." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Extrato,
});

function Extrato() {
  const { data: user } = useCurrentUser();
  const coopId = user?.profile?.cooperative_id ?? null;
  const { data: settlements } = useSettlements();
  const { data: products } = useProducts();
  const { data: sales } = useSales();

  const rows = (settlements ?? []).filter((s) => (coopId ? s.cooperative_id === coopId : true));
  const meus = (products ?? []).filter((p) => (coopId ? p.cooperative_id === coopId : true));
  const itens = (sales ?? []).flatMap((s) =>
    s.sale_items.filter((i) => (coopId ? i.cooperative_id === coopId : true)),
  );
  const vendido = itens.reduce((a, i) => a + Number(i.total), 0);
  const liquido = itens.reduce((a, i) => a + Number(i.net_amount), 0);

  return (
    <>
      <PageHeader
        eyebrow="🧾 Extrato"
        title="Meu Extrato"
        description="Quanto sua cooperativa vendeu, quanto foi repassado e o que ainda está a caminho."
      />
      {!coopId && (
        <p className="text-[12px] text-muted-foreground">
          Perfil sem cooperativa vinculada — exibindo a visão consolidada da rede.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Vendido" value={brl(vendido)} tone="leaf" />
        <StatCard label="Líquido" value={brl(liquido)} />
        <StatCard label="Itens vendidos" value={num(itens.reduce((a, i) => a + i.quantity, 0))} />
        <StatCard label="Produtos" value={num(meus.length)} />
      </div>

      <Panel title="Repasses" padded={false}>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nenhum repasse registrado" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {rows.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 font-mono text-[12px]">
                <span className="text-muted-foreground">
                  {dateBR(s.period_start)} – {dateBR(s.period_end)}
                </span>
                <span className="text-leaf">{brl(Number(s.net_amount))}</span>
                <Tag tone={s.status === "repassado" ? "good" : s.status === "aguardando" ? "warn" : "crit"}>
                  {s.status}
                </Tag>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Meus produtos" padded={false}>
        <div className="divide-y divide-line">
          {meus.map((p) => {
            const qty = itens.filter((i) => i.product_id === p.id).reduce((a, i) => a + i.quantity, 0);
            return (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-[13px]">{p.name}</span>
                <span className="font-mono text-[12px] text-muted-foreground">{num(qty)} vendidos</span>
                <span className="font-mono text-[13px]">{brl(Number(p.price))}</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
