"use client";
import { Progress } from "./ui/progress";
import { formatCurrency } from "@/lib/utils";

interface Props {
  items: { id: string; category: string; budget: number; spent: number; utilization: number; alertAt: number; exceeded: boolean }[];
}

export function BudgetProgress({ items }: Props) {
  return (
    <div className="space-y-3.5">
      {items.map((b) => {
        const pct = Math.min(b.utilization * 100, 100);
        const tone = b.exceeded ? "bg-red-500" : pct > b.alertAt * 100 ? "bg-amber-500" : "bg-emerald-500";
        return (
          <div key={b.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm gap-2">
              <span className="font-medium truncate">{b.category}</span>
              <span className="text-muted-foreground number text-[11px] sm:text-xs shrink-0">
                {formatCurrency(b.spent)} / {formatCurrency(b.budget)}
              </span>
            </div>
            <Progress value={pct} indicatorClassName={tone} />
            <div className="text-[10px] text-muted-foreground flex justify-between">
              <span>{Math.round(b.utilization * 100)}% used</span>
              {b.exceeded && <span className="text-red-500">Over budget</span>}
            </div>
          </div>
        );
      })}
      {items.length === 0 && <p className="text-sm text-muted-foreground">No budgets yet.</p>}
    </div>
  );
}
