import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { parseCSV } from "@/lib/parsers/csv";
import { parseXLSX } from "@/lib/parsers/xlsx";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
    const buf = await file.arrayBuffer();
    const r = await parseXLSX(buf, user.id);
    return NextResponse.json({ headers: r.headers, mapping: r.mapping, sample: r.transactions.slice(0, 10), total: r.transactions.length });
  }
  const text = await file.text();
  const r = await parseCSV(text, user.id);
  return NextResponse.json({ headers: r.headers, mapping: r.mapping, sample: r.transactions.slice(0, 10), total: r.transactions.length });
}
