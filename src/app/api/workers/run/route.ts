import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { emiReminders, flagRecurring, lowBalanceCheck } from "@/workers/recurring";

export async function POST() {
  const user = await requireUser();
  await Promise.all([emiReminders(user.id), lowBalanceCheck(user.id), flagRecurring(user.id)]);
  return NextResponse.json({ ok: true });
}
