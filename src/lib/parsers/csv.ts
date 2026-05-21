import Papa from "papaparse";
import { ParsedTransaction, detectPaymentMode, detectType, normalizeMerchant, parseAmount, parseDate } from "@/lib/normalizers";
import { categorize, categorizeFallback } from "@/lib/categorization";
import { Category } from "@/lib/types";

const FIELD_ALIASES: Record<string, string[]> = {
  date: ["date", "transaction date", "txn date", "value date", "posting date"],
  amount: ["amount", "txn amount", "transaction amount", "value"],
  debit: ["debit", "withdrawal", "withdrawal amt", "dr", "debit amount"],
  credit: ["credit", "deposit", "deposit amt", "cr", "credit amount"],
  merchant: ["merchant", "description", "narration", "particulars", "details", "remarks"],
  type: ["type", "transaction type", "dr/cr"],
  notes: ["notes", "remark", "memo"],
};

export interface ColumnMapping {
  date?: string;
  amount?: string;
  debit?: string;
  credit?: string;
  merchant?: string;
  type?: string;
  notes?: string;
}

export function autoDetectMapping(headers: string[]): ColumnMapping {
  const lower = headers.map((h) => h.toLowerCase().trim());
  const mapping: ColumnMapping = {};
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const a of aliases) {
      const idx = lower.findIndex((h) => h === a || h.includes(a));
      if (idx >= 0) {
        (mapping as any)[field] = headers[idx];
        break;
      }
    }
  }
  return mapping;
}

export async function parseCSV(
  text: string,
  userId: string,
  mapping?: ColumnMapping,
): Promise<{ transactions: ParsedTransaction[]; headers: string[]; mapping: ColumnMapping; errors: string[] }> {
  const errors: string[] = [];
  const result = Papa.parse<Record<string, any>>(text, { header: true, skipEmptyLines: true, dynamicTyping: false });
  const headers = result.meta.fields ?? [];
  const map = mapping ?? autoDetectMapping(headers);
  const transactions: ParsedTransaction[] = [];

  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i];
    try {
      const dateRaw = map.date ? row[map.date] : null;
      const occurredAt = parseDate(dateRaw);
      if (!occurredAt) {
        errors.push(`Row ${i + 2}: invalid date "${dateRaw}"`);
        continue;
      }
      const debit = map.debit ? parseAmount(row[map.debit]) : 0;
      const credit = map.credit ? parseAmount(row[map.credit]) : 0;
      const amount = debit || credit || (map.amount ? parseAmount(row[map.amount]) : 0);
      if (amount <= 0) {
        errors.push(`Row ${i + 2}: invalid amount`);
        continue;
      }
      const type = detectType({ ...row, debit, credit }, amount);
      const merchantRaw = map.merchant ? String(row[map.merchant] ?? "") : "";
      const { name: merchant, key: merchantKey } = normalizeMerchant(merchantRaw);
      const rule = await categorize(merchantRaw, userId);
      const category = rule?.category ?? (await categorizeFallback(merchantRaw)).category;
      const confidence = rule?.confidence ?? 0.5;
      const notes = map.notes ? String(row[map.notes] ?? "") : undefined;

      transactions.push({
        occurredAt,
        amount,
        type,
        merchant: rule?.merchant ?? merchant,
        merchantKey,
        category,
        paymentMode: detectPaymentMode(merchantRaw + " " + (notes ?? "")),
        notes,
        confidence,
        raw: row,
      });
    } catch (e: any) {
      errors.push(`Row ${i + 2}: ${e.message ?? e}`);
    }
  }

  return { transactions, headers, mapping: map, errors };
}
