import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
    <section className={cn("panel rise", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 pt-4 pb-3">
          <div>
            <h2 className="text-[17px] font-semibold">{title}</h2>
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
    <div className="panel rise p-4">
      <div className="flex items-center justify-between">
        <span className="label-mono">{label}</span>
      </div>
      <div
        className={cn(
          "mt-2 font-mono text-[26px] leading-none font-semibold",
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
      <div>
        {eyebrow && <p className="label-mono">{eyebrow}</p>}
        <h1 className="mt-1 text-[30px] leading-none font-semibold">{title}</h1>
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
