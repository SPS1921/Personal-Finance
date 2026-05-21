import pdfParse from "pdf-parse";
import { ParsedTransaction, detectPaymentMode, normalizeMerchant, parseAmount, parseDate, txnHash } from "@/lib/normalizers";
import { categorize, categorizeFallback } from "@/lib/categorization";
import { TxnType } from "@/lib/types";

const LINE_RE = /^(\d{1,2}[\/\-][\d\w]+[\/\-]\d{2,4})\s+(.+?)\s+([\d,]+\.\d{2})(?:\s+(Cr|Dr|CR|DR))?$/;

export async function parsePDF(
  buffer: Buffer,
  userId: string,
): Promise<{ transactions: ParsedTransaction[]; errors: string[]; rawText: string }> {
  const data = await pdfParse(buffer);
  const text = data.text;
  const errors: string[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const transactions: ParsedTransaction[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(LINE_RE);
    if (!m) continue;
    const occurredAt = parseDate(m[1]);
    if (!occurredAt) continue;
    const description = m[2].trim();
    const amount = parseAmount(m[3]);
    if (amount <= 0) continue;
    const flag = m[4]?.toUpperCase();
    const type = flag === "CR" ? TxnType.INCOME : TxnType.EXPENSE;
    const { name: merchant, key: merchantKey } = normalizeMerchant(description);
    const rule = await categorize(description, userId);
    const category = rule?.category ?? (await categorizeFallback(description)).category;
    transactions.push({
      occurredAt,
      amount,
      type,
      merchant: rule?.merchant ?? merchant,
      merchantKey,
      category,
      paymentMode: detectPaymentMode(description),
      notes: description,
      confidence: rule ? 0.9 : 0.55,
    });
  }

  if (transactions.length === 0) {
    errors.push("No transaction rows detected. Try CSV/XLSX import or manual mapping.");
  }

  return { transactions, errors, rawText: text };
}
