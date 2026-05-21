import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { parseCSV } from "@/lib/parsers/csv";
import { ingestTransactions } from "@/lib/ingest";
import { uploadFile } from "@/lib/storage";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const mappingRaw = form.get("mapping") as string | null;
  const mapping = mappingRaw ? JSON.parse(mappingRaw) : undefined;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const text = await file.text();
  let fileId: string | undefined;
  try {
    const { key } = await uploadFile(user.id, file);
    const uploaded = await prisma.uploadedFile.create({
      data: { userId: user.id, filename: file.name, size: file.size, mimeType: file.type || "text/csv", storageKey: key },
    });
    fileId = uploaded.id;
  } catch {}

  const { transactions, mapping: detectedMapping, headers, errors } = await parseCSV(text, user.id, mapping);
  const result = await ingestTransactions(user.id, "CSV", transactions, { fileId, errors, mapping: detectedMapping });
  return NextResponse.json({ ...result, headers, mapping: detectedMapping });
}
