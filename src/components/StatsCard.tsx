"use client";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn, formatCurrency, formatCompact } from "@/lib/utils";

interface Props {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  delta?: number;
  format?: "currency" | "compact" | "percent" | "raw";
  hint?: string;
  accent?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const accentRing: Record<string, string> = {
  default: "ring-border",
  success: "ring-emerald-500/40",
  warning: "ring-amber-500/40",
  danger: "ring-red-500/40",
  info: "ring-blue-500/40",
};

export function StatsCard({ label, value, icon, delta, format = "currency", hint, accent = "default", className }: Props) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  const display =
    format === "currency" ? formatCurrency(n) :
    format === "compact" ? formatCompact(n) :
    format === "percent" ? `${Math.round(n * 100)}%` :
    String(value);

  return (
    <div className={cn("bento p-4 sm:p-5 ring-1 animate-in fade-in slide-in-from-bottom-2 duration-300", accentRing[accent], className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">{label}</span>
        {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
      </div>
      <div className="mt-2 sm:mt-3 flex items-baseline gap-2 flex-wrap">
        <span className="number text-xl sm:text-2xl font-semibold truncate">{display}</span>
        {delta != null && (
          <span className={cn("inline-flex items-center text-[11px] font-medium", delta >= 0 ? "text-emerald-500" : "text-red-500")}>
            {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(Math.round(delta * 100))}%
          </span>
        )}
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-muted-foreground truncate">{hint}</p>}
    </div>
  );
}
