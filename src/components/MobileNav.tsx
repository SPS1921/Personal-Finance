"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, PiggyBank, Sparkles, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/expenses", label: "Txns", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/forecast", label: "Forecast", icon: Sparkles },
  { href: "/upload", label: "Upload", icon: Upload },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
      <ul className="grid grid-cols-5 h-14">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "h-full flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-primary")} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
