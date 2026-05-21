import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { ingestTransactions } from "@/lib/ingest";
import { ParsedTransaction, detectPaymentMode, normalizeMerchant } from "@/lib/normalizers";
import { categorize, categorizeFallback } from "@/lib/categorization";
import { TxnType } from "@/lib/types";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = await req.json();
  const rows = Array.isArray(body) ? body : [body];

  const parsed: ParsedTransaction[] = [];
  for (const r of rows) {
    const { name: merchant, key: merchantKey } = normalizeMerchant(r.merchant ?? "Manual");
    const rule = await categorize(r.merchant ?? "", user.id);
    const category = (r.category as any) ?? rule?.category ?? (await categorizeFallback(r.merchant ?? "")).category;
    parsed.push({
      occurredAt: new Date(r.occurredAt ?? Date.now()),
      amount: Number(r.amount),
      type: (r.type as TxnType) ?? TxnType.EXPENSE,
      merchant: rule?.merchant ?? merchant,
      merchantKey,
      category,
      paymentMode: r.paymentMode ?? detectPaymentMode(r.notes ?? ""),
      notes: r.notes,
      confidence: 1,
    });
  }

  const result = await ingestTransactions(user.id, "MANUAL", parsed);
  return NextResponse.json(result);
}
