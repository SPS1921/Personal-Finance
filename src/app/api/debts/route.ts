import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { debtSchema } from "@/lib/validators";
import { getDebtAnalytics } from "@/lib/analytics";

export async function GET() {
  const user = await requireUser();
  const data = await getDebtAnalytics(user.id);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = debtSchema.parse(await req.json());
  const d = await prisma.debt.create({ data: { ...body, userId: user.id } });
  return NextResponse.json(d, { status: 201 });
}
