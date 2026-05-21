import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  const items = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ items });
}

export async function PATCH(req: NextRequest) {
  const user = await requireUser();
  const { id } = await req.json();
  if (id) {
    await prisma.notification.update({ where: { id, userId: user.id } as any, data: { read: true } });
  } else {
    await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
  }
  return NextResponse.json({ ok: true });
}
