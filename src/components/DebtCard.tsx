"use client";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "./ui/progress";

interface Debt {
  id: string;
  name: string;
  type: string;
  lender?: string | null;
  outstanding: number;
  principal: any;
  emi: number;
  interestRate: number;
  payoffMonths: number;
  dueDay: number;
}

export function DebtCard({ d }: { d: Debt }) {
  const paid = Math.max(0, Number(d.principal) - d.outstanding);
  const p = Math.round((paid / Number(d.principal)) * 100);
  return (
    <div className="bento p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase text-muted-foreground tracking-wider">{d.type.replace(/_/g, " ")}</p>
          <h4 className="text-sm font-semibold mt-1">{d.name}</h4>
          {d.lender && <p className="text-[11px] text-muted-foreground">{d.lender}</p>}
        </div>
        <div className="text-right">
          <p className="number text-base font-semibold">{formatCurrency(d.outstanding)}</p>
          <p className="text-[11px] text-muted-foreground">{d.interestRate}% p.a.</p>
        </div>
      </div>
      <Progress value={p} className="mt-3" indicatorClassName="bg-rose-500" />
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>EMI {formatCurrency(d.emi)} · Day {d.dueDay}</span>
        <span>{d.payoffMonths} mo to payoff</span>
      </div>
    </div>
  );
}
