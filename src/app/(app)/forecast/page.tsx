"use client";
import { useState } from "react";
import { useApi } from "@/lib/fetcher";
import { ForecastChart } from "@/components/charts/lazy";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

export default function ForecastPage() {
  const [save, setSave] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [extra, setExtra] = useState(0);
  const [months, setMonths] = useState(24);
  const url = `/api/forecast?months=${months}&save=${save}&incomeGrowth=${growth / 100}&extraEmi=${extra}`;
  const { data } = useApi<any>(url);

  const last = data?.points?.[data.points.length - 1];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Forecast</h1>
        <p className="text-sm text-muted-foreground">Project your wealth under different scenarios.</p>
      </div>

      <div className="bento p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label>Save extra / month</Label>
            <Input type="number" value={save} onChange={(e) => setSave(Number(e.target.value))} />
          </div>
          <div>
            <Label>Income growth (% / yr)</Label>
            <Input type="number" value={growth} onChange={(e) => setGrowth(Number(e.target.value))} />
          </div>
          <div>
            <Label>Extra EMI / month</Label>
            <Input type="number" value={extra} onChange={(e) => setExtra(Number(e.target.value))} />
          </div>
          <div>
            <Label>Horizon (months)</Label>
            <Input type="number" value={months} onChange={(e) => setMonths(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="bento p-5">
        <ForecastChart data={data?.points ?? []} />
      </div>

      {last && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bento p-5">
            <p className="text-[11px] uppercase text-muted-foreground">Wealth at {last.month}</p>
            <p className="number text-2xl font-semibold">{formatCurrency(last.wealth)}</p>
          </div>
          <div className="bento p-5">
            <p className="text-[11px] uppercase text-muted-foreground">Liquid balance</p>
            <p className="number text-2xl font-semibold">{formatCurrency(last.balance)}</p>
          </div>
          <div className="bento p-5">
            <p className="text-[11px] uppercase text-muted-foreground">Cumulative savings</p>
            <p className="number text-2xl font-semibold">{formatCurrency(last.savings)}</p>
          </div>
          <div className="bento p-5">
            <p className="text-[11px] uppercase text-muted-foreground">Remaining debt</p>
            <p className="number text-2xl font-semibold">{formatCurrency(last.debt)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
