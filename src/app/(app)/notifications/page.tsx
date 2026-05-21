"use client";
import { useApi } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";

export default function NotificationsPage() {
  const { data } = useApi<any>("/api/notifications");
  const refresh = useStore((s) => s.bumpVersion);
  const items = data?.items ?? [];

  async function markAll() {
    await fetch("/api/notifications", { method: "PATCH", body: JSON.stringify({}) });
    refresh();
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">EMI due, low balance, goals, budgets, insights.</p>
        </div>
        <Button size="sm" variant="outline" onClick={markAll}>Mark all read</Button>
      </div>
      <div className="bento overflow-hidden">
        {items.map((n: any) => (
          <div key={n.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/60 last:border-0">
            {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{n.title}</p>
                <Badge variant="outline">{n.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{n.body}</p>
            </div>
            <p className="text-[11px] text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {items.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">All clear.</p>}
      </div>
    </div>
  );
}
