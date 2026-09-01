import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCooperatives, useProducts, useSettlements } from "@/lib/queries";
import { brl } from "@/lib/format";
import { LoadingRows, PageHeader, StatusDot } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/cooperativas/")({
  head: () => ({
    meta: [
      { title: "Cooperativas — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content:
          "Cooperativas parceiras da rede alagoana: municípios, produtos e valores comercializados.",
      },
      { property: "og:title", content: "Cooperativas — ALAGOAS+COOPERATIVA" },
      {
        property: "og:description",
        content: "Quem produz na rede de comercialização cooperativista de Alagoas.",
      },
    ],
  }),
  component: Cooperativas,
});

function Cooperativas() {
  const [q, setQ] = useState("");
  const { data: coops, isLoading } = useCooperatives();
  const { data: products } = useProducts();
  const { data: settlements } = useSettlements();

  const list = (coops ?? []).filter((c) =>
    `${c.name} ${c.city} ${c.region}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        eyebrow="🤝 Quem produz"
        title="Cooperativas da Rede"
        description="Cada cooperativa é uma comunidade produtiva com história, território e produção própria."
        action={
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou município"
            className="w-64 rounded-md border border-line bg-panel-2 px-3 py-2 text-[13px] outline-none focus:border-leaf"
          />
        }
      />
      {isLoading ? (
        <LoadingRows />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const count = (products ?? []).filter((p) => p.cooperative_id === c.id).length;
            const value = (settlements ?? [])
              .filter((s) => s.cooperative_id === c.id)
              .reduce((a, s) => a + Number(s.net_amount), 0);
            return (
              <Link
                key={c.id}
                to="/cooperativas/$id"
                params={{ id: c.id }}
                className={cn("panel rise p-5 transition-colors hover:border-leaf/40")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[17px] leading-tight font-semibold">{c.name}</h2>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      📍 {c.city} · {c.region}
                    </p>
                  </div>
                  <StatusDot status={c.status} />
                </div>
                <p className="mt-3 line-clamp-3 text-[12px] text-muted-foreground">{c.story}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 font-mono text-[11px]">
                  <span className="text-muted-foreground">{count} produtos</span>
                  <span className="text-leaf">{brl(value)} repassados</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
