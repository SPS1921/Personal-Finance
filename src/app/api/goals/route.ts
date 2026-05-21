import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { goalSchema } from "@/lib/validators";

export async function GET() {
  const user = await requireUser();
  const items = await prisma.goal.findMany({ where: { userId: user.id }, orderBy: { deadline: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = goalSchema.parse(await req.json());
  const g = await prisma.goal.create({ data: { ...body, userId: user.id } });
  return NextResponse.json(g, { status: 201 });
}
