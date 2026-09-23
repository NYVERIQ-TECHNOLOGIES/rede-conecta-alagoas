import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, X } from "lucide-react";
import logoBlue from "@/assets/logo-azul.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser, ROLE_LABELS } from "@/lib/session";
import {
  EXPERIENCE_HOME,
  EXPERIENCE_LABEL,
  EXPERIENCE_TAGLINE,
  type Experience,
} from "@/lib/experience";
import type { NavGroup } from "@/lib/nav";
import { cn } from "@/lib/utils";

function ExperienceSwitcher({ current }: { current: Experience }) {
  const experiences: Experience[] = ["admin", "pdv", "cooperativa", "cliente"];
  const item = (exp: Experience) => (
    <Link
      key={exp}
      to={EXPERIENCE_HOME[exp]}
      className={cn(
        "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
        exp === current
          ? "bg-primary text-primary-foreground"
          : "border border-line text-muted-foreground hover:text-foreground",
      )}
    >
      {EXPERIENCE_LABEL[exp]}
    </Link>
  );
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-card p-1.5">
      {experiences.map(item)}
    </div>
  );
}

export function AppShell({
  children,
  groups,
  tagline = "Sistema de Gestão da Rede de Comercialização Cooperativista",
  homeTo = "/admin",
  experience = "admin",
}: {
  children: ReactNode;
  groups: NavGroup[];
  tagline?: string;
  homeTo?: string;
  experience?: Experience;
}) {
  const { data: user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const roles = user?.roles ?? [];
  const visible = (item: NavGroup["items"][number]) =>
    !item.roles || item.roles.some((r) => roles.includes(r));

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
      <div className="border-b border-line px-5 pt-5 pb-5">
        <Link to={homeTo} className="flex items-center gap-2.5">
          <img src={logoBlue.url} alt="Alagoas+Cooperativa" className="h-11 w-auto" />
          <div className="label-mono text-[10px] leading-tight">
            Rede
            <br />
            Cooperativista
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 text-[13px] text-muted-foreground">
        {groups.map((group) => {
          const items = group.items.filter(visible);
          if (!items.length) return null;
          return (
            <div key={group.title} className="pb-3">
              <div className="label-mono px-3 pt-2 pb-2 text-[10px]">{group.title}</div>
              {items.map((item) => {
                const active = pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 font-medium transition-colors",
                      active
                        ? "border border-primary/10 bg-primary text-primary-foreground shadow-sm"
                        : "border border-transparent hover:bg-panel-2 hover:text-primary",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
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
          <div className="grid size-9 place-items-center rounded-full bg-primary font-bold text-[11px] text-primary-foreground">
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
        <aside className="hidden w-[260px] shrink-0 border-r border-line bg-card lg:block">
          {sidebar}
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-background/80" onClick={() => setOpen(false)} />
            <aside className="absolute top-0 left-0 h-full w-[280px] border-r border-line bg-card shadow-xl">
              {sidebar}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/20 bg-gold px-4 shadow-xs sm:px-6">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menu"
              className="grid size-9 place-items-center rounded-md border border-white/40 text-white lg:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
            <div
              className="label-mono hidden sm:block"
              style={{ color: "#ffffff" }}
              title={EXPERIENCE_TAGLINE[experience]}
            >
              {tagline}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {roles.includes("admin") && (
                <div className="hidden md:block">
                  <ExperienceSwitcher current={experience} />
                </div>
              )}
              <span className="hidden items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1 font-semibold text-[11px] text-white lg:flex">
                <span className="size-1.5 rounded-full bg-good" /> Dados reais da rede
              </span>
            </div>
          </header>
          <div className="space-y-5 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
