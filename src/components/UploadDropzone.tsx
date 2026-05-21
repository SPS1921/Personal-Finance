"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, FileText, FileSpreadsheet, FileImage, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

type Status = "queued" | "uploading" | "done" | "error";
interface Item { file: File; status: Status; progress: number; result?: any; error?: string }

const ROUTE: Record<string, string> = {
  csv: "/api/import/csv",
  xlsx: "/api/import/excel",
  xls: "/api/import/excel",
  pdf: "/api/import/pdf",
  jpg: "/api/import/receipt",
  jpeg: "/api/import/receipt",
  png: "/api/import/receipt",
  webp: "/api/import/receipt",
};

function iconFor(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv" || ext === "xlsx" || ext === "xls") return FileSpreadsheet;
  if (ext === "pdf") return FileText;
  return FileImage;
}

export function UploadDropzone() {
  const [items, setItems] = useState<Item[]>([]);
  const refresh = useStore((s) => s.bumpVersion);

  const onDrop = useCallback((files: File[]) => {
    setItems((prev) => [...prev, ...files.map((f) => ({ file: f, status: "queued" as Status, progress: 0 }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
  });

  async function processOne(idx: number) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, status: "uploading", progress: 10 } : it)));
    const it = items[idx];
    const ext = it.file.name.split(".").pop()?.toLowerCase() ?? "";
    const url = ROUTE[ext];
    if (!url) {
      setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, status: "error", error: "Unsupported file" } : p)));
      return;
    }
    const fd = new FormData();
    fd.append("file", it.file);
    try {
      const res = await fetch(url, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, status: "done", progress: 100, result: data } : p)));
      toast.success(`${it.file.name}: ${data.imported} imported, ${data.duplicates} duplicates`);
      refresh();
    } catch (e: any) {
      setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, status: "error", error: e.message } : p)));
      toast.error(`${it.file.name}: ${e.message}`);
    }
  }

  async function processAll() {
    for (let i = 0; i < items.length; i++) {
      if (items[i].status === "queued") {
        await processOne(i);
      }
    }
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`bento border-dashed border-2 ${
          isDragActive ? "border-primary bg-primary/5" : "border-border"
        } p-10 text-center cursor-pointer transition-colors`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium">Drop CSV, XLSX, PDF or receipt images</p>
          <p className="text-xs text-muted-foreground">Bank statements · UPI exports · Receipts · Multi-file supported</p>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Queue ({items.length})</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setItems([])}>Clear</Button>
              <Button size="sm" onClick={processAll}>Process all</Button>
            </div>
          </div>
          {items.map((it, i) => {
            const Icon = iconFor(it.file);
            return (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bento p-3 flex items-center gap-3"
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{it.file.name}</p>
                  <p className="text-[11px] text-muted-foreground">{(it.file.size / 1024).toFixed(1)} KB</p>
                  {it.status === "uploading" && (
                    <div className="mt-1 h-1 rounded-full bg-secondary overflow-hidden">
                      <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${it.progress}%` }} />
                    </div>
                  )}
                  {it.status === "done" && it.result && (
                    <p className="text-[11px] text-emerald-500 mt-1">
                      {it.result.imported} imported · {it.result.duplicates} dup · {it.result.failed} failed · confidence {Math.round((it.result.confidence || 0) * 100)}%
                    </p>
                  )}
                  {it.error && <p className="text-[11px] text-red-500 mt-1">{it.error}</p>}
                </div>
                <div>
                  {it.status === "queued" && (
                    <Button size="sm" onClick={() => processOne(i)}>Process</Button>
                  )}
                  {it.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {it.status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {it.status === "error" && (
                    <Button size="sm" variant="ghost" onClick={() => processOne(i)}>Retry</Button>
                  )}
                </div>
                <Button size="icon" variant="ghost" onClick={() => setItems((prev) => prev.filter((_, x) => x !== i))}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
