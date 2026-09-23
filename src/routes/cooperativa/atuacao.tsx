import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useProducts } from "@/lib/queries";
import { num } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, Tag } from "@/components/kit";

export const Route = createFileRoute("/cooperativa/atuacao")({
  head: () => ({
    meta: [
      { title: "Municípios de Atuação — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Os municípios de origem e atuação dos produtos da sua cooperativa.",
      },
      { property: "og:title", content: "Municípios de Atuação — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Atuacao,
});

function Atuacao() {
  const { data: user } = useCurrentUser();
  const coopId = (user?.profile?.cooperative_id as string | undefined) ?? undefined;
  const { data: products, isLoading } = useProducts();

  const byCity = useMemo(() => {
    const map = new Map<string, NonNullable<typeof products>>();
    (products ?? [])
      .filter((p) => p.cooperative_id === coopId)
      .forEach((p) => {
        const city = p.city ?? "Município não informado";
        map.set(city, [...(map.get(city) ?? []), p]);
      });
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [products, coopId]);

  if (isLoading) {
    return <LoadingRows rows={5} />;
  }

  if (!coopId) {
    return (
      <EmptyState
        title="Cooperativa não vinculada ao seu perfil"
        description="Você precisa ter uma cooperativa associada para ver seus municípios de atuação."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="🗺️ Minha Cooperativa"
        title="Municípios de Atuação"
        description="A presença da sua cooperativa no território alagoano, a partir da origem dos seus produtos."
      />

      {byCity.length === 0 ? (
        <Panel>
          <EmptyState
            title="Nenhum produto cadastrado"
            description="Cadastre produtos informando o município de origem para mapear sua atuação."
          />
        </Panel>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {byCity.map(([city, list]) => (
            <div key={city} className="panel rise p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-[17px] font-bold text-primary">📍 {city}</h2>
                <Tag tone="leaf">{num(list.length)} produtos</Tag>
              </div>
              <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                {list.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 text-[13px]">
                    <span className="truncate">
                      {p.product_categories?.emoji} {p.name}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">{p.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
