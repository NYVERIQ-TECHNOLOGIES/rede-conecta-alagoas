import { createFileRoute, Link } from "@tanstack/react-router";
import { useCooperatives, useProducts } from "@/lib/queries";
import { num } from "@/lib/format";
import { EmptyState, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa do Cooperativismo — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Cooperativas por município e região de Alagoas, do sertão ao litoral.",
      },
      { property: "og:title", content: "Mapa do Cooperativismo — ALAGOAS+COOPERATIVA" },
      { property: "og:description", content: "Onde o cooperativismo alagoano produz." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Mapa,
});

function Mapa() {
  const { data: coops } = useCooperatives();
  const { data: products } = useProducts();

  const regions = new Map<string, typeof coops>();
  (coops ?? []).forEach((c) => {
    const key = c.region ?? "Outras regiões";
    regions.set(key, [...(regions.get(key) ?? []), c] as typeof coops);
  });

  return (
    <>
      <PageHeader
        eyebrow="🗺️ Territórios"
        title="Mapa do Cooperativismo"
        description="A rede organizada por região: cada território tem sua vocação produtiva."
      />
      {(coops ?? []).length === 0 ? (
        <EmptyState title="Nenhuma cooperativa cadastrada" />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {[...regions.entries()].map(([region, list]) => (
            <Panel key={region} title={region} subtitle={`${num(list?.length ?? 0)} cooperativas`} padded={false}>
              <div className="divide-y divide-line">
                {(list ?? []).map((c) => (
                  <Link
                    key={c.id}
                    to="/cooperativas/$id"
                    params={{ id: c.id }}
                    className="flex items-center justify-between px-5 py-3 hover:bg-panel-2"
                  >
                    <div>
                      <div className="text-[13px]">{c.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">📍 {c.city}</div>
                    </div>
                    <Tag tone="leaf">
                      {num((products ?? []).filter((p) => p.cooperative_id === c.id).length)} produtos
                    </Tag>
                  </Link>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
