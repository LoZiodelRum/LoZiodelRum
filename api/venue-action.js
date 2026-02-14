/**
 * API Vercel: approva o rifiuta un locale in venues_cloud.
 */
import { Client } from "pg";

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
  const { action, id, latitude, longitude } = body;
  if (!action || !id) return res.status(400).json({ ok: false, error: "action e id obbligatori" });
  if (action !== "approve" && action !== "reject") return res.status(400).json({ ok: false, error: "action deve essere approve o reject" });

  let client;
  try {
    client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    await client.connect();
    if (action === "approve") {
      const updates = ["status = 'approved'"];
      const params = [id];
      let i = 2;
      if (latitude != null && !isNaN(latitude)) {
        updates.push(`latitude = $${i++}`);
        params.push(latitude);
      }
      if (longitude != null && !isNaN(longitude)) {
        updates.push(`longitude = $${i++}`);
        params.push(longitude);
      }
      await client.query(
        `update public.venues_cloud set ${updates.join(", ")} where id = $1`,
        params
      );
      const r = await client.query(`select * from public.venues_cloud where id = $1`, [id]);
      const row = r.rows[0];
      await client.end();
      return res.status(200).json({ ok: true, venue: row ? { ...row, id: String(row.id) } : null });
    } else {
      await client.query(`update public.venues_cloud set status = 'rejected' where id = $1`, [id]);
      await client.end();
      return res.status(200).json({ ok: true });
    }
  } catch (err) {
    if (client) try { await client.end(); } catch (_) {}
    console.error("venue-action:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
