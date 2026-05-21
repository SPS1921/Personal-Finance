import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const body = await req.json();
  const d = await prisma.debt.update({ where: { id, userId: user.id } as any, data: body });
  return NextResponse.json(d);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await prisma.debt.delete({ where: { id, userId: user.id } as any });
  return NextResponse.json({ ok: true });
}
