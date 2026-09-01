export const brl = (value: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);

export const num = (value: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(value ?? 0);

export const dateBR = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("pt-BR") : "—";

export const dateTimeBR = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

export function daysUntil(date: string | null | undefined) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia!";
  if (h < 18) return "Boa tarde!";
  return "Boa noite!";
}

export type PeriodKey = "hoje" | "7d" | "30d" | "mes" | "mes_anterior";

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "hoje", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "mes", label: "Mês atual" },
  { key: "mes_anterior", label: "Mês anterior" },
];

export function periodRange(key: PeriodKey): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  switch (key) {
    case "hoje": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start, end };
    }
    case "7d":
      return { start: new Date(now.getTime() - 7 * 86_400_000), end };
    case "30d":
      return { start: new Date(now.getTime() - 30 * 86_400_000), end };
    case "mes":
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end };
    case "mes_anterior":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
      };
  }
}
