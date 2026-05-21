"use client";
import { Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props { type: "positive" | "warning" | "info"; title: string; body: string }

const styles = {
  positive: { Icon: CheckCircle2, bg: "bg-emerald-500/10", color: "text-emerald-500", ring: "ring-emerald-500/20" },
  warning: { Icon: AlertTriangle, bg: "bg-amber-500/10", color: "text-amber-500", ring: "ring-amber-500/20" },
  info: { Icon: Lightbulb, bg: "bg-blue-500/10", color: "text-blue-500", ring: "ring-blue-500/20" },
};

export function InsightCard({ type, title, body }: Props) {
  const s = styles[type];
  const Icon = s.Icon;
  return (
    <div className={`bento p-4 ring-1 ${s.ring}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${s.bg} ${s.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
        </div>
      </div>
    </div>
  );
}
