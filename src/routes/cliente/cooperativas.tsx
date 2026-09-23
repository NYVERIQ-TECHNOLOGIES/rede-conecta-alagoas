import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Users } from "lucide-react";
import { useCooperatives, useProducts } from "@/lib/queries";
import { EmptyState, LoadingRows, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/cliente/cooperativas")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cooperativas — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Cooperativas parceiras da rede de Alagoas." },
      { property: "og:title", content: "Cooperativas — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Cooperativas,
});

function Cooperativas() {
  const { data: coops, isLoading } = useCooperatives();
  const { data: products } = useProducts();

  const productCount = (cooperativeId: string) =>
    (products ?? []).filter((p) => p.cooperative_id === cooperativeId && p.status === "ativa")
      .length;

  return (
    <>
      <PageHeader
        eyebrow="🤝 Quem produz"
        title="Cooperativas da rede"
        description="Comunidades produtivas de Alagoas que abastecem a rede cooperativista."
      />

      {isLoading ? (
        <LoadingRows rows={6} />
      ) : (coops ?? []).length === 0 ? (
        <EmptyState
          title="Nenhuma cooperativa cadastrada"
          description="As cooperativas aparecem aqui assim que entrarem na rede."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(coops ?? []).map((c) => (
            <div key={c.id} className="panel rise p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[17px] leading-tight font-semibold">{c.name}</h2>
                  <p className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    {c.city}
                    {c.region ? ` · ${c.region}` : ""}
                  </p>
                </div>
                <div className="grid size-9 shrink-0 place-items-center rounded-md bg-leaf/10 text-lg">
                  🌱
                </div>
              </div>
              <p className="mt-3 line-clamp-3 text-[12px] leading-relaxed text-muted-foreground">
                {c.description ?? c.history}
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 font-mono text-[11px] text-muted-foreground">
                <Users className="size-3.5" /> {productCount(c.id)} produtos ativos
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
