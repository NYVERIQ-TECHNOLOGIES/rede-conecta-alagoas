import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { brl, daysUntil, num, PERIODS, type PeriodKey } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, type OrderStatus } from "@/lib/domain";

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("panel rise overflow-hidden", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 pt-4 pb-3">
          <div>
            <h2 className="text-[17px] font-bold text-primary">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "leaf" | "clay";
}) {
  return (
    <div className="panel rise relative overflow-hidden p-4 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-warn">
      <div className="flex items-center justify-between">
        <span className="label-mono">{label}</span>
      </div>
      <div
        className={cn(
          "mt-3 font-display text-[26px] leading-none font-bold text-primary",
          tone === "leaf" && "text-leaf",
          tone === "clay" && "text-clay",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-2 text-[12px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-line px-6 py-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[12px] text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-md bg-panel-2" />
      ))}
    </div>
  );
}

const TONES = {
  good: "text-good border-good/30 bg-good/10",
  warn: "text-warn border-warn/30 bg-warn/10",
  crit: "text-crit border-crit/30 bg-crit/10",
  leaf: "text-leaf border-leaf/30 bg-leaf/10",
  clay: "text-clay border-clay/30 bg-clay/10",
  muted: "text-muted-foreground border-line bg-panel-2",
} as const;

export function Tag({
  tone = "muted",
  children,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px]",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 rise">
      <div className="max-w-3xl">
        {eyebrow && <p className="label-mono">{eyebrow}</p>}
        <h1 className="mt-1 text-[30px] leading-tight font-bold text-primary">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatusDot({ status }: { status: string }) {
  const tone = status === "ativa" ? "good" : status === "pendente" ? "warn" : "crit";
  const label = status === "ativa" ? "Ativa" : status === "pendente" ? "Pendente" : "Inativa";
  return (
    <Tag tone={tone}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * Componentes reutilizáveis das 4 experiências
 * ------------------------------------------------------------------ */

export function MetricCard({
  label,
  value,
  hint,
  tone = "default",
  trend,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "leaf" | "clay";
  trend?: ReactNode;
}) {
  return (
    <div className="panel rise relative overflow-hidden p-4 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-warn">
      <div className="flex items-center justify-between gap-2">
        <span className="label-mono">{label}</span>
        {trend && <span className="font-mono text-[11px] text-good">{trend}</span>}
      </div>
      <div
        className={cn(
          "mt-3 font-display text-[26px] leading-none font-bold text-primary",
          tone === "leaf" && "text-leaf",
          tone === "clay" && "text-clay",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-2 text-[12px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function PeriodFilter({
  value,
  onChange,
}: {
  value: PeriodKey;
  onChange: (key: PeriodKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 font-mono text-[12px]">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={cn(
            "rounded-md px-3 py-1.5 transition-colors",
            value === p.key
              ? "bg-leaf font-medium text-primary-foreground"
              : "border border-line text-muted-foreground hover:text-foreground",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar…",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-line bg-panel-2 py-2 pr-3 pl-9 text-[13px] outline-none focus:border-leaf"
      />
    </div>
  );
}

export function StockTag({
  quantity,
  min,
  critical,
}: {
  quantity: number;
  min: number;
  critical: number;
}) {
  const tone = quantity <= critical ? "crit" : quantity <= min ? "warn" : "good";
  const label = quantity <= critical ? "Crítico" : quantity <= min ? "Baixo" : "Saudável";
  return (
    <Tag tone={tone}>
      {num(quantity)} · {label}
    </Tag>
  );
}

export function ValidityTag({ expiresAt }: { expiresAt: string | null | undefined }) {
  const d = daysUntil(expiresAt);
  if (d === null) return <Tag tone="muted">Sem lote</Tag>;
  if (d < 0) return <Tag tone="crit">Vencido</Tag>;
  if (d <= 15) return <Tag tone="crit">Vence em {d}d</Tag>;
  if (d <= 30) return <Tag tone="warn">Vence em {d}d</Tag>;
  return <Tag tone="good">{d}d até validade</Tag>;
}

export function OrderStatusTag({ status }: { status: OrderStatus }) {
  return <Tag tone={ORDER_STATUS_TONE[status]}>{ORDER_STATUS_LABEL[status]}</Tag>;
}

export function QuickActions({
  actions,
}: {
  actions: { label: string; icon?: LucideIcon; to: string; tone?: "leaf" | "clay" }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.to}
            to={a.to}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5",
              a.tone === "clay" ? "bg-clay" : "bg-leaf",
            )}
          >
            {Icon && <Icon className="size-4" />}
            {a.label}
          </Link>
        );
      })}
    </div>
  );
}

export interface ProductData {
  id: string;
  name: string;
  price: number | string;
  image_url?: string | null;
  cooperatives?: { name: string } | null;
  product_categories?: { name: string; emoji: string | null } | null;
}

export function ProductCard({
  product,
  to,
  meta,
  action,
}: {
  product: ProductData;
  to: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="panel group rise flex flex-col overflow-hidden p-4 transition-colors hover:border-leaf/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={to} className="block text-[15px] leading-snug font-medium hover:text-leaf">
            {product.name}
          </Link>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {product.cooperatives?.name ?? "Rede cooperativista"}
          </div>
        </div>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="size-12 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="grid size-12 shrink-0 place-items-center rounded-md border border-line bg-panel-2 text-base">
            {product.product_categories?.emoji ?? "🛍️"}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="font-mono text-[17px] font-semibold text-leaf">
          {brl(Number(product.price))}
        </div>
        {meta}
      </div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Bars({
  items,
  format = (v) => String(v),
}: {
  items: { label: string; value: number }[];
  format?: (value: number) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.label}>
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-[13px]">{i.label}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{format(i.value)}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-leaf transition-all"
              style={{ width: `${Math.max(2, (i.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
