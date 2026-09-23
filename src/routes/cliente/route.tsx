import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ClienteAppShell } from "@/components/ClienteAppShell";
import { ExperienceGate } from "@/components/ExperienceGate";
import { CartProvider } from "@/lib/cart";

export const Route = createFileRoute("/cliente")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
  },
  component: () => (
    <ExperienceGate experience="cliente">
      <CartProvider>
        <ClienteAppShell>
          <Outlet />
        </ClienteAppShell>
      </CartProvider>
    </ExperienceGate>
  ),
});
