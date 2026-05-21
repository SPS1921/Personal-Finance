import { createWorker } from "tesseract.js";
import { ParsedTransaction, detectPaymentMode, normalizeMerchant, parseAmount, parseDate } from "@/lib/normalizers";
import { categorize, categorizeFallback } from "@/lib/categorization";
import { TxnType } from "@/lib/types";

export async function parseReceipt(buffer: Buffer, userId: string): Promise<{ transaction: ParsedTransaction | null; rawText: string; errors: string[] }> {
  const worker = await createWorker("eng");
  const errors: string[] = [];
  try {
    const { data } = await worker.recognize(buffer);
    const text = data.text;
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    let amount = 0;
    const totalLine = lines.reverse().find((l) => /(total|amount|grand|paid)/i.test(l) && /[\d.,]+/.test(l));
    if (totalLine) {
      const m = totalLine.match(/([\d,]+\.\d{2}|[\d,]+)/g);
      if (m && m.length) amount = parseAmount(m[m.length - 1]);
    }
    if (!amount) {
      const allNums = text.match(/\b[\d,]+\.\d{2}\b/g) ?? [];
      amount = Math.max(...allNums.map(parseAmount), 0);
    }

    const dateLine = lines.find((l) => /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(l));
    const occurredAt = dateLine ? parseDate(dateLine.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/)?.[0]) : new Date();

    const merchantLine = lines.slice(0, 5).find((l) => l.length > 3 && !/^\d/.test(l));
    const merchantRaw = merchantLine ?? "Receipt";
    const { name: merchant, key: merchantKey } = normalizeMerchant(merchantRaw);
    const rule = await categorize(merchantRaw, userId);
    const category = rule?.category ?? (await categorizeFallback(merchantRaw)).category;

    if (!amount) {
      errors.push("Could not detect amount from receipt.");
      return { transaction: null, rawText: text, errors };
    }

    return {
      transaction: {
        occurredAt: occurredAt ?? new Date(),
        amount,
        type: TxnType.EXPENSE,
        merchant: rule?.merchant ?? merchant,
        merchantKey,
        category,
        paymentMode: detectPaymentMode(text),
        notes: "Imported from receipt",
        confidence: rule ? 0.85 : 0.55,
      },
      rawText: text,
      errors,
    };
  } finally {
    await worker.terminate();
  }
}
