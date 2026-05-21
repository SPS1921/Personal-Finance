import { prisma } from "@/lib/db";
import { detectSubscriptions } from "@/lib/analytics";

export async function flagRecurring(userId: string) {
  const subs = await detectSubscriptions(userId);
  for (const s of subs) {
    if (s.occurrences.length < 3) continue;
    await prisma.transaction.updateMany({
      where: { userId, merchantKey: s.occurrences[0] ? undefined : undefined },
      data: { isRecurring: true },
    });
  }
}

export async function emiReminders(userId: string) {
  const debts = await prisma.debt.findMany({ where: { userId, isActive: true } });
  const today = new Date();
  for (const d of debts) {
    if (d.dueDay - today.getDate() === 2) {
      await prisma.notification.create({
        data: {
          userId,
          type: "EMI_DUE",
          title: `EMI due for ${d.name}`,
          body: `${d.emiAmount} due in 2 days.`,
        },
      });
    }
  }
}

export async function lowBalanceCheck(userId: string, threshold = 5000) {
  const accounts = await prisma.account.findMany({ where: { userId, archived: false } });
  for (const a of accounts) {
    if (Number(a.balance) < threshold) {
      await prisma.notification.create({
        data: {
          userId,
          type: "LOW_BALANCE",
          title: `Low balance: ${a.name}`,
          body: `Balance dropped below ₹${threshold.toLocaleString("en-IN")}.`,
        },
      });
    }
  }
}
