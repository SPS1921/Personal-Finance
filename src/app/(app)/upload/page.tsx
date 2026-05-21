"use client";
import Link from "next/link";
import { UploadDropzone } from "@/components/UploadDropzone";
import { FileSpreadsheet, FileText, FileImage, Zap } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Upload center</h1>
          <p className="text-sm text-muted-foreground">Statements, exports, receipts — drop them in, we do the rest.</p>
        </div>
        <Link href="/imports" className="text-xs text-muted-foreground hover:text-foreground">View import history →</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
        <div className="bento p-4 flex items-center gap-3"><FileSpreadsheet className="h-5 w-5 text-emerald-500" /><div><p className="text-sm font-medium">CSV / XLSX</p><p className="text-[11px] text-muted-foreground">Auto column mapping</p></div></div>
        <div className="bento p-4 flex items-center gap-3"><FileText className="h-5 w-5 text-rose-500" /><div><p className="text-sm font-medium">PDF statements</p><p className="text-[11px] text-muted-foreground">Tabular extraction</p></div></div>
        <div className="bento p-4 flex items-center gap-3"><FileImage className="h-5 w-5 text-blue-500" /><div><p className="text-sm font-medium">Receipts</p><p className="text-[11px] text-muted-foreground">OCR + merchant detect</p></div></div>
        <div className="bento p-4 flex items-center gap-3"><Zap className="h-5 w-5 text-amber-500" /><div><p className="text-sm font-medium">Real-time sync</p><p className="text-[11px] text-muted-foreground">Dashboard auto-refresh</p></div></div>
      </div>

      <UploadDropzone />

      <div className="bento p-5">
        <h3 className="text-sm font-medium mb-2">Pipeline</h3>
        <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
          <li>Upload → file stored with signed URL</li>
          <li>Parse → CSV/XLSX/PDF/OCR extract rows</li>
          <li>Normalize → dates, amounts, merchant aliases</li>
          <li>Categorize → rules + fallback heuristics</li>
          <li>Deduplicate → SHA-256 hash per transaction</li>
          <li>Persist → batched inserts in 100-row chunks</li>
          <li>Realtime → dashboard, budgets, goals refresh</li>
        </ol>
      </div>
    </div>
  );
}
