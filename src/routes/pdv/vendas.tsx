import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { useSales } from "@/lib/queries";
import { brl, dateTimeBR, num, periodRange } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, SearchInput, Tag } from "@/components/kit";

export const Route = createFileRoute("/pdv/vendas")({
  head: () => ({
    meta: [
      { title: "PDV · Vendas — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content: "Vendas da loja no mês atual, com busca por código.",
      },
      { property: "og:title", content: "PDV · Vendas — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: VendasPdv,
});

function VendasPdv() {
  const { data: user } = useCurrentUser();
  const storeId = user?.profile?.store_id as string | undefined;
  const since = periodRange("mes").start.toISOString();
  const { data: sales, isLoading } = useSales(since);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const query = q.trim();
    return (sales ?? [])
      .filter((s) => (storeId ? s.store_id === storeId : false))
      .filter((s) => {
        if (!query) return true;
        const code = String(s.code);
        const padded = `#${code.padStart(4, "0")}`;
        return padded.includes(query) || code.includes(query);
      });
  }, [sales, storeId, q]);

  const total = list.reduce((acc, s) => acc + Number(s.total), 0);

  return (
    <>
      <PageHeader
        eyebrow="Vendas"
        title="Vendas da Loja"
        description="Vendas registradas no mês atual na sua loja, com busca por código."
        action={
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Buscar por código…"
            className="w-56"
          />
        }
      />

      {!storeId ? (
        <EmptyState
          title="Loja não vinculada ao seu perfil"
          description="Vincule sua loja para visualizar as vendas."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <div className="panel p-4">
              <div className="label-mono">Vendas no mês</div>
              <div className="mt-2 font-display text-[24px] font-bold text-leaf">{brl(total)}</div>
            </div>
            <div className="panel p-4">
              <div className="label-mono">Quantidade</div>
              <div className="mt-2 font-display text-[24px] font-bold text-primary">
                {num(list.length)}
              </div>
            </div>
            <div className="panel p-4">
              <div className="label-mono">Ticket médio</div>
              <div className="mt-2 font-display text-[24px] font-bold text-primary">
                {brl(list.length ? total / list.length : 0)}
              </div>
            </div>
          </div>

          <Panel title={`Vendas (${num(list.length)})`} padded={false}>
            {isLoading ? (
              <div className="p-5">
                <LoadingRows rows={6} />
              </div>
            ) : list.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="Nenhuma venda no mês"
                  description="As vendas aparecem aqui conforme forem registradas no PDV."
                />
              </div>
            ) : (
              <div className="divide-y divide-line">
                {list.map((s) => (
                  <div key={s.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                    <div className="col-span-4 sm:col-span-3">
                      <div className="font-mono text-[12px] font-medium">
                        #{String(s.code).padStart(4, "0")}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {dateTimeBR(s.created_at)}
                      </div>
                    </div>
                    <div className="col-span-4 text-[12px] capitalize text-muted-foreground sm:col-span-3">
                      {s.payment_method}
                    </div>
                    <div className="col-span-2 font-mono text-[12px] text-muted-foreground sm:col-span-3">
                      {num(s.sale_items.length)} itens
                    </div>
                    <div className="col-span-2 flex justify-end font-mono text-[13px] font-semibold text-leaf sm:col-span-2">
                      {brl(Number(s.total))}
                    </div>
                    <div className="col-span-12 flex justify-end sm:col-span-1">
                      <Tag tone={s.status === "concluida" ? "good" : "crit"}>{s.status}</Tag>
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
