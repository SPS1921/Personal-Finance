"use client";
import { useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useApi } from "@/lib/fetcher";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function IncomePage() {
  const { data } = useApi<any>("/api/income");
  const refresh = useStore((s) => s.bumpVersion);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "SALARY", amount: "", frequency: "MONTHLY" });

  const items = data?.items ?? [];
  const expectedMonthly = items.reduce((s: number, x: any) => {
    const amt = Number(x.amount);
    const k = x.frequency === "MONTHLY" ? 1 : x.frequency === "WEEKLY" ? 4.33 : x.frequency === "QUARTERLY" ? 1 / 3 : x.frequency === "YEARLY" ? 1 / 12 : 0;
    return s + amt * k;
  }, 0);

  async function save() {
    const res = await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    if (!res.ok) return toast.error("Failed");
    toast.success("Income source added");
    setOpen(false); setForm({ name: "", type: "SALARY", amount: "", frequency: "MONTHLY" });
    refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Income</h1>
          <p className="text-sm text-muted-foreground">Salary, freelance, dividends, side income.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5" /> Add source</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bento p-5">
          <p className="text-[11px] uppercase text-muted-foreground">Expected / month</p>
          <p className="number text-2xl font-semibold">{formatCurrency(expectedMonthly)}</p>
        </div>
        <div className="bento p-5">
          <p className="text-[11px] uppercase text-muted-foreground">Sources active</p>
          <p className="number text-2xl font-semibold">{items.filter((x: any) => x.isActive).length}</p>
        </div>
        <div className="bento p-5 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-emerald-500" />
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">Annualized</p>
            <p className="number text-2xl font-semibold">{formatCurrency(expectedMonthly * 12)}</p>
          </div>
        </div>
      </div>

      <div className="bento overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
          <div className="col-span-4">Source</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-3">Frequency</div>
          <div className="col-span-3 text-right">Amount</div>
        </div>
        {items.map((i: any) => (
          <div key={i.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm border-b border-border/60 last:border-0">
            <div className="col-span-4 font-medium">{i.name}</div>
            <div className="col-span-2 text-xs text-muted-foreground">{i.type}</div>
            <div className="col-span-3 text-xs text-muted-foreground">{i.frequency}</div>
            <div className="col-span-3 text-right number font-medium">{formatCurrency(Number(i.amount))}</div>
          </div>
        ))}
        {items.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No income sources yet.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add income source</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["SALARY","FREELANCE","BUSINESS","INVESTMENT","INTEREST","REFUND","MISC"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm((f) => ({ ...f, frequency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["MONTHLY","WEEKLY","QUARTERLY","YEARLY","ONE_TIME"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></div>
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
