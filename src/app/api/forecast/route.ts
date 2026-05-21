import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getDashboardStats, getDebtAnalytics } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const months = Math.min(Number(searchParams.get("months") ?? 12), 60);
  const monthlySaveBoost = Number(searchParams.get("save") ?? 0);
  const incomeGrowth = Number(searchParams.get("incomeGrowth") ?? 0);
  const extraEmi = Number(searchParams.get("extraEmi") ?? 0);

  const stats = await getDashboardStats(user.id);
  const debt = await getDebtAnalytics(user.id);

  const points: { month: string; balance: number; savings: number; debt: number; wealth: number }[] = [];
  let balance = stats.balance;
  let cumulativeSavings = 0;
  let outstanding = debt.total;
  const baseIncome = stats.income;
  const baseExpense = stats.expenses;

  for (let m = 1; m <= months; m++) {
    const income = baseIncome * Math.pow(1 + incomeGrowth / 12, m);
    const monthlyNet = income - baseExpense + monthlySaveBoost;
    balance += monthlyNet;
    cumulativeSavings += Math.max(monthlyNet, 0);

    const interest = (outstanding * (debt.items[0]?.interestRate ?? 10)) / 100 / 12;
    const payment = debt.monthlyEmi + extraEmi - interest;
    outstanding = Math.max(0, outstanding - payment);

    const d = new Date(); d.setMonth(d.getMonth() + m);
    points.push({
      month: d.toISOString().slice(0, 7),
      balance,
      savings: cumulativeSavings,
      debt: outstanding,
      wealth: balance + cumulativeSavings - outstanding,
    });
  }

  return NextResponse.json({ points, assumptions: { months, monthlySaveBoost, incomeGrowth, extraEmi } });
}
