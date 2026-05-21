import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  const items = await prisma.importJob.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
    take: 50,
    include: { file: true, _count: { select: { transactions: true } } },
  });
  return NextResponse.json({ items });
}
