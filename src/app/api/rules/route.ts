import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { invalidateRulesCache } from "@/lib/categorization";
import { z } from "zod";

const ruleSchema = z.object({
  pattern: z.string().min(1),
  merchant: z.string().min(1),
  category: z.string(),
  priority: z.coerce.number().int().default(50),
});

export async function GET() {
  const user = await requireUser();
  const items = await prisma.merchantRule.findMany({
    where: { OR: [{ isGlobal: true }, { userId: user.id }] },
    orderBy: [{ priority: "desc" }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = ruleSchema.parse(await req.json());
  const rule = await prisma.merchantRule.create({
    data: { ...body, category: body.category as any, userId: user.id },
  });
  invalidateRulesCache();
  return NextResponse.json(rule, { status: 201 });
}
