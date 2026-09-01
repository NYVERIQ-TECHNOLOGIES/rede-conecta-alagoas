import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface CurrentUser {
  userId: string;
  email: string | null;
  profile: Profile | null;
  roles: AppRole[];
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administração da Rede",
  gerente: "Gerente da Loja",
  operador: "Operador",
  cooperativa: "Cooperativa",
  consulta: "Consulta",
};

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async (): Promise<CurrentUser | null> => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return null;
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      return {
        userId: user.id,
        email: user.email ?? null,
        profile: profile ?? null,
        roles: (roles ?? []).map((r) => r.role as AppRole),
      };
    },
    staleTime: 30_000,
  });
}

export function hasAnyRole(user: CurrentUser | null | undefined, roles: AppRole[]) {
  if (!user) return false;
  return user.roles.some((r) => roles.includes(r));
}

export function isNetworkStaff(user: CurrentUser | null | undefined) {
  return hasAnyRole(user, ["admin", "gerente", "operador", "consulta"]);
}
