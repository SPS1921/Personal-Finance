import { Category } from "@/lib/types";
import { prisma } from "@/lib/db";

interface Rule { pattern: RegExp; merchant: string; category: Category; priority: number }

let cache: { userId: string | null; rules: Rule[]; expires: number } | null = null;
const TTL_MS = 60_000;

async function loadRules(userId: string | null): Promise<Rule[]> {
  if (cache && cache.userId === userId && cache.expires > Date.now()) return cache.rules;
  const rows = await prisma.merchantRule.findMany({
    where: { OR: [{ isGlobal: true }, { userId: userId ?? undefined }] },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
  const rules: Rule[] = rows.map((r) => ({
    pattern: new RegExp(r.pattern, "i"),
    merchant: r.merchant,
    category: r.category as Category,
    priority: r.priority,
  }));
  cache = { userId, rules, expires: Date.now() + TTL_MS };
  return rules;
}

export async function categorize(text: string, userId: string | null = null): Promise<{ merchant: string; category: Category; confidence: number } | null> {
  if (!text) return null;
  const rules = await loadRules(userId);
  for (const r of rules) {
    if (r.pattern.test(text)) {
      return { merchant: r.merchant, category: r.category, confidence: 0.95 };
    }
  }
  return null;
}

export async function categorizeFallback(text: string): Promise<{ category: Category; confidence: number }> {
  const s = (text || "").toLowerCase();
  if (/food|cafe|restaurant|biryani|pizza|coffee/.test(s)) return { category: Category.FOOD, confidence: 0.6 };
  if (/cab|taxi|fuel|petrol|metro|train|flight|airline/.test(s)) return { category: Category.TRAVEL, confidence: 0.6 };
  if (/rent|landlord/.test(s)) return { category: Category.RENT, confidence: 0.7 };
  if (/electric|gas|water|broadband|wifi|mobile|phone bill/.test(s)) return { category: Category.UTILITIES, confidence: 0.65 };
  if (/hospital|clinic|medicine|pharmacy/.test(s)) return { category: Category.HEALTH, confidence: 0.65 };
  if (/mutual fund|sip|stock|equity|nifty|sensex/.test(s)) return { category: Category.INVESTMENT, confidence: 0.7 };
  if (/movie|game|stream|music/.test(s)) return { category: Category.ENTERTAINMENT, confidence: 0.6 };
  return { category: Category.MISC, confidence: 0.4 };
}

export function invalidateRulesCache() {
  cache = null;
}
