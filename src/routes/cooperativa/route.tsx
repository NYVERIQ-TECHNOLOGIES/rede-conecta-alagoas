import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ExperienceGate } from "@/components/ExperienceGate";
import { COOP_GROUPS } from "@/lib/nav";

export const Route = createFileRoute("/cooperativa")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
  },
  component: () => (
    <ExperienceGate experience="cooperativa">
      <AppShell
        groups={COOP_GROUPS}
        experience="cooperativa"
        tagline="Sistema da Cooperativa"
        homeTo="/cooperativa"
      >
        <Outlet />
      </AppShell>
    </ExperienceGate>
  ),
});
