"use client";
import { useApi } from "@/lib/fetcher";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Loader2, XCircle, AlertTriangle, Clock } from "lucide-react";

const ICONS: Record<string, any> = {
  COMPLETED: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  PROCESSING: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
  FAILED: <XCircle className="h-4 w-4 text-red-500" />,
  PARTIAL: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  PENDING: <Clock className="h-4 w-4 text-muted-foreground" />,
};

export default function ImportsPage() {
  const { data } = useApi<any>("/api/import/jobs");
  const items = data?.items ?? [];

  const total = items.length;
  const failed = items.filter((j: any) => j.status === "FAILED").length;
  const duplicates = items.reduce((s: number, j: any) => s + j.duplicateRows, 0);
  const imported = items.reduce((s: number, j: any) => s + j.importedRows, 0);
  const avgConf = items.length ? items.reduce((s: number, j: any) => s + (j.confidence ?? 0), 0) / items.length : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import history</h1>
        <p className="text-sm text-muted-foreground">Audit log of every ingestion job.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bento p-5"><p className="text-[11px] uppercase text-muted-foreground">Total imports</p><p className="number text-2xl font-semibold">{total}</p></div>
        <div className="bento p-5"><p className="text-[11px] uppercase text-muted-foreground">Imported rows</p><p className="number text-2xl font-semibold">{imported.toLocaleString()}</p></div>
        <div className="bento p-5"><p className="text-[11px] uppercase text-muted-foreground">Duplicates skipped</p><p className="number text-2xl font-semibold">{duplicates.toLocaleString()}</p></div>
        <div className="bento p-5"><p className="text-[11px] uppercase text-muted-foreground">Avg confidence</p><p className="number text-2xl font-semibold">{Math.round(avgConf * 100)}%</p></div>
      </div>

      <div className="bento overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
          <div className="col-span-3">File</div>
          <div className="col-span-1">Source</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Imported</div>
          <div className="col-span-1 text-right">Dups</div>
          <div className="col-span-1 text-right">Failed</div>
          <div className="col-span-1 text-right">Conf</div>
          <div className="col-span-2 text-right">When</div>
        </div>
        {items.map((j: any) => (
          <div key={j.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm border-b border-border/60 last:border-0">
            <div className="col-span-3 truncate font-medium">{j.file?.filename ?? "Manual"}</div>
            <div className="col-span-1"><Badge variant="outline">{j.source}</Badge></div>
            <div className="col-span-2 flex items-center gap-1.5 text-xs">{ICONS[j.status]} {j.status}</div>
            <div className="col-span-1 text-right number">{j.importedRows}</div>
            <div className="col-span-1 text-right number text-muted-foreground">{j.duplicateRows}</div>
            <div className="col-span-1 text-right number text-red-500">{j.failedRows}</div>
            <div className="col-span-1 text-right text-xs text-muted-foreground">{Math.round((j.confidence ?? 0) * 100)}%</div>
            <div className="col-span-2 text-right text-xs text-muted-foreground">{new Date(j.startedAt).toLocaleString()}</div>
          </div>
        ))}
        {items.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No imports yet.</p>}
      </div>
    </div>
  );
}
