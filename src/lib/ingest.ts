import { prisma } from "@/lib/db";
import { ImportSource, ImportStatus } from "@/lib/types";
import { ParsedTransaction, txnHash } from "@/lib/normalizers";

export interface IngestResult {
  jobId: string;
  total: number;
  imported: number;
  duplicates: number;
  failed: number;
  confidence: number;
  errors: string[];
}

export async function ingestTransactions(
  userId: string,
  source: ImportSource,
  parsed: ParsedTransaction[],
  options: { fileId?: string; errors?: string[]; mapping?: any } = {},
): Promise<IngestResult> {
  const job = await prisma.importJob.create({
    data: {
      userId,
      source,
      fileId: options.fileId,
      status: ImportStatus.PROCESSING,
      totalRows: parsed.length,
      mapping: options.mapping ? JSON.stringify(options.mapping) : undefined,
    },
  });

  let imported = 0;
  let duplicates = 0;
  let failed = 0;
  let confSum = 0;
  const errors = [...(options.errors ?? [])];

  const CHUNK = 100;
  for (let i = 0; i < parsed.length; i += CHUNK) {
    const slice = parsed.slice(i, i + CHUNK);
    const hashed = slice.map((t) => ({ t, hash: txnHash(userId, t) }));
    const hashes = hashed.map((x) => x.hash);
    const existing = await prisma.transaction.findMany({
      where: { hash: { in: hashes } },
      select: { hash: true },
    });
    const existingSet = new Set(existing.map((e) => e.hash));
    const fresh = hashed.filter((x) => !existingSet.has(x.hash));
    duplicates += hashed.length - fresh.length;

    if (fresh.length) {
      try {
        const res = await prisma.transaction.createMany({
          data: fresh.map(({ t, hash }) => ({
            userId,
            importJobId: job.id,
            type: t.type,
            amount: t.amount,
            category: t.category,
            merchant: t.merchant,
            merchantKey: t.merchantKey,
            paymentMode: t.paymentMode,
            occurredAt: t.occurredAt,
            notes: t.notes,
            confidence: t.confidence,
            hash,
          })),
        });
        imported += res.count;
      } catch (e: any) {
        failed += fresh.length;
        errors.push(e.message ?? String(e));
      }
    }
    confSum += slice.reduce((s, t) => s + t.confidence, 0);
  }

  const confidence = parsed.length ? confSum / parsed.length : 0;
  const status: ImportStatus =
    failed === parsed.length && parsed.length > 0
      ? ImportStatus.FAILED
      : failed > 0
      ? ImportStatus.PARTIAL
      : ImportStatus.COMPLETED;

  await prisma.importJob.update({
    where: { id: job.id },
    data: {
      status,
      importedRows: imported,
      duplicateRows: duplicates,
      failedRows: failed,
      confidence,
      errorLog: errors.length ? JSON.stringify(errors) : undefined,
      finishedAt: new Date(),
    },
  });

  if (imported > 0) {
    await prisma.notification.create({
      data: {
        userId,
        type: "INSIGHT",
        title: "Import complete",
        body: `${imported} transactions imported · ${duplicates} duplicates · ${failed} failed`,
        meta: JSON.stringify({ jobId: job.id }),
      },
    });
  }

  return { jobId: job.id, total: parsed.length, imported, duplicates, failed, confidence, errors };
}
