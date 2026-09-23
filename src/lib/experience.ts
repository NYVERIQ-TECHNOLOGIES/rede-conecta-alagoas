import type { AppRole } from "./session";

export type Experience = "admin" | "pdv" | "cooperativa" | "cliente";

/** Papéis que derivam cada experiência. O ADM mantém acesso universal. */
export const EXPERIENCE_ROLES: Record<Experience, AppRole[]> = {
  admin: ["admin", "consulta"],
  pdv: ["gerente", "operador"],
  cooperativa: ["cooperativa"],
  cliente: ["cliente"],
};

export const EXPERIENCE_LABEL: Record<Experience, string> = {
  admin: "Administração",
  pdv: "Ponto de Venda",
  cooperativa: "Cooperativa",
  cliente: "Cliente",
};

export const EXPERIENCE_TAGLINE: Record<Experience, string> = {
  admin: "Administrar e analisar toda a rede",
  pdv: "Vender e operar a loja",
  cooperativa: "Fornecer e gerenciar",
  cliente: "Comprar da rede cooperativista",
};

export const EXPERIENCE_HOME: Record<Experience, string> = {
  admin: "/admin",
  pdv: "/pdv",
  cooperativa: "/cooperativa",
  cliente: "/cliente",
};

export const EXPERIENCE_EMOJI: Record<Experience, string> = {
  admin: "👑",
  pdv: "🛒",
  cooperativa: "🌱",
  cliente: "🛍️",
};

export function hasRoleFor(experience: Experience, roles: AppRole[]) {
  return roles.some((r) => EXPERIENCE_ROLES[experience].includes(r));
}

/** Adm pode circular por todas as experiências. */
export function canAccessExperience(roles: AppRole[] | undefined | null, experience: Experience) {
  if (!roles || roles.length === 0) return false;
  if (roles.includes("admin")) return true;
  return hasRoleFor(experience, roles);
}

/** Caminho de entrada após login: prioridade admin > pdv > cooperativa > cliente. */
export function resolveHomePath(roles: AppRole[] | undefined | null): string {
  if (!roles || roles.length === 0) return "/auth";
  const order: Experience[] = ["admin", "pdv", "cooperativa", "cliente"];
  for (const exp of order) {
    if (hasRoleFor(exp, roles)) return EXPERIENCE_HOME[exp];
  }
  return "/auth";
}
