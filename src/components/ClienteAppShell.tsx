import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import logoBlue from "@/assets/logo-azul.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/session";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const LINKS: { to: string; label: string }[] = [
  { to: "/cliente", label: "Início" },
  { to: "/cliente/produtos", label: "Produtos" },
  { to: "/cliente/cooperativas", label: "Cooperativas" },
  { to: "/cliente/lojas", label: "Lojas" },
  { to: "/cliente/pedidos", label: "Meus pedidos" },
];

export function ClienteAppShell({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser();
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = (user?.profile?.full_name || user?.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-gold/40 bg-card shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
            className="grid size-9 place-items-center rounded-md border border-line text-muted-foreground lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>

          <Link to="/cliente" className="flex items-center gap-2.5">
            <img src={logoBlue.url} alt="Alagoas+Cooperativa" className="h-10 w-auto" />
            <div className="label-mono text-[10px] leading-tight">
              Compre
              <br />
              Coop
            </div>
          </Link>

          <nav className="hidden items-center gap-1 text-[13px] font-medium lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-md px-3 py-2 transition-colors",
                  pathname === l.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-panel-2 hover:text-primary",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <form
            className="relative hidden min-w-0 flex-1 max-w-md md:block"
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
              className="w-full rounded-full border border-line bg-background py-2 pr-4 pl-9 text-[13px] outline-none focus:border-leaf"
            />
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/cliente/carrinho"
              className="relative grid size-10 place-items-center rounded-full border border-line text-primary transition-colors hover:border-leaf"
              aria-label="Carrinho"
            >
              <ShoppingCart className="size-4" />
              {cart.count > 0 && (
                <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-clay text-[10px] font-bold text-primary-foreground">
                  {cart.count}
                </span>
              )}
            </Link>
            <Link
              to="/cliente/conta"
              className="grid size-10 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground"
              aria-label="Minha conta"
            >
              {initials}
            </Link>
            <button
              onClick={signOut}
              aria-label="Sair"
              className="hidden size-10 place-items-center rounded-full border border-line text-muted-foreground transition-colors hover:border-clay/40 hover:text-clay sm:grid"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-line px-4 py-3 lg:hidden">
            <div className="grid gap-1">
              {LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-[13px] font-medium",
                    pathname === l.to
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/cliente/conta"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-[13px] font-medium text-muted-foreground"
              >
                <User className="size-4" /> Minha conta
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
