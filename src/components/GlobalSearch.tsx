"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command as CommandIcon, Receipt, Target, PiggyBank, CreditCard, Sparkles, Upload, LayoutDashboard } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";

const COMMANDS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Expenses", icon: Receipt, href: "/expenses" },
  { label: "Budgets", icon: PiggyBank, href: "/budgets" },
  { label: "Goals", icon: Target, href: "/goals" },
  { label: "Debts", icon: CreditCard, href: "/debts" },
  { label: "Forecast", icon: Sparkles, href: "/forecast" },
  { label: "Upload data", icon: Upload, href: "/upload" },
];

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!q) { setResults([]); return; }
    const ctrl = new AbortController();
    fetch(`/api/transactions?q=${encodeURIComponent(q)}&take=8`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setResults(d.items ?? []))
      .catch(() => {});
    return () => ctrl.abort();
  }, [q]);

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Global search</DialogTitle>
        <DialogDescription className="sr-only">Search transactions, navigate, or run commands.</DialogDescription>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <CommandIcon className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search anything…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin p-2">
          {filtered.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">Navigate</div>
              {filtered.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.href}
                    onClick={() => navigate(c.href)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {c.label}
                  </button>
                );
              })}
            </div>
          )}
          {results.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">Transactions</div>
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(`/expenses?id=${r.id}`)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <div className="flex flex-col items-start">
                    <span>{r.merchant}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(r.occurredAt).toLocaleDateString()} · {r.category}
                    </span>
                  </div>
                  <span className="number text-sm font-medium">₹{Number(r.amount).toLocaleString("en-IN")}</span>
                </button>
              ))}
            </div>
          )}
          {!q && (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              Type to search transactions, navigate, or run commands.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
