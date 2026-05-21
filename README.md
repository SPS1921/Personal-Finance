# Finance OS

A production-grade, AI-powered personal finance operating system built on Next.js 15, Prisma, Supabase, and shadcn/ui. Real-time dashboard, smart ingestion (CSV / XLSX / PDF / Receipt OCR), categorization rules, forecasting, debt analytics, and PWA support.

## Stack
- Next.js 15 (App Router, React Server Components, edge-ready)
- TypeScript + Tailwind + shadcn-style primitives
- Prisma + PostgreSQL (Supabase compatible)
- NextAuth (Google) with Prisma adapter
- Supabase realtime + storage (signed URLs)
- Zustand for UI state, TanStack Query for server cache
- Recharts, Framer Motion
- React Hook Form + Zod validation
- PapaParse, SheetJS, pdf-parse, Tesseract.js for ingestion
- next-pwa for installable PWA

## Folder structure

```
prisma/
  schema.prisma       # Full DB schema
  seed.ts             # Realistic demo data
public/
  manifest.json
src/
  app/
    (app)/
      layout.tsx
      dashboard/page.tsx
      expenses/page.tsx
      budgets/page.tsx
      income/page.tsx
      debts/page.tsx
      goals/page.tsx
      analytics/page.tsx
      forecast/page.tsx
      upload/page.tsx
      imports/page.tsx
      notifications/page.tsx
      settings/page.tsx
    api/
      auth/[...nextauth]/route.ts
      transactions/route.ts
      transactions/[id]/route.ts
      budgets/route.ts
      budgets/[id]/route.ts
      goals/route.ts
      goals/[id]/route.ts
      debts/route.ts
      debts/[id]/route.ts
      income/route.ts
      accounts/route.ts
      analytics/route.ts
      forecast/route.ts
      notifications/route.ts
      import/csv/route.ts
      import/excel/route.ts
      import/pdf/route.ts
      import/receipt/route.ts
      import/manual/route.ts
      import/preview/route.ts
      import/jobs/route.ts
      export/csv/route.ts
      rules/route.ts
      workers/run/route.ts
    layout.tsx
    page.tsx
    login/page.tsx
    globals.css
  components/
    ui/                 # button, input, card, dialog, select, tabs, ...
    charts/             # CashflowChart, SpendByCategory, ForecastChart
    Sidebar.tsx
    Topbar.tsx
    GlobalSearch.tsx
    QuickAddModal.tsx
    StatsCard.tsx
    BudgetProgress.tsx
    GoalTracker.tsx
    DebtCard.tsx
    ExpenseTable.tsx
    InsightCard.tsx
    UploadDropzone.tsx
    FinancialHealthGauge.tsx
    Providers.tsx
    RealtimeBridge.tsx
    ThemeProvider.tsx
  lib/
    db.ts               # Prisma singleton
    auth.ts             # NextAuth config
    session.ts          # getCurrentUser / requireUser
    supabase.ts         # browser + admin clients
    storage.ts          # uploadFile / signed URL
    utils.ts            # cn, formatters, helpers
    validators.ts       # Zod schemas
    store.ts            # Zustand store
    fetcher.ts          # useApi (react-query + version bump)
    analytics.ts        # stats, breakdowns, insights
    ingest.ts           # batched insert + dedup
    normalizers/index.ts
    categorization/index.ts
    parsers/csv.ts
    parsers/xlsx.ts
    parsers/pdf.ts
    ocr/receipt.ts
  workers/recurring.ts  # background-style jobs
  middleware.ts         # security headers
  types/next-auth.d.ts
```

## Setup

```bash
pnpm install              # or npm / yarn
cp .env.example .env
# fill DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID/SECRET,
# and (optional) Supabase keys

pnpm db:push              # push schema
pnpm db:seed              # seed demo user + 300+ realistic transactions
pnpm dev
```

Open http://localhost:3000 — the demo user is auto-loaded when no session exists, so you can interact with the full app immediately. Sign in with Google to switch to your own account.

## Realtime sync

`RealtimeBridge` subscribes to Supabase `postgres_changes` on `Transaction`, `Budget`, `Goal`, and `ImportJob`. Every mutation bumps a Zustand `version`, which invalidates all React Query keys keyed on it. Without Supabase keys, refresh still works because every mutation in the app calls `bumpVersion` directly.

## Ingestion pipeline

```
Upload → parser → normalizer → categorization → dedup hash → batched insert → notification
```

- **CSV / XLSX** — header autodetection with field aliases (date, amount, debit/credit, narration). Manual column mapping supported via the optional `mapping` formData field. Mapping templates persist per user.
- **PDF** — regex-based row extraction tuned for Indian bank statements; falls back to text dump if no rows are matched.
- **Receipt OCR** — Tesseract worker pulls merchant, date, total. Confidence stored per row.
- **Manual** — POST a single object or array to `/api/import/manual`.
- **Dedup** — SHA-256 of `userId|date|merchant|amount|type` enforced by a unique index.
- **Confidence** — average rule + parser confidence stored on each `ImportJob`.

## Security

- HTTP security headers via `middleware.ts`
- Row scoping on every Prisma read/write (`where: { userId }`)
- Signed Supabase URLs for uploaded files
- Zod validation on all mutating routes
- NextAuth session-based auth, Google provider, secure cookies
- File type allowlist on dropzone

## Deployment (Vercel)

1. Push to GitHub.
2. Import in Vercel; set the env vars from `.env.example`.
3. Add Supabase Postgres connection string as `DATABASE_URL` + `DIRECT_URL`.
4. Add Google OAuth redirect: `https://<your-domain>/api/auth/callback/google`.
5. Vercel runs `prisma generate && next build` from `package.json`.

PWA is enabled in production builds via `next-pwa`. Add icons in `public/icons/`.

## What's wired vs what's stubbed

- Wired: every page, every API route, parsers, normalizers, categorization rules engine, ingest pipeline with dedup, analytics, forecast simulator, insights, dropzone with per-file progress, realtime bridge, theme toggle, Cmd+K search, quick-add modal, PWA.
- Stubbed (clearly): Google Sheets two-way sync (placeholder API surface only), email/push channels for notifications (in-app works; channel send not configured), heuristic recurring/lifestyle-inflation detection lives in `analytics.ts` (no LLM call — wire `OPENAI_API_KEY` and add a single call inside `getInsights` to upgrade).
