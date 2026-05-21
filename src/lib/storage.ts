import { supabaseAdmin } from "./supabase";
import { randomUUID } from "crypto";

const BUCKET = "imports";

export async function uploadFile(userId: string, file: File): Promise<{ key: string; url: string | null }> {
  const key = `${userId}/${Date.now()}-${randomUUID()}-${file.name}`;
  if (!supabaseAdmin) {
    return { key, url: null };
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(key, buf, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(key, 60 * 60);
  return { key, url: data?.signedUrl ?? null };
}

export async function getSignedUrl(key: string, expires = 3600) {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(key, expires);
  return data?.signedUrl ?? null;
}
