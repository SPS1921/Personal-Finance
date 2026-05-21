"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { transactionSchema } from "@/lib/validators";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { z } from "zod";

const CATEGORIES = ["FOOD","TRAVEL","RENT","EMI","SHOPPING","ENTERTAINMENT","INVESTMENT","UTILITIES","HEALTH","FAMILY","BUSINESS","MISC"];
const MODES = ["CASH","UPI","CARD","NETBANKING","WALLET","AUTODEBIT","OTHER"];

type FormValues = z.infer<typeof transactionSchema>;

export function QuickAddModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const refresh = useStore((s) => s.bumpVersion);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      paymentMode: "UPI",
      category: "FOOD",
      occurredAt: new Date(),
      amount: 0,
      merchant: "",
      tags: [],
      isRecurring: false,
    },
  });

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, occurredAt: new Date(values.occurredAt).toISOString() }),
    });
    if (!res.ok) {
      toast.error("Failed to add transaction");
      return;
    }
    toast.success("Transaction added");
    refresh();
    reset();
    onOpenChange(false);
  }

  const type = watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
          <DialogDescription>Capture an expense, income, or transfer.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            {(["EXPENSE","INCOME","TRANSFER"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setValue("type", t)}
                className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                  type === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"
                }`}
              >
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <Label>Date</Label>
              <Input type="datetime-local" {...register("occurredAt" as any)} />
            </div>
          </div>
          <div>
            <Label>Merchant / Source</Label>
            <Input placeholder="e.g. Swiggy, Acme Corp" {...register("merchant")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select defaultValue="FOOD" onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment mode</Label>
              <Select defaultValue="UPI" onValueChange={(v: any) => setValue("paymentMode", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Input placeholder="optional" {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
