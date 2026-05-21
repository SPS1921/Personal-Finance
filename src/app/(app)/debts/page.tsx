"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DebtCard } from "@/components/DebtCard";
import { useApi } from "@/lib/fetcher";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const TYPES = ["PERSONAL_LOAN","HOME_LOAN","CAR_LOAN","CREDIT_CARD","EDUCATION_LOAN","BORROWED","OTHER"];

export default function DebtsPage() {
  const { data } = useApi<any>("/api/debts");
  const refresh = useStore((s) => s.bumpVersion);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "PERSONAL_LOAN", lender: "", principal: "", outstanding: "", interestRate: "",
    emiAmount: "", tenureMonths: "", startDate: new Date().toISOString().slice(0, 10), dueDay: "5",
  });

  async function save() {
    const res = await fetch("/api/debts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return toast.error("Failed");
    toast.success("Debt added");
    setOpen(false);
    refresh();
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const monthlyEmi = data?.monthlyEmi ?? 0;
  const dti = monthlyEmi ? Math.round((monthlyEmi / 145000) * 100) : 0; // placeholder vs typical income

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Debts & EMI</h1>
          <p className="text-sm text-muted-foreground">Track loans, credit cards, and payoff forecasts.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5" /> New debt</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bento p-5">
          <p className="text-[11px] uppercase text-muted-foreground">Outstanding</p>
          <p className="number text-2xl font-semibold">{formatCurrency(total)}</p>
        </div>
        <div className="bento p-5">
          <p className="text-[11px] uppercase text-muted-foreground">Monthly EMI</p>
          <p className="number text-2xl font-semibold">{formatCurrency(monthlyEmi)}</p>
        </div>
        <div className="bento p-5">
          <p className="text-[11px] uppercase text-muted-foreground">DTI ratio</p>
          <p className="number text-2xl font-semibold">{dti}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((d: any) => <DebtCard key={d.id} d={d} />)}
        {items.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No debts tracked.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>New debt</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Lender</Label><Input value={form.lender} onChange={(e) => setForm((f) => ({ ...f, lender: e.target.value }))} /></div>
            <div><Label>Principal</Label><Input type="number" value={form.principal} onChange={(e) => setForm((f) => ({ ...f, principal: e.target.value }))} /></div>
            <div><Label>Outstanding</Label><Input type="number" value={form.outstanding} onChange={(e) => setForm((f) => ({ ...f, outstanding: e.target.value }))} /></div>
            <div><Label>Interest %</Label><Input type="number" step="0.1" value={form.interestRate} onChange={(e) => setForm((f) => ({ ...f, interestRate: e.target.value }))} /></div>
            <div><Label>EMI</Label><Input type="number" value={form.emiAmount} onChange={(e) => setForm((f) => ({ ...f, emiAmount: e.target.value }))} /></div>
            <div><Label>Tenure (months)</Label><Input type="number" value={form.tenureMonths} onChange={(e) => setForm((f) => ({ ...f, tenureMonths: e.target.value }))} /></div>
            <div><Label>Start date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} /></div>
            <div><Label>Due day</Label><Input type="number" min="1" max="31" value={form.dueDay} onChange={(e) => setForm((f) => ({ ...f, dueDay: e.target.value }))} /></div>
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
