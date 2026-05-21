"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Command, Moon, Plus, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { QuickAddModal } from "./QuickAddModal";
import { GlobalSearch } from "./GlobalSearch";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { signIn, signOut, useSession } from "next-auth/react";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState(false);
  const [quick, setQuick] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearch(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        setQuick(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <button
          onClick={() => setSearch(true)}
          className="flex flex-1 max-w-md items-center gap-2 rounded-lg border border-input bg-card/60 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search transactions, merchants, goals…</span>
          <span className="sm:hidden">Search</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px]">
            <Command className="h-3 w-3" /> K
          </kbd>
        </button>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="default" onClick={() => setQuick(true)} className="hidden sm:inline-flex">
            <Plus className="h-3.5 w-3.5" />
            Quick add
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setQuick(true)} className="sm:hidden">
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          <Link href="/notifications">
            <Button size="icon" variant="ghost">
              <Bell className="h-4 w-4" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1">
                <Avatar>
                  <AvatarImage src={session?.user?.image ?? undefined} />
                  <AvatarFallback>{session?.user?.name?.[0] ?? "D"}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm">{session?.user?.name ?? "Demo User"}</span>
                  <span className="text-xs text-muted-foreground">{session?.user?.email ?? "demo@finance-os.app"}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/imports">Import history</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              {session ? (
                <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => signIn("google")}>Sign in with Google</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <GlobalSearch open={search} onOpenChange={setSearch} />
      <QuickAddModal open={quick} onOpenChange={setQuick} />
    </header>
  );
}
