import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { useCategories, useCooperatives, useProducts } from "@/lib/queries";
import { useCurrentUser } from "@/lib/session";
import { brl, greeting } from "@/lib/format";
import { EmptyState, LoadingRows, Tag } from "@/components/kit";

export const Route = createFileRoute("/cliente/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Início — ALAGOAS+COOPERATIVA" },
      {
        name: "description",
        content:
          "Compre direto da rede cooperativista de Alagoas. Produtos de cooperativas parceiras.",
      },
      { property: "og:title", content: "Início — ALAGOAS+COOPERATIVA" },
    ],
  }),
  component: Home,
});

type ProductView = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  unit: string;
  status: string;
  category_id: string | null;
  description: string | null;
  ingredients: string | null;
  origin: string | null;
  cooperatives?: { name: string; city: string; region: string | null } | null;
  product_categories?: { name: string; emoji: string | null } | null;
};

function ProductTile({ p }: { p: ProductView }) {
  return (
    <div className="panel group rise flex flex-col overflow-hidden p-4 transition-colors hover:border-leaf/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to="/cliente/produto/$id"
            params={{ id: p.id }}
            className="block text-[15px] leading-snug font-medium hover:text-leaf"
          >
            {p.name}
          </Link>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {p.cooperatives?.name ?? "Rede cooperativista"}
          </div>
        </div>
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            className="size-12 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="grid size-12 shrink-0 place-items-center rounded-md border border-line bg-panel-2 text-base">
            {p.product_categories?.emoji ?? "🛍️"}
          </div>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <div className="font-mono text-[17px] font-semibold text-leaf">{brl(Number(p.price))}</div>
        <Tag tone="muted">{p.unit}</Tag>
      </div>
    </div>
  );
}

function Home() {
  const { data: user } = useCurrentUser();
  const { data: products, isLoading } = useProducts();
  const { data: categories, isLoading: loadingCats } = useCategories();
  const { data: cooperatives, isLoading: loadingCoops } = useCooperatives();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const featured = useMemo(
    () => ((products ?? []) as ProductView[]).filter((p) => p.status === "ativa").slice(0, 6),
    [products],
  );

  const firstName = user?.profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";

  return (
    <>
      <section className="panel rise relative overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-6 -top-8 text-9xl opacity-10 select-none">
          🛍️
        </div>
        <p className="label-mono">Compre Coop · Rede Alagoas+Cooperativa</p>
        <h1 className="mt-2 max-w-2xl font-display text-[30px] leading-tight font-bold text-primary sm:text-[40px]">
          {greeting()} {firstName} — compre direto da rede cooperativista.
        </h1>
        <p className="mt-3 max-w-xl text-[13px] text-muted-foreground">
          Produtos de cooperativas alagoanas, direto de quem produz para o seu dia a dia.
        </p>
        <form
          className="relative mt-6 max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/cliente/produtos", search: { q: q.trim() || undefined } });
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar produtos da rede…"
            className="w-full rounded-full border border-line bg-background py-3 pr-4 pl-10 text-[14px] outline-none focus:border-leaf"
          />
        </form>
        <div className="mt-4 font-mono text-[11px] text-muted-foreground">
          {(cooperatives ?? []).length} cooperativas parceiras
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label-mono">Categorias</p>
            <h2 className="font-display text-[22px] font-bold text-primary">
              Navegue por categoria
            </h2>
          </div>
        </div>
        {loadingCats ? (
          <div className="mt-4">
            <LoadingRows rows={2} />
          </div>
        ) : (categories ?? []).length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Sem categorias por enquanto" />
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {(categories ?? []).map((c) => (
              <Link
                key={c.id}
                to="/cliente/categorias/$slug"
                params={{ slug: c.slug }}
                className="flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-leaf hover:text-leaf"
              >
                <span>{c.emoji}</span>
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label-mono">Em destaque</p>
            <h2 className="font-display text-[22px] font-bold text-primary">Produtos da rede</h2>
          </div>
          <Link
            to="/cliente/produtos"
            className="flex items-center gap-1 text-[13px] font-semibold text-leaf hover:underline"
          >
            Ver todos <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {isLoading ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <LoadingRows rows={6} />
          </div>
        ) : featured.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Nenhum produto disponível no momento"
              description="Assim que as cooperativas cadastrarem produtos, eles aparecem aqui."
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductTile key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label-mono">Quem produz</p>
            <h2 className="font-display text-[22px] font-bold text-primary">
              Cooperativas parceiras
            </h2>
          </div>
          <Link
            to="/cliente/cooperativas"
            className="flex items-center gap-1 text-[13px] font-semibold text-leaf hover:underline"
          >
            Conhecer <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {loadingCoops ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <LoadingRows rows={3} />
          </div>
        ) : (cooperatives ?? []).length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Aguardando cooperativas" />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(cooperatives ?? []).slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to="/cliente/cooperativas"
                className="panel rise flex items-start gap-3 p-4 transition-colors hover:border-leaf/40"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-md bg-leaf/10 text-lg">
                  🌱
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold">{c.name}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="size-3" /> {c.city} · {c.region}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
