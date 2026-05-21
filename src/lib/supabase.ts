import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && anon
    ? createClient(url, anon, { realtime: { params: { eventsPerSecond: 10 } } })
    : null;

export const supabaseAdmin =
  url && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    : null;
