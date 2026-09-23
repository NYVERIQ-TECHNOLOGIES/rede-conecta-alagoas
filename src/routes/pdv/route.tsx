import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ExperienceGate } from "@/components/ExperienceGate";
import { PDV_GROUPS } from "@/lib/nav";

export const Route = createFileRoute("/pdv")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
  },
  component: () => (
    <ExperienceGate experience="pdv">
      <AppShell
        groups={PDV_GROUPS}
        experience="pdv"
        tagline="Sistema do Ponto de Venda"
        homeTo="/pdv"
      >
        <Outlet />
      </AppShell>
    </ExperienceGate>
  ),
});
