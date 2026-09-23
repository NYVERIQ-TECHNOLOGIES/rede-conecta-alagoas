import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useStores } from "@/lib/queries";
import { EmptyState, LoadingRows, PageHeader, Panel } from "@/components/kit";

export const Route = createFileRoute("/pdv/horarios")({
  head: () => ({
    meta: [
      { title: "PDV · Horários — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Horários de abertura da loja.",
      },
      { property: "og:title", content: "PDV · Horários — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: HorariosPdv,
});

function HorariosPdv() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const { data: stores, isLoading } = useStores();

  const store = (stores ?? []).find((s) => s.id === storeId);
  const raw = store?.opening_hours ?? "";
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="Horários"
        title="Horários de Abertura"
        description="Horários de funcionamento da loja, cadastrados pela administração."
      />

      {userLoading || isLoading ? (
        <LoadingRows rows={4} />
      ) : !storeId ? (
        <EmptyState
          title="Loja não vinculada ao seu perfil"
          description="Seu usuário não possui loja vinculada."
        />
      ) : !store ? (
        <EmptyState
          title="Loja não encontrada"
          description="A loja vinculada ao perfil não existe."
        />
      ) : lines.length === 0 ? (
        <EmptyState
          title="Horários não cadastrados"
          description="A loja ainda não possui horários de funcionamento cadastrados."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lines.map((line, i) => {
            const [day, ...rest] = line.split(":").map((p) => p.trim());
            return (
              <div key={i} className="panel rise p-4">
                <div className="label-mono">{day && rest.length ? "Abertura" : "Bloco"}</div>
                <div className="mt-2 text-[14px] font-medium">{day || line}</div>
                {rest.length > 0 && (
                  <div className="mt-1 font-mono text-[12px] text-leaf">{rest.join(":")}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
