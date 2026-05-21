import { NextRequest } from "next/server";
import Papa from "papaparse";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = await requireUser();
  const txns = await prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { occurredAt: "desc" } });
  const rows = txns.map((t) => ({
    date: t.occurredAt.toISOString().slice(0, 10),
    type: t.type,
    amount: toNumber(t.amount),
    category: t.category,
    merchant: t.merchant,
    payment_mode: t.paymentMode,
    notes: t.notes ?? "",
  }));
  const csv = Papa.unparse(rows);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="transactions-${Date.now()}.csv"`,
    },
  });
}
