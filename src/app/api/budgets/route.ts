import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { budgetSchema } from "@/lib/validators";
import { getBudgetUtilization } from "@/lib/analytics";

export async function GET() {
  const user = await requireUser();
  const data = await getBudgetUtilization(user.id);
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = budgetSchema.parse(await req.json());
  const b = await prisma.budget.upsert({
    where: { userId_category_period: { userId: user.id, category: body.category as any, period: body.period } },
    create: { userId: user.id, category: body.category as any, amount: body.amount, period: body.period, alertAt: body.alertAt, rollover: body.rollover },
    update: { amount: body.amount, alertAt: body.alertAt, rollover: body.rollover },
  });
  return NextResponse.json(b, { status: 201 });
}
