import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { parseXLSX } from "@/lib/parsers/xlsx";
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

  const buffer = await file.arrayBuffer();
  let fileId: string | undefined;
  try {
    const { key } = await uploadFile(user.id, file);
    const uploaded = await prisma.uploadedFile.create({
      data: { userId: user.id, filename: file.name, size: file.size, mimeType: file.type || "application/vnd.ms-excel", storageKey: key },
    });
    fileId = uploaded.id;
  } catch {}

  const { transactions, mapping: detectedMapping, headers, errors } = await parseXLSX(buffer, user.id, mapping);
  const result = await ingestTransactions(user.id, "XLSX", transactions, { fileId, errors, mapping: detectedMapping });
  return NextResponse.json({ ...result, headers, mapping: detectedMapping });
}
