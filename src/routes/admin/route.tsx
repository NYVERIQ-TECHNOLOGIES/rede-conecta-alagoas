import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ExperienceGate } from "@/components/ExperienceGate";
import { ADMIN_GROUPS } from "@/lib/nav";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <ExperienceGate experience="admin">
      <AppShell groups={ADMIN_GROUPS} experience="admin">
        <Outlet />
      </AppShell>
    </ExperienceGate>
  ),
});
