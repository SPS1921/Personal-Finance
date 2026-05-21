import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { parsePDF } from "@/lib/parsers/pdf";
import { ingestTransactions } from "@/lib/ingest";
import { uploadFile } from "@/lib/storage";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  let fileId: string | undefined;
  try {
    const { key } = await uploadFile(user.id, file);
    const uploaded = await prisma.uploadedFile.create({
      data: { userId: user.id, filename: file.name, size: file.size, mimeType: file.type || "application/pdf", storageKey: key },
    });
    fileId = uploaded.id;
  } catch {}

  const { transactions, errors } = await parsePDF(buffer, user.id);
  const result = await ingestTransactions(user.id, "PDF", transactions, { fileId, errors });
  return NextResponse.json(result);
}
