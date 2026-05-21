import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { accountSchema } from "@/lib/validators";

export async function GET() {
  const user = await requireUser();
  const items = await prisma.account.findMany({ where: { userId: user.id, archived: false } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = accountSchema.parse(await req.json());
  const a = await prisma.account.create({ data: { ...body, userId: user.id } });
  return NextResponse.json(a, { status: 201 });
}
