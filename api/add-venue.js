/**
 * API Vercel: riceve locali da tablet/cellulare e li inserisce in Supabase.
 * Usato quando VITE_SUPABASE_* non sono configurate sul client.
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
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!url) {
    return res.status(503).json({ ok: false, error: "SUPABASE_DB_URL non configurato" });
  }
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ ok: false, error: "Body JSON non valido" });
  }
  const name = (body.name || "").trim();
  if (!name) return res.status(400).json({ ok: false, error: "name obbligatorio" });

  const row = {
    name,
    slug: body.slug || name.toLowerCase().replace(/\s+/g, "-"),
    description: body.description || "",
    city: body.city || "",
    country: body.country || "Italia",
    address: body.address || "",
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    cover_image: body.cover_image || "",
    category: body.category || "cocktail_bar",
    price_range: body.price_range || "€€",
    phone: body.phone || "",
    website: body.website || "",
    instagram: body.instagram || "",
    opening_hours: body.opening_hours || "",
    status: "pending",
  };

  let client;
  try {
    client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    await client.connect();
    await client.query(INIT_SQL);
    const r = await client.query(
      `insert into public.venues_cloud (name, slug, description, city, country, address, latitude, longitude, cover_image, category, price_range, phone, website, instagram, opening_hours, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       returning id`,
      [row.name, row.slug, row.description, row.city, row.country, row.address, row.latitude, row.longitude, row.cover_image, row.category, row.price_range, row.phone, row.website, row.instagram, row.opening_hours, row.status]
    );
    const id = r.rows[0]?.id;
    await client.end();
    return res.status(200).json({ ok: true, id: String(id), pending: true });
  } catch (err) {
    if (client) try { await client.end(); } catch (_) {}
    console.error("add-venue:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
