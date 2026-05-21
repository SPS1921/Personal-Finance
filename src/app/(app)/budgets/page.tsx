"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BudgetProgress } from "@/components/BudgetProgress";
import { useApi } from "@/lib/fetcher";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

const CATS = ["FOOD","TRAVEL","RENT","SHOPPING","ENTERTAINMENT","INVESTMENT","UTILITIES","HEALTH","FAMILY","BUSINESS","MISC"];

export default function BudgetsPage() {
  const { data } = useApi<any>("/api/budgets");
  const refresh = useStore((s) => s.bumpVersion);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("FOOD");
  const [amount, setAmount] = useState("");
  const [alertAt, setAlertAt] = useState("0.8");

  async function save() {
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, amount: Number(amount), alertAt: Number(alertAt) }),
    });
    if (!res.ok) return toast.error("Failed to save");
    toast.success("Budget saved");
    setOpen(false); setAmount("");
    refresh();
  }

  const totalBudget = (data?.items ?? []).reduce((s: number, b: any) => s + b.budget, 0);
  const totalSpent = (data?.items ?? []).reduce((s: number, b: any) => s + b.spent, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground">Caps and alerts per category for this month.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5" /> New budget</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bento p-5">
          <p className="text-[11px] text-muted-foreground uppercase">Total budgeted</p>
          <p className="number text-2xl font-semibold">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="bento p-5">
          <p className="text-[11px] text-muted-foreground uppercase">Spent</p>
          <p className="number text-2xl font-semibold">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bento p-5">
          <p className="text-[11px] text-muted-foreground uppercase">Remaining</p>
          <p className="number text-2xl font-semibold">{formatCurrency(Math.max(totalBudget - totalSpent, 0))}</p>
        </div>
      </div>

      <div className="bento p-5">
        <h3 className="text-sm font-medium mb-4">Category breakdown</h3>
        <BudgetProgress items={data?.items ?? []} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New budget</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Monthly amount</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label>Alert at</Label>
              <Input type="number" step="0.05" value={alertAt} onChange={(e) => setAlertAt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
