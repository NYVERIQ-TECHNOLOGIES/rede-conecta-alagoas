import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Store } from "lucide-react";
import { useStores } from "@/lib/queries";
import { EmptyState, LoadingRows, PageHeader, StatusDot } from "@/components/kit";

export const Route = createFileRoute("/cliente/lojas")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lojas — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Pontos de retirada e entrega da rede cooperativista." },
      { property: "og:title", content: "Lojas — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Lojas,
});

function Lojas() {
  const { data: stores, isLoading } = useStores();

  return (
    <>
      <PageHeader
        eyebrow="🏬 Pontos de retirada"
        title="Lojas da rede"
        description="Escolha a loja mais próxima para retirar seus pedidos da rede cooperativista."
        action={<Store className="size-5 text-muted-foreground" />}
      />

      {isLoading ? (
        <LoadingRows rows={6} />
      ) : (stores ?? []).length === 0 ? (
        <EmptyState
          title="Nenhuma loja cadastrada"
          description="As lojas da rede aparecem aqui quando forem ativadas."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(stores ?? []).map((s) => (
            <div key={s.id} className="panel rise p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[17px] leading-tight font-semibold">{s.name}</h2>
                <StatusDot status={s.status} />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <MapPin className="size-3.5 shrink-0 text-leaf" /> {s.city}
              </p>
              {s.address && (
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0 text-leaf" /> {s.address}
                </p>
              )}
              {s.opening_hours && (
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <Clock className="size-3.5 shrink-0 text-leaf" /> {s.opening_hours}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
