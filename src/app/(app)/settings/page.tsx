"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { useApi } from "@/lib/fetcher";
import { toast } from "sonner";

export default function SettingsPage() {
  const { currency, setCurrency } = useStore();
  const { data: rulesData } = useApi<any>("/api/rules");
  const refresh = useStore((s) => s.bumpVersion);
  const [rule, setRule] = useState({ pattern: "", merchant: "", category: "FOOD", priority: 50 });

  async function addRule() {
    const res = await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule),
    });
    if (!res.ok) return toast.error("Failed");
    toast.success("Rule added");
    setRule({ pattern: "", merchant: "", category: "FOOD", priority: 50 });
    refresh();
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Preferences, categorization rules, data exports.</p>
      </div>

      <div className="bento p-5">
        <h3 className="text-sm font-medium mb-3">Preferences</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["INR","USD","EUR","GBP","AED","SGD"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bento p-5">
        <h3 className="text-sm font-medium mb-3">Categorization rules</h3>
        <div className="grid grid-cols-12 gap-2 mb-3">
          <Input className="col-span-3" placeholder="Pattern (regex)" value={rule.pattern} onChange={(e) => setRule({ ...rule, pattern: e.target.value })} />
          <Input className="col-span-3" placeholder="Merchant" value={rule.merchant} onChange={(e) => setRule({ ...rule, merchant: e.target.value })} />
          <Select value={rule.category} onValueChange={(v) => setRule({ ...rule, category: v })}>
            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["FOOD","TRAVEL","RENT","EMI","SHOPPING","ENTERTAINMENT","INVESTMENT","UTILITIES","HEALTH","FAMILY","BUSINESS","SALARY","FREELANCE","INTEREST","REFUND","MISC"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input className="col-span-1" type="number" value={rule.priority} onChange={(e) => setRule({ ...rule, priority: Number(e.target.value) })} />
          <Button className="col-span-2" onClick={addRule}>Add rule</Button>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin border-t border-border">
          {(rulesData?.items ?? []).map((r: any) => (
            <div key={r.id} className="grid grid-cols-12 gap-2 py-2 text-sm border-b border-border/60 last:border-0">
              <code className="col-span-4 text-xs">{r.pattern}</code>
              <div className="col-span-3">{r.merchant}</div>
              <div className="col-span-3 text-xs text-muted-foreground">{r.category}</div>
              <div className="col-span-1 text-xs">{r.priority}</div>
              <div className="col-span-1 text-xs text-muted-foreground text-right">{r.isGlobal ? "global" : "user"}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bento p-5">
        <h3 className="text-sm font-medium mb-3">Data</h3>
        <div className="flex gap-2">
          <a href="/api/export/csv"><Button variant="outline">Export all (CSV)</Button></a>
          <a href="/upload"><Button variant="outline">Import data</Button></a>
        </div>
      </div>
    </div>
  );
}
