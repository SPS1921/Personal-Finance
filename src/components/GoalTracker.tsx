"use client";
import { Progress } from "./ui/progress";
import { formatCurrency, pct } from "@/lib/utils";

interface Goal {
  id: string;
  name: string;
  emoji?: string | null;
  targetAmount: any;
  savedAmount: any;
  deadline: string | Date;
  status: string;
  monthlyTarget?: any;
}

export function GoalTracker({ goals }: { goals: Goal[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {goals.map((g) => {
        const saved = Number(g.savedAmount);
        const target = Number(g.targetAmount);
        const p = pct(saved, target);
        const monthsLeft = Math.max(0, Math.round((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
        const needed = monthsLeft > 0 ? (target - saved) / monthsLeft : 0;
        const done = g.status === "ACHIEVED" || saved >= target;
        return (
          <div key={g.id} className="bento p-4">
            <div className="flex items-center gap-2">
              <div className="text-xl">{g.emoji || "🎯"}</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{g.name}</h4>
                <p className="text-[11px] text-muted-foreground">
                  {monthsLeft}mo left · save {formatCurrency(needed)}/mo
                </p>
              </div>
              <span className={`text-xs font-medium ${done ? "text-emerald-500" : "text-muted-foreground"}`}>
                {done ? "Achieved" : `${p}%`}
              </span>
            </div>
            <Progress value={Math.min(p, 100)} className="mt-3" indicatorClassName={done ? "bg-emerald-500" : "bg-primary"} />
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground number">
              <span>{formatCurrency(saved)}</span>
              <span>{formatCurrency(target)}</span>
            </div>
          </div>
        );
      })}
      {goals.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No goals yet — set your first.</p>}
    </div>
  );
}
