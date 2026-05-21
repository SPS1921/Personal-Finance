"use client";
import { ArrowDownRight, ArrowUpRight, Wallet, PiggyBank, TrendingUp, Activity, Target, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/StatsCard";
import { CashflowChart, SpendByCategory } from "@/components/charts/lazy";
import { BudgetProgress } from "@/components/BudgetProgress";
import { GoalTracker } from "@/components/GoalTracker";
import { InsightCard } from "@/components/InsightCard";
import { FinancialHealthGauge } from "@/components/FinancialHealthGauge";
import { useApi } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { data: analytics, isLoading } = useApi<any>("/api/analytics");
  const { data: goalsData } = useApi<any>("/api/goals");
  const stats = analytics?.stats ?? {};

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bento p-5 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Good day, friend</h1>
          <p className="text-sm text-muted-foreground">Here's where your money stands this month.</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Health score</p>
          <p className="number text-3xl font-semibold">{stats.healthScore ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatsCard label="Balance" value={stats.balance ?? 0} icon={<Wallet className="h-4 w-4" />} hint="Across all accounts" />
        <StatsCard label="Income" value={stats.income ?? 0} icon={<ArrowUpRight className="h-4 w-4" />} accent="success" />
        <StatsCard label="Expenses" value={stats.expenses ?? 0} delta={stats.expenseDelta} icon={<ArrowDownRight className="h-4 w-4" />} accent={stats.expenseDelta > 0.2 ? "warning" : "default"} />
        <StatsCard label="Savings" value={stats.savings ?? 0} icon={<PiggyBank className="h-4 w-4" />} hint={`Rate ${Math.round((stats.savingsRate ?? 0) * 100)}%`} />
        <StatsCard label="Budget left" value={stats.remainingBudget ?? 0} icon={<Activity className="h-4 w-4" />} hint="This month" />
        <StatsCard label="Debt outstanding" value={stats.debtOutstanding ?? 0} icon={<CreditCard className="h-4 w-4" />} accent={stats.debtOutstanding > 0 ? "danger" : "default"} hint={`EMI ${formatCurrency(stats.emiDue ?? 0)} due`} />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bento p-5 col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium">Cashflow</h3>
              <p className="text-xs text-muted-foreground">Income vs expense · last 30 days</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">Burn rate</p>
              <p className="text-sm font-semibold number">{formatCurrency(stats.burnRate ?? 0)}/day</p>
            </div>
          </div>
          <CashflowChart data={analytics?.trend ?? []} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bento p-5 col-span-12 lg:col-span-4">
          <h3 className="text-sm font-medium mb-1">Financial health</h3>
          <p className="text-xs text-muted-foreground">Composite of savings, debt, budget compliance</p>
          <FinancialHealthGauge score={stats.healthScore ?? 0} />
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            <div className="bento p-2.5">
              <p className="text-muted-foreground">Forecast EoM</p>
              <p className="number font-semibold">{formatCurrency(stats.forecastEndBalance ?? 0)}</p>
            </div>
            <div className="bento p-2.5">
              <p className="text-muted-foreground">Goals active</p>
              <p className="number font-semibold">{stats.goalsActive ?? 0}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="bento p-5 col-span-12 lg:col-span-7">
          <h3 className="text-sm font-medium mb-3">Spend by category</h3>
          <SpendByCategory data={analytics?.breakdown ?? []} />
        </div>
        <div className="bento p-5 col-span-12 lg:col-span-5">
          <h3 className="text-sm font-medium mb-4">Budget utilization</h3>
          <BudgetProgress items={analytics?.utilization ?? []} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium flex items-center gap-2"><Target className="h-4 w-4" /> Active goals</h3>
          </div>
          <GoalTracker goals={(goalsData?.items ?? []).filter((g: any) => g.status === "ACTIVE").slice(0, 4)} />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4" /> AI insights</h3>
          {(analytics?.insights ?? []).slice(0, 5).map((i: any, idx: number) => (
            <InsightCard key={idx} {...i} />
          ))}
        </div>
      </div>
    </div>
  );
}
