import { prisma } from "@/lib/db";
import { Category, TxnType } from "@/lib/types";
import { endOfMonth, startOfMonth, toNumber } from "./utils";

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const prevMonthEnd = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const [accounts, monthTxns, prevTxns, budgets, debts, goals] = await Promise.all([
    prisma.account.findMany({ where: { userId, archived: false } }),
    prisma.transaction.findMany({ where: { userId, occurredAt: { gte: monthStart, lte: monthEnd } } }),
    prisma.transaction.findMany({ where: { userId, occurredAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.debt.findMany({ where: { userId, isActive: true } }),
    prisma.goal.findMany({ where: { userId, status: "ACTIVE" } }),
  ]);

  const balance = accounts.reduce((s, a) => s + toNumber(a.balance), 0);
  const income = monthTxns.filter((t) => t.type === TxnType.INCOME).reduce((s, t) => s + toNumber(t.amount), 0);
  const expenses = monthTxns.filter((t) => t.type === TxnType.EXPENSE).reduce((s, t) => s + toNumber(t.amount), 0);
  const prevExpenses = prevTxns.filter((t) => t.type === TxnType.EXPENSE).reduce((s, t) => s + toNumber(t.amount), 0);
  const savings = Math.max(income - expenses, 0);
  const savingsRate = income > 0 ? savings / income : 0;
  const totalBudget = budgets.reduce((s, b) => s + toNumber(b.amount), 0);
  const remainingBudget = Math.max(totalBudget - expenses, 0);
  const debtOutstanding = debts.reduce((s, d) => s + toNumber(d.outstanding), 0);
  const emiDue = debts.reduce((s, d) => s + toNumber(d.emiAmount), 0);

  const today = now.getDate();
  const daysInMo = monthEnd.getDate();
  const burnRate = today > 0 ? expenses / today : 0;
  const forecastEndBalance = balance + (income - expenses) - burnRate * (daysInMo - today);

  return {
    balance,
    income,
    expenses,
    savings,
    savingsRate,
    totalBudget,
    remainingBudget,
    debtOutstanding,
    emiDue,
    burnRate,
    forecastEndBalance,
    expenseDelta: prevExpenses ? (expenses - prevExpenses) / prevExpenses : 0,
    accountsCount: accounts.length,
    goalsActive: goals.length,
    healthScore: computeHealthScore({ savingsRate, debtToIncome: income ? debtOutstanding / (income * 12) : 0, budgetCompliance: totalBudget ? 1 - expenses / totalBudget : 0.5 }),
  };
}

export function computeHealthScore({ savingsRate, debtToIncome, budgetCompliance }: { savingsRate: number; debtToIncome: number; budgetCompliance: number }) {
  const s = Math.max(0, Math.min(1, savingsRate)) * 40;
  const d = Math.max(0, 1 - Math.min(1, debtToIncome / 0.4)) * 30;
  const b = Math.max(0, Math.min(1, budgetCompliance)) * 30;
  return Math.round(s + d + b);
}

export async function getSpendTrend(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const txns = await prisma.transaction.findMany({
    where: { userId, occurredAt: { gte: since } },
    orderBy: { occurredAt: "asc" },
  });
  const buckets: Record<string, { date: string; income: number; expense: number; net: number }> = {};
  for (let i = 0; i <= days; i++) {
    const d = new Date(); d.setDate(d.getDate() - (days - i));
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { date: key, income: 0, expense: 0, net: 0 };
  }
  for (const t of txns) {
    const key = t.occurredAt.toISOString().slice(0, 10);
    if (!buckets[key]) continue;
    const amt = toNumber(t.amount);
    if (t.type === TxnType.INCOME) buckets[key].income += amt;
    else if (t.type === TxnType.EXPENSE) buckets[key].expense += amt;
    buckets[key].net = buckets[key].income - buckets[key].expense;
  }
  return Object.values(buckets);
}

export async function getCategoryBreakdown(userId: string) {
  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();
  const grouped = await prisma.transaction.groupBy({
    by: ["category"],
    where: { userId, type: TxnType.EXPENSE, occurredAt: { gte: monthStart, lte: monthEnd } },
    _sum: { amount: true },
  });
  return grouped
    .map((g) => ({ category: g.category as Category, amount: toNumber(g._sum.amount) }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getBudgetUtilization(userId: string) {
  const [budgets, breakdown] = await Promise.all([
    prisma.budget.findMany({ where: { userId } }),
    getCategoryBreakdown(userId),
  ]);
  const map = new Map(breakdown.map((b) => [b.category, b.amount]));
  return budgets.map((b) => {
    const spent = map.get(b.category) ?? 0;
    const amount = toNumber(b.amount);
    return {
      id: b.id,
      category: b.category,
      budget: amount,
      spent,
      remaining: Math.max(amount - spent, 0),
      utilization: amount ? spent / amount : 0,
      alertAt: b.alertAt,
      exceeded: spent > amount,
    };
  });
}

export async function getDebtAnalytics(userId: string) {
  const debts = await prisma.debt.findMany({ where: { userId, isActive: true } });
  const total = debts.reduce((s, d) => s + toNumber(d.outstanding), 0);
  const monthlyEmi = debts.reduce((s, d) => s + toNumber(d.emiAmount), 0);
  const items = debts.map((d) => {
    const outstanding = toNumber(d.outstanding);
    const emi = toNumber(d.emiAmount);
    const r = d.interestRate / 100 / 12;
    const months = r > 0 ? Math.ceil(Math.log(emi / (emi - outstanding * r)) / Math.log(1 + r)) : Math.ceil(outstanding / emi);
    return { ...d, outstanding, emi, payoffMonths: isFinite(months) && months > 0 ? months : d.tenureMonths };
  });
  return { total, monthlyEmi, items };
}

export async function getInsights(userId: string) {
  const [stats, breakdown, utilization, debt] = await Promise.all([
    getDashboardStats(userId),
    getCategoryBreakdown(userId),
    getBudgetUtilization(userId),
    getDebtAnalytics(userId),
  ]);
  const insights: { type: "positive" | "warning" | "info"; title: string; body: string }[] = [];

  if (stats.expenseDelta > 0.2) {
    insights.push({ type: "warning", title: "Spend up sharply", body: `Spending is ${Math.round(stats.expenseDelta * 100)}% above last month.` });
  } else if (stats.expenseDelta < -0.1) {
    insights.push({ type: "positive", title: "Spend down", body: `You're spending ${Math.abs(Math.round(stats.expenseDelta * 100))}% less than last month.` });
  }

  if (stats.savingsRate >= 0.3) {
    insights.push({ type: "positive", title: "Strong savings rate", body: `Saving ${Math.round(stats.savingsRate * 100)}% of income this month.` });
  } else if (stats.savingsRate < 0.1 && stats.income > 0) {
    insights.push({ type: "warning", title: "Savings rate low", body: `Only ${Math.round(stats.savingsRate * 100)}% saved. Try trimming variable categories.` });
  }

  const top = breakdown[0];
  if (top) insights.push({ type: "info", title: `${top.category} leads spend`, body: `${top.category.toLowerCase()} accounts for the largest share of your spending this month.` });

  for (const b of utilization) {
    if (b.exceeded) insights.push({ type: "warning", title: `${b.category} budget exceeded`, body: `You spent ${Math.round(b.utilization * 100)}% of the ${b.category} budget.` });
    else if (b.utilization > b.alertAt) insights.push({ type: "warning", title: `${b.category} near limit`, body: `${Math.round(b.utilization * 100)}% used.` });
  }

  if (debt.monthlyEmi > 0 && stats.income > 0 && debt.monthlyEmi / stats.income > 0.4) {
    insights.push({ type: "warning", title: "DTI high", body: `EMI consumes ${Math.round((debt.monthlyEmi / stats.income) * 100)}% of monthly income.` });
  }

  const subs = await detectSubscriptions(userId);
  if (subs.length) insights.push({ type: "info", title: "Recurring subscriptions", body: `${subs.length} active subscriptions worth ${subs.reduce((s, x) => s + x.amount, 0).toFixed(0)} / month.` });

  return insights;
}

export async function detectSubscriptions(userId: string) {
  const since = new Date(); since.setMonth(since.getMonth() - 3);
  const txns = await prisma.transaction.findMany({
    where: { userId, type: TxnType.EXPENSE, occurredAt: { gte: since } },
    orderBy: { occurredAt: "asc" },
  });
  const groups: Record<string, { merchant: string; amount: number; occurrences: Date[] }> = {};
  for (const t of txns) {
    const key = `${t.merchantKey}|${Math.round(toNumber(t.amount))}`;
    if (!groups[key]) groups[key] = { merchant: t.merchant ?? "Unknown", amount: toNumber(t.amount), occurrences: [] };
    groups[key].occurrences.push(t.occurredAt);
  }
  return Object.values(groups).filter((g) => g.occurrences.length >= 2);
}
