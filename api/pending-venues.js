/**
 * API Vercel: restituisce i locali in attesa (status=pending) da Supabase.
 * Usato dalla Dashboard quando il client non ha Supabase configurato.
 */
import { Client } from "pg";

const INIT_SQL = `
create table if not exists public.venues_cloud (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  description text,
  city text,
  country text default 'Italia',
  address text,
  latitude double precision,
  longitude double precision,
  cover_image text,
  category text,
  price_range text,
  phone text,
  website text,
  instagram text,
  opening_hours text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  avg_drink_quality numeric,
  avg_staff_competence numeric,
  avg_atmosphere numeric,
  avg_value numeric,
  overall_rating numeric,
  review_count int default 0,
  featured boolean default false,
  verified boolean default true
);
alter table public.venues_cloud enable row level security;
drop policy if exists "Allow insert for everyone" on public.venues_cloud;
create policy "Allow insert for everyone" on public.venues_cloud for insert with check (true);
drop policy if exists "Allow read for everyone" on public.venues_cloud;
create policy "Allow read for everyone" on public.venues_cloud for select using (true);
drop policy if exists "Allow update for everyone" on public.venues_cloud;
create policy "Allow update for everyone" on public.venues_cloud for update using (true) with check (true);
create index if not exists idx_venues_cloud_status on public.venues_cloud (status);
create index if not exists idx_venues_cloud_created_at on public.venues_cloud (created_at desc);
`;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!url) {
    return res.status(503).json({ ok: false, error: "SUPABASE_DB_URL non configurato" });
  }
  let client;
  try {
    client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    await client.connect();
    await client.query(INIT_SQL);
    const r = await client.query(
      `select * from public.venues_cloud where status = 'pending' order by created_at desc`
    );
    await client.end();
    const list = (r.rows || []).map((row) => ({ ...row, id: String(row.id) }));
    return res.status(200).json({ ok: true, data: list });
  } catch (err) {
    if (client) try { await client.end(); } catch (_) {}
    console.error("pending-venues:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
