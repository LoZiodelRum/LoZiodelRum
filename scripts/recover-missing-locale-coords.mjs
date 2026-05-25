#!/usr/bin/env node

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://ptfywgpplpcvjyohnpkv.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Znl3Z3BwbHBjdmp5b2hucGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTc2NDMsImV4cCI6MjA4NjQ5MzY0M30.k_TIoofgRdnpoS2S3jipsPrfd4e2KDMU3vqFWrC63-s";

const APPLY = process.argv.includes("--apply");
const WAIT_MS = 1200;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clean(value) {
  return String(value || "").trim();
}

function hasCoords(row) {
  const lat = clean(row.latitudine);
  const lng = clean(row.longitudine);
  return lat.length > 0 && lng.length > 0;
}

function buildQueries(row) {
  const nome = clean(row.nome);
  const indirizzo = clean(row.indirizzo).replace(/,+$/g, "");
  const citta = clean(row.citta);
  const paese = clean(row.paese);

  const queries = [
    [nome, indirizzo, citta, paese].filter(Boolean).join(", "),
    [indirizzo, citta, paese].filter(Boolean).join(", "),
    [nome, citta, paese].filter(Boolean).join(", "),
    [nome, paese].filter(Boolean).join(", "),
  ].filter(Boolean);

  return [...new Set(queries)];
}

async function geocodeOne(query) {
  const endpoint = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(endpoint, {
    headers: {
      "User-Agent": "drinkwise-coordinate-recovery/1.0",
      "Accept-Language": "it,en",
    },
  });

  if (!response.ok) return null;
  const payload = await response.json();
  if (!Array.isArray(payload) || !payload[0]) return null;

  const first = payload[0];
  const lat = Number(first.lat);
  const lon = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return {
    latitudine: lat,
    longitudine: lon,
    display_name: first.display_name || query,
  };
}

async function fetchLocali() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/Locali?select=id,nome,indirizzo,citta,paese,latitudine,longitudine`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Fetch Locali failed: HTTP ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

async function updateCoords(id, latitudine, longitudine) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/Locali?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ latitudine, longitudine }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Update failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload[0] || null : null;
}

async function main() {
  const rows = await fetchLocali();
  const missing = rows.filter((row) => !hasCoords(row));

  const report = {
    total: rows.length,
    alreadyWithCoords: rows.length - missing.length,
    missingBefore: missing.length,
    mode: APPLY ? "apply" : "dry-run",
    recovered: [],
    unresolved: [],
  };

  for (const row of missing) {
    const queries = buildQueries(row);
    let found = null;

    for (const query of queries) {
      try {
        found = await geocodeOne(query);
      } catch {
        found = null;
      }

      if (found) {
        report.recovered.push({
          id: row.id,
          nome: row.nome,
          query,
          latitudine: found.latitudine,
          longitudine: found.longitudine,
          source: found.display_name,
          applied: false,
        });
        break;
      }

      await sleep(WAIT_MS);
    }

    if (!found) {
      report.unresolved.push({
        id: row.id,
        nome: row.nome,
        indirizzo: row.indirizzo,
        citta: row.citta,
        paese: row.paese,
      });
    }

    await sleep(WAIT_MS);
  }

  if (APPLY) {
    for (const item of report.recovered) {
      try {
        await updateCoords(item.id, item.latitudine, item.longitudine);
        item.applied = true;
      } catch (error) {
        item.applied = false;
        item.error = String(error.message || error);
      }
      await sleep(250);
    }
  }

  const afterRows = await fetchLocali();
  const stillMissing = afterRows.filter((row) => !hasCoords(row));

  report.missingAfter = stillMissing.length;
  report.withCoordsAfter = afterRows.length - stillMissing.length;

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(String(error.message || error));
  process.exit(1);
});
