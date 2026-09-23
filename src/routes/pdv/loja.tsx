import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useStores } from "@/lib/queries";
import { dateBR } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, StatusDot } from "@/components/kit";

export const Route = createFileRoute("/pdv/loja")({
  head: () => ({
    meta: [
      { title: "PDV · Dados da Loja — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Informações cadastrais da loja vinculada ao perfil do usuário.",
      },
      { property: "og:title", content: "PDV · Dados da Loja — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: LojaPdv,
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label-mono text-[10px]">{label}</div>
      <div className="mt-1 text-[13px]">{value}</div>
    </div>
  );
}

function LojaPdv() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const { data: stores, isLoading } = useStores();

  const store = (stores ?? []).find((s) => s.id === storeId);

  return (
    <>
      <PageHeader
        eyebrow="Loja"
        title="Dados da Loja"
        description="Informações cadastrais da loja vinculada ao seu perfil. Somente leitura."
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
          description="A loja vinculada ao perfil não existe ou foi removida."
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title="Informações gerais">
            <div className="space-y-4">
              <Field label="Nome" value={store.name} />
              <Field label="Cidade" value={store.city} />
              <Field label="Endereço" value={store.address ?? "—"} />
              <Field label="Gerente" value={store.manager_name ?? "—"} />
            </div>
          </Panel>
          <Panel title="Operação">
            <div className="space-y-4">
              <div>
                <div className="label-mono text-[10px]">Status</div>
                <div className="mt-1.5">
                  <StatusDot status={store.status} />
                </div>
              </div>
              <div>
                <div className="label-mono text-[10px]">Horário de funcionamento</div>
                <div className="mt-1 max-w-md whitespace-pre-line text-[13px]">
                  {store.opening_hours ?? "—"}
                </div>
              </div>
              <Field label="Cadastrada em" value={dateBR(store.created_at)} />
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
