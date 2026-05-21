"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Target,
  BarChart3,
  Sparkles,
  Upload,
  History,
  Settings,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; group?: string }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/income", label: "Income", icon: TrendingUp },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/debts", label: "Debts & EMI", icon: CreditCard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/analytics", label: "Analytics", icon: BarChart3, group: "Intelligence" },
  { href: "/forecast", label: "Forecast", icon: Sparkles, group: "Intelligence" },
  { href: "/upload", label: "Upload Center", icon: Upload, group: "Data" },
  { href: "/imports", label: "Import History", icon: History, group: "Data" },
  { href: "/settings", label: "Settings", icon: Settings, group: "Account" },
];

export function Sidebar() {
  const pathname = usePathname();
  const groups: Record<string, typeof NAV> = {};
  for (const item of NAV) {
    const g = item.group ?? "Workspace";
    (groups[g] ||= []).push(item);
  }

  return (
    <aside className="hidden lg:flex h-screen w-60 flex-col border-r border-border bg-card/40 backdrop-blur-xl sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
          <Wallet className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">Finance OS</span>
          <span className="text-[10px] text-muted-foreground">v1.0 · production</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mt-4">
            <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{group}</div>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                        active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                      )}
                    >
                      {active && <span className="absolute inset-y-1 left-0 w-0.5 rounded-r-full bg-primary" />}
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="bento p-3">
          <p className="text-xs font-medium">Demo data loaded</p>
          <p className="text-[11px] text-muted-foreground mt-1">Connect Google to sync your own.</p>
        </div>
      </div>
    </aside>
  );
}
