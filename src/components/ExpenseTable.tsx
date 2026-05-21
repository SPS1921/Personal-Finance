"use client";
import { useState, memo } from "react";
import { Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

interface Txn {
  id: string;
  occurredAt: string | Date;
  merchant: string | null;
  category: string;
  amount: any;
  type: "EXPENSE" | "INCOME" | "TRANSFER";
  paymentMode: string;
  notes?: string | null;
  account?: { name: string } | null;
}

export function ExpenseTable({ items }: { items: Txn[] }) {
  const refresh = useStore((s) => s.bumpVersion);
  const [pending, setPending] = useState<string | null>(null);

  async function remove(id: string) {
    setPending(id);
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setPending(null);
    if (!res.ok) return toast.error("Failed to delete");
    toast.success("Transaction deleted");
    refresh();
  }

  return (
    <div className="bento overflow-hidden">
      <div className="hidden md:grid grid-cols-12 items-center px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
        <div className="col-span-3">Merchant</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-2">Mode</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-1" />
      </div>
      <div className="divide-y divide-border/60">
        {items.map((t) => (
          <Row key={t.id} t={t} pending={pending === t.id} onDelete={() => remove(t.id)} />
        ))}
      </div>
      {items.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No transactions yet.</div>}
    </div>
  );
}

const Row = memo(function Row({ t, pending, onDelete }: { t: Txn; pending: boolean; onDelete: () => void }) {
  const expense = t.type === "EXPENSE";
  return (
    <div className="md:grid md:grid-cols-12 flex flex-wrap items-center gap-y-1 px-4 py-3 text-sm hover:bg-accent/40 transition-colors">
      <div className="md:col-span-3 flex items-center gap-2 w-full md:w-auto">
        <div className={`h-7 w-7 shrink-0 rounded-md flex items-center justify-center ${expense ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
          {expense ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{t.merchant || "Unknown"}</p>
          {t.notes && <p className="text-[11px] text-muted-foreground truncate">{t.notes}</p>}
        </div>
      </div>
      <div className="md:col-span-2 flex md:block items-center gap-2"><Badge variant="outline">{t.category}</Badge></div>
      <div className="md:col-span-2 text-xs text-muted-foreground hidden md:block">{t.paymentMode}</div>
      <div className="md:col-span-2 text-xs text-muted-foreground hidden md:block">
        {new Date(t.occurredAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
      </div>
      <div className={`md:col-span-2 text-right number font-medium ml-auto ${expense ? "" : "text-emerald-500"}`}>
        {expense ? "−" : "+"}{formatCurrency(Number(t.amount))}
      </div>
      <div className="md:col-span-1 flex justify-end">
        <Button size="icon" variant="ghost" disabled={pending} onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
});
