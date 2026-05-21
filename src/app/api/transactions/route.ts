import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { transactionSchema } from "@/lib/validators";
import { normalizeMerchant, txnHash } from "@/lib/normalizers";

export async function GET(req: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get("take") ?? 50), 200);
  const skip = Number(searchParams.get("skip") ?? 0);
  const category = searchParams.get("category") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = { userId: user.id };
  if (category) where.category = category;
  if (type) where.type = type;
  if (q) where.merchant = { contains: q, mode: "insensitive" };
  if (from || to) {
    where.occurredAt = {};
    if (from) where.occurredAt.gte = new Date(from);
    if (to) where.occurredAt.lte = new Date(to);
  }

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({ where, orderBy: { occurredAt: "desc" }, take, skip, include: { account: true } }),
    prisma.transaction.count({ where }),
  ]);
  return NextResponse.json({ items, total });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = await req.json();
  const parsed = transactionSchema.parse(body);
  const { name: merchant, key: merchantKey } = normalizeMerchant(parsed.merchant);
  const t = {
    occurredAt: parsed.occurredAt,
    amount: parsed.amount,
    type: parsed.type,
    merchant,
    merchantKey,
    category: parsed.category as any,
    paymentMode: parsed.paymentMode,
    confidence: 1,
  };
  const txn = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: parsed.accountId,
      type: parsed.type as any,
      amount: parsed.amount,
      category: parsed.category as any,
      merchant,
      merchantKey,
      notes: parsed.notes,
      paymentMode: parsed.paymentMode,
      occurredAt: parsed.occurredAt,
      isRecurring: parsed.isRecurring,
      tags: JSON.stringify(parsed.tags ?? []),
      hash: txnHash(user.id, t),
    },
  });
  return NextResponse.json(txn, { status: 201 });
}
