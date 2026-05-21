import { createHash } from "crypto";
import { TxnType, PaymentMode, Category } from "@/lib/types";

export interface ParsedTransaction {
  occurredAt: Date;
  amount: number;
  type: TxnType;
  merchant: string;
  merchantKey: string;
  category: Category;
  paymentMode: PaymentMode;
  notes?: string;
  confidence: number;
  raw?: Record<string, any>;
}

const MERCHANT_ALIASES: Record<string, string> = {
  "amazon pay india": "Amazon",
  "amazon retail": "Amazon",
  "amzn mktp": "Amazon",
  "flipkart internet": "Flipkart",
  "swiggy bangalore": "Swiggy",
  "swiggy instamart": "Blinkit",
  "uber india systems": "Uber",
  "olacabs": "Ola",
  "irctc-payment": "IRCTC",
  "netflix entertainment": "Netflix",
  "spotify india": "Spotify",
};

export function normalizeMerchant(raw: string): { name: string; key: string } {
  if (!raw) return { name: "Unknown", key: "unknown" };
  let s = raw.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  s = s.replace(/\b(upi|neft|imps|rtgs|pos|atm|ref|txn|trf|payment|via|to|from)\b/g, "").trim();
  for (const [pat, mapped] of Object.entries(MERCHANT_ALIASES)) {
    if (s.includes(pat)) return { name: mapped, key: mapped.toLowerCase().replace(/\s+/g, "_") };
  }
  const cleaned = s.split(" ").filter(Boolean).slice(0, 3).join(" ");
  const name = cleaned.replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown";
  return { name, key: name.toLowerCase().replace(/\s+/g, "_") };
}

export function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date && !isNaN(+value)) return value;
  const s = String(value).trim();
  const patterns: [RegExp, (m: RegExpMatchArray) => Date][] = [
    [/^(\d{4})-(\d{1,2})-(\d{1,2})/, (m) => new Date(+m[1], +m[2] - 1, +m[3])],
    [/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/, (m) => {
      let y = +m[3];
      if (y < 100) y += 2000;
      return new Date(y, +m[2] - 1, +m[1]);
    }],
    [/^(\d{1,2})\s+([a-zA-Z]{3,})\s+(\d{2,4})/, (m) => {
      const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
      let y = +m[3]; if (y < 100) y += 2000;
      const mo = months.indexOf(m[2].toLowerCase().slice(0, 3));
      return new Date(y, mo, +m[1]);
    }],
  ];
  for (const [pat, fn] of patterns) {
    const m = s.match(pat);
    if (m) {
      const d = fn(m);
      if (!isNaN(+d)) return d;
    }
  }
  const fallback = new Date(s);
  return isNaN(+fallback) ? null : fallback;
}

export function parseAmount(value: any): number {
  if (value == null || value === "") return 0;
  if (typeof value === "number") return Math.abs(value);
  const s = String(value).replace(/[₹$,\s]/g, "").replace(/^\(([\d.]+)\)$/, "-$1");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : Math.abs(n);
}

export function detectType(row: Record<string, any>, amount: number): TxnType {
  const dr = parseAmount(row.debit ?? row.withdrawal ?? row.dr);
  const cr = parseAmount(row.credit ?? row.deposit ?? row.cr);
  if (cr > 0 && dr === 0) return TxnType.INCOME;
  if (dr > 0 && cr === 0) return TxnType.EXPENSE;
  const t = String(row.type ?? row.transactionType ?? "").toLowerCase();
  if (/credit|income|salary|refund|cr$/.test(t)) return TxnType.INCOME;
  if (/debit|expense|dr$/.test(t)) return TxnType.EXPENSE;
  const amt = parseAmount(row.amount);
  if (typeof row.amount === "string" && row.amount.trim().startsWith("-")) return TxnType.EXPENSE;
  if (amt > 50000) return TxnType.INCOME;
  return TxnType.EXPENSE;
}

export function detectPaymentMode(text: string): PaymentMode {
  const s = (text || "").toLowerCase();
  if (/upi|gpay|phonepe|paytm|bhim/.test(s)) return PaymentMode.UPI;
  if (/credit card|debit card|visa|master|rupay|pos/.test(s)) return PaymentMode.CARD;
  if (/neft|imps|rtgs|netbank/.test(s)) return PaymentMode.NETBANKING;
  if (/wallet|amazonpay|mobikwik/.test(s)) return PaymentMode.WALLET;
  if (/atm|cash/.test(s)) return PaymentMode.CASH;
  if (/auto.?debit|standing.?instr|ecs|si/.test(s)) return PaymentMode.AUTODEBIT;
  return PaymentMode.OTHER;
}

export function txnHash(userId: string, t: ParsedTransaction) {
  return createHash("sha256")
    .update(`${userId}|${t.occurredAt.toISOString()}|${t.merchantKey}|${t.amount.toFixed(2)}|${t.type}`)
    .digest("hex");
}
