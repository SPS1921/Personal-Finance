import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getCategoryBreakdown, getDashboardStats, getInsights, getSpendTrend, getBudgetUtilization, getDebtAnalytics } from "@/lib/analytics";

export async function GET() {
  const user = await requireUser();
  const [stats, trend, breakdown, utilization, debt, insights] = await Promise.all([
    getDashboardStats(user.id),
    getSpendTrend(user.id, 30),
    getCategoryBreakdown(user.id),
    getBudgetUtilization(user.id),
    getDebtAnalytics(user.id),
    getInsights(user.id),
  ]);
  return NextResponse.json({ stats, trend, breakdown, utilization, debt, insights });
}
