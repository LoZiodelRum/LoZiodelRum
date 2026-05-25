-- Recover missing Locali coordinates using geocoded results (2026-05-25).
-- Scope: only rows with currently NULL coordinates, to avoid overwriting existing values.

update "Locali"
set latitudine = 41.8978467, longitudine = 12.4679187
where id = 'f367adbd-01d4-4bfb-bf9c-91a68e8f36d5'
  and latitudine is null and longitudine is null;

update "Locali"
set latitudine = 40.8995413, longitudine = 14.2216833
where id = 'bfce4b57-fb5c-48fa-9ac5-aa757155c948'
  and latitudine is null and longitudine is null;

update "Locali"
set latitudine = 37.3491904, longitudine = 13.8431798
where id = 'ed7aac64-48e6-49e0-a02b-1cdf400454d4'
  and latitudine is null and longitudine is null;

update "Locali"
set latitudine = 43.7711166, longitudine = 11.2599755
where id = '4f668362-9818-48a6-adad-968ae2f2ce57'
  and latitudine is null and longitudine is null;

update "Locali"
set latitudine = 32.739629, longitudine = -9.0308161
where id = '80115ac6-1af3-46ae-a55b-cf387e74cf10'
  and latitudine is null and longitudine is null;

update "Locali"
set latitudine = 45.4512973, longitudine = 9.1733671
where id = '662bed0e-9fc9-4175-bc05-c4241a26fea1'
  and latitudine is null and longitudine is null;

update "Locali"
set latitudine = -22.9842958, longitudine = -43.2274951
where id = 'f99dc206-3e2d-4241-a401-ef1f3afb8b12'
  and latitudine is null and longitudine is null;

update "Locali"
set latitudine = 45.6980368, longitudine = 12.2575047
where id = '316cdeef-ba98-439c-8713-4963f7466c0e'
  and latitudine is null and longitudine is null;

update "Locali"
set latitudine = 42.6915976, longitudine = 23.3302989
where id = '4b15d0ab-9392-40b8-b21d-075eba5e72c5'
  and latitudine is null and longitudine is null;

update "Locali"
set latitudine = 41.8951436, longitudine = 12.4978655
where id = '3f5aa5cc-0dc5-44da-b367-6556025f5e1c'
  and latitudine is null and longitudine is null;

update "Locali"
set latitudine = 45.4687208, longitudine = 9.2067074
where id = 'f1a4087e-2fc9-4d38-a052-c89b091d1a74'
  and latitudine is null and longitudine is null;

update "Locali"
set latitudine = 42.6922439, longitudine = 23.3223424
where id = '1ec96f91-7bc7-45e5-ba34-165e30c96ed1'
  and latitudine is null and longitudine is null;

-- Unresolved by automatic geocoding (manual geocode lookup still required):
-- id: 8ea76edb-48f5-4e5b-9953-27b0e50228a5 | nome: Vitosha Street bar
-- id: ac5d1504-3273-4c72-a147-f9af252cb296 | nome: Il Paradiso

-- Post-check
-- select id, nome, latitudine, longitudine from "Locali" order by nome;
