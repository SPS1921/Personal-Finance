import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { incomeSchema } from "@/lib/validators";

export async function GET() {
  const user = await requireUser();
  const items = await prisma.incomeSource.findMany({ where: { userId: user.id } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = incomeSchema.parse(await req.json());
  const i = await prisma.incomeSource.create({ data: { ...body, type: body.type as any, userId: user.id } });
  return NextResponse.json(i, { status: 201 });
}
