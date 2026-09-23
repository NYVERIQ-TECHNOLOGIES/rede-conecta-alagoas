import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCustomers, useOrders } from "@/lib/queries";
import { dateBR, num } from "@/lib/format";
import { EmptyState, LoadingRows, PageHeader, Panel, SearchInput, Tag } from "@/components/kit";

export const Route = createFileRoute("/admin/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — ALAGOAS+COOPERATIVA" },
      { name: "description", content: "Gestão dos clientes da rede cooperativista." },
      { property: "og:title", content: "Clientes — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  const [q, setQ] = useState("");
  const { data: customers, isLoading } = useCustomers();
  const { data: orders } = useOrders();

  const rows = useMemo(() => {
    const list = (customers ?? []).filter(
      (c) =>
        (c.full_name ?? "").toLowerCase().includes(q.toLowerCase()) ||
        (c.email ?? "").toLowerCase().includes(q.toLowerCase()) ||
        (c.phone ?? "").includes(q),
    );
    const perCustomer = new Map<string, number>();
    (orders ?? []).forEach((o) => {
      if (o.customer_id) perCustomer.set(o.customer_id, (perCustomer.get(o.customer_id) ?? 0) + 1);
    });
    return list.map((c) => ({ c, orders: perCustomer.get(c.id) ?? 0 }));
  }, [customers, orders, q]);

  return (
    <>
      <PageHeader
        eyebrow="🛍️ Rede · Clientes"
        title="Clientes da Rede"
        description="Quem compra na rede Alagoas+Cooperativa. Clientes podem ser gerenciados, lidos e vinculados a pedidos."
        action={
          <SearchInput value={q} onChange={setQ} placeholder="Buscar cliente…" className="w-64" />
        }
      />

      <Panel title={`Clientes cadastrados (${num(rows.length)})`} padded={false}>
        {isLoading ? (
          <div className="p-5">
            <LoadingRows rows={6} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Nenhum cliente encontrado"
              description="Os clientes aparecem aqui após completarem o perfil na experiência de compra."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {rows.map(({ c, orders: n }) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium">{c.full_name || "Sem nome"}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {c.email ?? "—"} {c.phone ? ` · ${c.phone}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag tone="leaf">{num(n)} pedidos</Tag>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    desde {dateBR(c.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
