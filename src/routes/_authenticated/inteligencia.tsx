import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCooperatives, useInventory, useSales, useSettlements } from "@/lib/queries";
import { brl, daysUntil } from "@/lib/format";
import { EmptyState, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/inteligencia")({
  head: () => ({
    meta: [
      { title: "Assistente da Rede — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Sugestões automáticas de reposição, validade, repasses e oportunidades da rede.",
      },
      { property: "og:title", content: "Assistente da Rede — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Inteligência cooperativa, sem competição." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Inteligencia,
});

function Inteligencia() {
  const { data: inventory } = useInventory();
  const { data: sales } = useSales();
  const { data: settlements } = useSettlements();
  const { data: coops } = useCooperatives();

  const insights = useMemo(() => {
    const out: { tone: "crit" | "warn" | "leaf" | "clay"; title: string; text: string }[] = [];

    (inventory ?? [])
      .filter((i) => i.quantity <= i.critical_quantity)
      .slice(0, 5)
      .forEach((i) =>
        out.push({
          tone: "crit",
          title: "Reposição urgente",
          text: `${i.products?.name} está crítico em ${i.stores?.name}. Solicite entrada à ${i.products?.cooperatives?.name}.`,
        }),
      );

    (inventory ?? [])
      .map((i) => ({ i, d: daysUntil(i.product_batches?.expires_at ?? null) }))
      .filter((x) => x.d !== null && x.d >= 0 && x.d <= 20 && x.i.quantity > 0)
      .slice(0, 5)
      .forEach(({ i, d }) =>
        out.push({
          tone: "warn",
          title: "Ação comercial sugerida",
          text: `${i.products?.name} vence em ${d} dias em ${i.stores?.name}. Vale destacar na vitrine ou montar um combo.`,
        }),
      );

    (settlements ?? [])
      .filter((s) => s.status === "aguardando")
      .slice(0, 5)
      .forEach((s) =>
        out.push({
          tone: "clay",
          title: "Repasse pendente",
          text: `${s.cooperatives?.name} aguarda ${brl(Number(s.net_amount))}. Confirme o pagamento em Repasses.`,
        }),
      );

    const sold = new Set(
      (sales ?? []).flatMap((s) => s.sale_items.map((i) => i.cooperative_id)),
    );
    (coops ?? [])
      .filter((c) => !sold.has(c.id))
      .slice(0, 3)
      .forEach((c) =>
        out.push({
          tone: "leaf",
          title: "Oportunidade de apoio",
          text: `${c.name} (${c.city}) ainda não registrou vendas. Que tal dar destaque aos seus produtos?`,
        }),
      );

    return out;
  }, [inventory, sales, settlements, coops]);

  return (
    <>
      <PageHeader
        eyebrow="🤖 Assistente"
        title="Inteligência da Rede"
        description="Sugestões práticas em linguagem simples — para agir antes do problema aparecer."
      />
      <Panel title="Sugestões de hoje" padded={false}>
        {insights.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Tudo em ordem por aqui" description="Nenhuma ação urgente identificada." />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {insights.map((s, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <Tag tone={s.tone}>{s.title}</Tag>
                <p className="text-[13px] text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
