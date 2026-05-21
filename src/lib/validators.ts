import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME", "TRANSFER"]),
  amount: z.coerce.number().positive(),
  category: z.string(),
  merchant: z.string().min(1).max(100),
  notes: z.string().max(500).optional(),
  paymentMode: z.enum(["CASH", "UPI", "CARD", "NETBANKING", "WALLET", "AUTODEBIT", "OTHER"]).default("OTHER"),
  occurredAt: z.coerce.date(),
  accountId: z.string().optional(),
  isRecurring: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const budgetSchema = z.object({
  category: z.string(),
  amount: z.coerce.number().positive(),
  period: z.enum(["MONTHLY", "WEEKLY", "YEARLY"]).default("MONTHLY"),
  alertAt: z.coerce.number().min(0).max(1).default(0.8),
  rollover: z.boolean().default(false),
});

export const goalSchema = z.object({
  name: z.string().min(1).max(80),
  emoji: z.string().max(8).optional(),
  targetAmount: z.coerce.number().positive(),
  savedAmount: z.coerce.number().nonnegative().default(0),
  deadline: z.coerce.date(),
  monthlyTarget: z.coerce.number().optional(),
});

export const debtSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.enum(["PERSONAL_LOAN", "HOME_LOAN", "CAR_LOAN", "CREDIT_CARD", "EDUCATION_LOAN", "BORROWED", "OTHER"]),
  lender: z.string().max(80).optional(),
  principal: z.coerce.number().positive(),
  outstanding: z.coerce.number().nonnegative(),
  interestRate: z.coerce.number().nonnegative(),
  emiAmount: z.coerce.number().positive(),
  tenureMonths: z.coerce.number().int().positive(),
  startDate: z.coerce.date(),
  dueDay: z.coerce.number().int().min(1).max(31).default(1),
});

export const incomeSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.string().default("SALARY"),
  amount: z.coerce.number().positive(),
  frequency: z.enum(["MONTHLY", "WEEKLY", "QUARTERLY", "YEARLY", "ONE_TIME"]).default("MONTHLY"),
  nextDate: z.coerce.date().optional(),
});

export const accountSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.enum(["BANK", "CARD", "CASH", "WALLET", "INVESTMENT"]),
  institution: z.string().max(80).optional(),
  last4: z.string().max(8).optional(),
  balance: z.coerce.number().default(0),
  isPrimary: z.boolean().default(false),
});
