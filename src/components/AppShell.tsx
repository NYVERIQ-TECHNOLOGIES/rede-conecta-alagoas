import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser, ROLE_LABELS, type AppRole } from "@/lib/session";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  emoji: string;
  roles?: AppRole[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    title: "Operação",
    items: [
      { to: "/rede", label: "Visão da Rede", emoji: "📊" },
      { to: "/lojas", label: "Nossas Lojas", emoji: "🏪", roles: ["admin", "gerente", "consulta"] },
      { to: "/cooperativas", label: "Cooperativas", emoji: "🤝" },
      { to: "/produtos", label: "Produtos da Rede", emoji: "🛍️" },
      { to: "/estoque", label: "Estoque", emoji: "📦" },
      {
        to: "/entradas",
        label: "Entradas",
        emoji: "📥",
        roles: ["admin", "gerente", "operador"],
      },
      {
        to: "/transferencias",
        label: "Transferências",
        emoji: "🔄",
        roles: ["admin", "gerente"],
      },
      { to: "/validades", label: "Validades", emoji: "⚠️" },
    ],
  },
  {
    title: "Comercialização",
    items: [
      { to: "/pdv", label: "PDV", emoji: "🛒", roles: ["admin", "gerente", "operador"] },
      { to: "/vendas", label: "Vendas", emoji: "🧾" },
      {
        to: "/fechamento",
        label: "Fechamento de caixa",
        emoji: "🧮",
        roles: ["admin", "gerente", "operador"],
      },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { to: "/repasses", label: "Repasses", emoji: "💰", roles: ["admin", "consulta"] },
      { to: "/extrato", label: "Meu Extrato", emoji: "🧾", roles: ["cooperativa", "admin"] },
    ],
  },
  {
    title: "Inteligência",
    items: [
      { to: "/desempenho", label: "Desempenho", emoji: "📈" },
      { to: "/impacto", label: "Impacto da Rede", emoji: "🌱" },
      { to: "/mapa", label: "Mapa do Cooperativismo", emoji: "🗺️" },
      { to: "/inteligencia", label: "Assistente da Rede", emoji: "🤖" },
      { to: "/configuracoes", label: "Configurações", emoji: "⚙️", roles: ["admin"] },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const roles = user?.roles ?? [];
  const visible = (item: NavItem) => !item.roles || item.roles.some((r) => roles.includes(r));

  const initials = (user?.profile?.full_name || user?.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-5 pt-6 pb-5">
        <Link to="/rede" className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-full border border-leaf/40 bg-leaf/15 font-mono text-xs font-semibold text-leaf">
            +
          </div>
          <div className="leading-tight">
            <div className="font-display text-[15px] font-semibold tracking-tight">
              Alagoas<span className="text-leaf">+</span>Cooperativa
            </div>
            <div className="label-mono text-[10px]">Rede Cooperativista</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 text-[13px] text-muted-foreground">
        {GROUPS.map((group) => {
          const items = group.items.filter(visible);
          if (!items.length) return null;
          return (
            <div key={group.title} className="pb-3">
              <div className="label-mono px-3 pt-2 pb-2 text-[10px]">{group.title}</div>
              {items.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                      active
                        ? "border border-leaf/25 bg-leaf/10 text-foreground"
                        : "border border-transparent hover:bg-panel-2",
                    )}
                  >
                    <span className="w-4 text-center">{item.emoji}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="grid size-8 place-items-center rounded-full border border-line bg-panel-2 font-mono text-[11px] text-leaf">
            {initials}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[12px] font-medium">
              {user?.profile?.full_name || user?.email}
            </div>
            <div className="label-mono truncate text-[10px]">
              {roles[0] ? ROLE_LABELS[roles[0]] : "Sem função"}
            </div>
          </div>
          <button
            onClick={signOut}
            aria-label="Sair"
            className="grid size-8 place-items-center rounded-md border border-line text-muted-foreground hover:border-clay/40 hover:text-clay"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[248px] shrink-0 border-r border-line bg-card/60 lg:block">
          {sidebar}
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-background/80" onClick={() => setOpen(false)} />
            <aside className="absolute top-0 left-0 h-full w-[272px] border-r border-line bg-card">
              {sidebar}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-card/80 px-4 backdrop-blur sm:px-6">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menu"
              className="grid size-9 place-items-center rounded-md border border-line text-muted-foreground lg:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
            <div className="label-mono hidden sm:block">
              Sistema de Gestão da Rede de Comercialização Cooperativista
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-clay/30 bg-clay/5 px-2.5 py-1 font-mono text-[11px] text-clay sm:flex">
                <span className="size-1.5 rounded-full bg-clay" /> Dados de demonstração
              </span>
            </div>
          </header>
          <div className="space-y-5 px-4 py-6 sm:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
