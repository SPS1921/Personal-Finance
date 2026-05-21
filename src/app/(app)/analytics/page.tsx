"use client";
import { CashflowChart, SpendByCategory } from "@/components/charts/lazy";
import { InsightCard } from "@/components/InsightCard";
import { StatsCard } from "@/components/StatsCard";
import { useApi } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownRight, PiggyBank, TrendingUp, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const { data } = useApi<any>("/api/analytics");
  const stats = data?.stats ?? {};
  const insights = data?.insights ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep view into your spending, savings, and behaviour.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Avg daily spend" value={stats.burnRate ?? 0} icon={<Activity className="h-4 w-4" />} hint="Last 30 days" />
        <StatsCard label="Savings rate" value={stats.savingsRate ?? 0} format="percent" icon={<PiggyBank className="h-4 w-4" />} />
        <StatsCard label="Vs last month" value={stats.expenseDelta ?? 0} format="percent" icon={<ArrowDownRight className="h-4 w-4" />} accent={stats.expenseDelta > 0 ? "warning" : "success"} />
        <StatsCard label="Forecast EoM" value={stats.forecastEndBalance ?? 0} icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="bento p-5 col-span-12 lg:col-span-7">
          <h3 className="text-sm font-medium mb-3">Income vs expense trend</h3>
          <CashflowChart data={data?.trend ?? []} />
        </div>
        <div className="bento p-5 col-span-12 lg:col-span-5">
          <h3 className="text-sm font-medium mb-3">Category breakdown</h3>
          <SpendByCategory data={data?.breakdown ?? []} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">AI insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {insights.map((i: any, idx: number) => <InsightCard key={idx} {...i} />)}
          {insights.length === 0 && <p className="text-sm text-muted-foreground">No insights yet.</p>}
        </div>
      </div>
    </div>
  );
}
