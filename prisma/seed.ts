import { PrismaClient } from "@prisma/client";
import { AccountType, Category, DebtType, PaymentMode, TxnType, GoalStatus } from "../src/lib/types";
import { createHash } from "crypto";

const prisma = new PrismaClient();

function hash(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

const MERCHANTS: [string, Category, PaymentMode, [number, number]][] = [
  ["Swiggy", "FOOD", "UPI", [180, 650]],
  ["Zomato", "FOOD", "UPI", [200, 700]],
  ["Blinkit", "FOOD", "UPI", [250, 1200]],
  ["Uber", "TRAVEL", "UPI", [120, 480]],
  ["Ola", "TRAVEL", "UPI", [100, 420]],
  ["IRCTC", "TRAVEL", "NETBANKING", [600, 3200]],
  ["Amazon", "SHOPPING", "CARD", [299, 4999]],
  ["Flipkart", "SHOPPING", "CARD", [349, 5499]],
  ["Netflix", "ENTERTAINMENT", "AUTODEBIT", [199, 199]],
  ["Spotify", "ENTERTAINMENT", "AUTODEBIT", [119, 119]],
  ["BSES Power", "UTILITIES", "AUTODEBIT", [800, 2400]],
  ["Airtel Fiber", "UTILITIES", "AUTODEBIT", [799, 1199]],
  ["Apollo Pharmacy", "HEALTH", "UPI", [180, 1500]],
  ["Cult.fit", "HEALTH", "CARD", [999, 1999]],
  ["Zerodha", "INVESTMENT", "NETBANKING", [5000, 25000]],
  ["Groww SIP", "INVESTMENT", "AUTODEBIT", [3000, 10000]],
];

async function main() {
  const email = "demo@finance-os.app";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Demo User", currency: "INR" },
  });

  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.account.deleteMany({ where: { userId: user.id } });
  await prisma.budget.deleteMany({ where: { userId: user.id } });
  await prisma.debt.deleteMany({ where: { userId: user.id } });
  await prisma.goal.deleteMany({ where: { userId: user.id } });
  await prisma.incomeSource.deleteMany({ where: { userId: user.id } });

  const hdfc = await prisma.account.create({
    data: { userId: user.id, name: "HDFC Savings", type: AccountType.BANK, institution: "HDFC", last4: "4421", balance: 184250.5, isPrimary: true },
  });
  const icici = await prisma.account.create({
    data: { userId: user.id, name: "ICICI Amazon Card", type: AccountType.CARD, institution: "ICICI", last4: "9087", balance: -18230 },
  });
  const cash = await prisma.account.create({
    data: { userId: user.id, name: "Cash Wallet", type: AccountType.CASH, balance: 5400 },
  });

  await prisma.incomeSource.createMany({
    data: [
      { userId: user.id, name: "Acme Corp Salary", type: Category.SALARY, amount: 145000, frequency: "MONTHLY", nextDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) },
      { userId: user.id, name: "Freelance Design", type: Category.FREELANCE, amount: 35000, frequency: "MONTHLY" },
      { userId: user.id, name: "MF Dividends", type: Category.INTEREST, amount: 4200, frequency: "QUARTERLY" },
    ],
  });

  const budgets: { category: Category; amount: number }[] = [
    { category: "FOOD", amount: 12000 },
    { category: "TRAVEL", amount: 6000 },
    { category: "SHOPPING", amount: 8000 },
    { category: "ENTERTAINMENT", amount: 3000 },
    { category: "UTILITIES", amount: 5000 },
    { category: "HEALTH", amount: 4000 },
    { category: "INVESTMENT", amount: 30000 },
  ];
  for (const b of budgets) {
    await prisma.budget.create({ data: { userId: user.id, category: b.category, amount: b.amount } });
  }

  await prisma.debt.createMany({
    data: [
      { userId: user.id, name: "Home Loan", type: DebtType.HOME_LOAN, lender: "HDFC", principal: 4200000, outstanding: 3680000, interestRate: 8.4, emiAmount: 38500, tenureMonths: 240, startDate: new Date("2022-06-01"), dueDay: 5 },
      { userId: user.id, name: "Macbook EMI", type: DebtType.PERSONAL_LOAN, lender: "Bajaj Finserv", principal: 180000, outstanding: 96000, interestRate: 12, emiAmount: 8200, tenureMonths: 24, startDate: new Date("2024-08-01"), dueDay: 8 },
      { userId: user.id, name: "ICICI Amazon Card", type: DebtType.CREDIT_CARD, lender: "ICICI", principal: 50000, outstanding: 18230, interestRate: 36, emiAmount: 3000, tenureMonths: 12, startDate: new Date("2025-12-01"), dueDay: 18 },
    ],
  });

  await prisma.goal.createMany({
    data: [
      { userId: user.id, name: "Emergency Fund", emoji: "🛟", targetAmount: 600000, savedAmount: 245000, deadline: new Date("2026-12-31"), monthlyTarget: 25000, status: GoalStatus.ACTIVE },
      { userId: user.id, name: "Japan Trip", emoji: "🗾", targetAmount: 350000, savedAmount: 88000, deadline: new Date("2027-03-31"), monthlyTarget: 22000, status: GoalStatus.ACTIVE },
      { userId: user.id, name: "Tesla Model 3", emoji: "🚗", targetAmount: 4500000, savedAmount: 320000, deadline: new Date("2029-01-01"), monthlyTarget: 95000, status: GoalStatus.ACTIVE },
      { userId: user.id, name: "DSLR Camera", emoji: "📷", targetAmount: 120000, savedAmount: 120000, deadline: new Date("2026-04-01"), status: GoalStatus.ACHIEVED },
    ],
  });

  const now = new Date();
  const txns: any[] = [];
  for (let d = 0; d < 120; d++) {
    const date = new Date(now);
    date.setDate(now.getDate() - d);
    const count = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const [merchant, category, mode, [lo, hi]] = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
      const amount = +(lo + Math.random() * (hi - lo)).toFixed(2);
      const account = Math.random() > 0.6 ? icici : hdfc;
      const occurredAt = new Date(date);
      occurredAt.setHours(8 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60));
      txns.push({
        userId: user.id,
        accountId: account.id,
        type: TxnType.EXPENSE,
        amount,
        category,
        merchant,
        merchantKey: merchant.toLowerCase().replace(/\s+/g, "_"),
        paymentMode: mode,
        occurredAt,
        hash: hash(`${user.id}|${occurredAt.toISOString()}|${merchant}|${amount}|EXPENSE`),
      });
    }
    if (d % 30 === 5) {
      const salaryDate = new Date(date);
      txns.push({
        userId: user.id,
        accountId: hdfc.id,
        type: TxnType.INCOME,
        amount: 145000,
        category: Category.SALARY,
        merchant: "Acme Corp",
        merchantKey: "acme_corp",
        paymentMode: PaymentMode.NETBANKING,
        occurredAt: salaryDate,
        isRecurring: true,
        hash: hash(`${user.id}|${salaryDate.toISOString()}|salary|145000|INCOME`),
      });
    }
  }
  await prisma.transaction.createMany({ data: txns });

  const globalRules: { pattern: string; merchant: string; category: Category }[] = [
    { pattern: "swiggy", merchant: "Swiggy", category: Category.FOOD },
    { pattern: "zomato", merchant: "Zomato", category: Category.FOOD },
    { pattern: "blinkit", merchant: "Blinkit", category: Category.FOOD },
    { pattern: "zepto", merchant: "Zepto", category: Category.FOOD },
    { pattern: "uber", merchant: "Uber", category: Category.TRAVEL },
    { pattern: "ola", merchant: "Ola", category: Category.TRAVEL },
    { pattern: "irctc", merchant: "IRCTC", category: Category.TRAVEL },
    { pattern: "amazon", merchant: "Amazon", category: Category.SHOPPING },
    { pattern: "flipkart", merchant: "Flipkart", category: Category.SHOPPING },
    { pattern: "myntra", merchant: "Myntra", category: Category.SHOPPING },
    { pattern: "netflix", merchant: "Netflix", category: Category.ENTERTAINMENT },
    { pattern: "spotify", merchant: "Spotify", category: Category.ENTERTAINMENT },
    { pattern: "prime", merchant: "Amazon Prime", category: Category.ENTERTAINMENT },
    { pattern: "airtel", merchant: "Airtel", category: Category.UTILITIES },
    { pattern: "jio", merchant: "Jio", category: Category.UTILITIES },
    { pattern: "bses|tata power|adani electricity", merchant: "Electricity", category: Category.UTILITIES },
    { pattern: "apollo|1mg|pharmeasy", merchant: "Pharmacy", category: Category.HEALTH },
    { pattern: "zerodha|groww|kuvera|coin", merchant: "Investment", category: Category.INVESTMENT },
    { pattern: "salary|payroll", merchant: "Salary", category: Category.SALARY },
  ];
  for (const r of globalRules) {
    await prisma.merchantRule.create({ data: { ...r, isGlobal: true, priority: 100 } });
  }

  console.log(`Seeded user ${user.email} with ${txns.length} transactions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
