import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useInventory } from "@/lib/queries";
import { dateBR, daysUntil, num } from "@/lib/format";
import {
  EmptyState,
  LoadingRows,
  MetricCard,
  PageHeader,
  Panel,
  ValidityTag,
} from "@/components/kit";

export const Route = createFileRoute("/pdv/validades")({
  head: () => ({
    meta: [
      { title: "PDV · Validades — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Lotes em estoque da loja com validade, com alertas de vencimento.",
      },
      { property: "og:title", content: "PDV · Validades — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: ValidadesPdv,
});

function ValidadesPdv() {
  const { data: user } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const { data: inventory, isLoading } = useInventory();

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        coop: string;
        batch: string | null;
        expires: string | null;
        days: number;
        qty: number;
      }
    >();
    (inventory ?? [])
      .filter((i) => (storeId ? i.store_id === storeId : false))
      .forEach((i) => {
        const days = daysUntil(i.product_batches?.expires_at ?? null);
        if (days === null || i.quantity <= 0) return;
        const key = `${i.product_id}|${i.batch_id ?? ""}`;
        const prev = map.get(key);
        if (prev) {
          prev.qty += i.quantity;
          if (days < prev.days) {
            prev.days = days;
            prev.expires = i.product_batches?.expires_at ?? null;
            prev.batch = i.product_batches?.batch_code ?? null;
          }
          return;
        }
        map.set(key, {
          name: i.products?.name ?? "Produto",
          coop: i.products?.cooperatives?.name ?? "",
          batch: i.product_batches?.batch_code ?? null,
          expires: i.product_batches?.expires_at ?? null,
          days,
          qty: i.quantity,
        });
      });
    return [...map.values()].sort((a, b) => a.days - b.days);
  }, [inventory, storeId]);

  const vencidos = grouped.filter((g) => g.days < 0);
  const proximos = grouped.filter((g) => g.days >= 0 && g.days <= 15);
  const atencao = grouped.filter((g) => g.days > 15 && g.days <= 30);

  return (
    <>
      <PageHeader
        eyebrow="Validades"
        title="Lotes e Vencimentos"
        description="Ao agrupar produtos com lote, antecipe ações para que nenhum produto seja perdido."
      />

      {!storeId ? (
        <EmptyState
          title="Loja não vinculada ao seu perfil"
          description="Vincule sua loja para monitorar validades."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              label="Vencidos"
              value={num(vencidos.length)}
              tone="clay"
              hint="lotes vencidos"
            />
            <MetricCard label="Até 15 dias" value={num(proximos.length)} hint="requer ação" />
            <MetricCard label="16 a 30 dias" value={num(atencao.length)} hint="acompanhar" />
            <MetricCard label="Total de lotes" value={num(grouped.length)} />
          </div>

          {proximos.length + vencidos.length > 0 && (
            <div className="rounded-md border border-crit/30 bg-crit/5 p-4 text-[13px]">
              Atenção: {num(vencidos.length)} lote(s) vencido(s) e {num(proximos.length)} próximo(s)
              do vencimento em até 15 dias na sua loja.
            </div>
          )}

          <Panel title="Lotes monitorados" padded={false}>
            {isLoading ? (
              <div className="p-5">
                <LoadingRows rows={6} />
              </div>
            ) : grouped.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="Nenhum lote com validade cadastrada"
                  description="Os lotes do estoque da loja aparecem aqui com a validade."
                />
              </div>
            ) : (
              <div className="divide-y divide-line">
                {grouped.map((g) => (
                  <div
                    key={`${g.name}|${g.batch}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px]">{g.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {g.coop} · lote {g.batch ?? "—"} · {dateBR(g.expires)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[12px] text-muted-foreground">
                        {num(g.qty)} un
                      </span>
                      <ValidityTag expiresAt={g.expires} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}
    </>
  );
}
