# Istruzione Operativa: Implementazione Sistema Lo Zio del Rum

## 1. Schema Supabase (da eseguire nel SQL Editor)

Esegui il file `supabase/migrations/20250215000000_auth_and_registrations.sql` nel SQL Editor di Supabase per creare:
- `app_users`: registrazioni (proprietario, bartender, user)
- `reviews_cloud`: recensioni con campi `photos` e `videos` (array di URL)

## 2. Variabili d'ambiente (.env)

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ADMIN_PASSWORD=xxx
VITE_GOOGLE_MAPS_API_KEY=xxx  # Per Google Maps SDK
```

## 3. Flussi di registrazione

| Ruolo | Scheda | Campi |
|-------|--------|-------|
| **Proprietario** | Gestione locali | name, email, venue_ids |
| **Bartender** | Dettagliata | name, surname, photo, venue, filosofia, signature, ecc. |
| **User** | Leggera | name, bio_light, home_city |

## 4. Logica accesso

- **Non registrato**: sola lettura (Explore, VenueDetail, Magazine, Map). Non può scrivere recensioni né accedere a Community.
- **Registrato**: accesso completo a Community, AddReview, Profile.

## 5. Dashboard

- Sezione "Nuovi iscritti": elenco da `app_users` con `status='pending'`
- Ogni modifica (testi, voti, approvazioni) → INSERT/UPDATE su Supabase

## 6. Recensioni con multimedia

- `photos`: array di URL (Supabase Storage o esterni)
- `videos`: array di URL (brevi video, max ~30s)
- UI: upload o URL per foto/video in AddReview

## 7. Google Maps SDK

- **Implementato**: `@react-google-maps/api` con fallback Leaflet
- Se `VITE_GOOGLE_MAPS_API_KEY` è impostato → usa Google Maps (marker precisi)
- Altrimenti → Leaflet (OpenStreetMap)
- Componente: `src/components/map/MapGoogle.jsx`

## 8. Real-time

- **Implementato**: `useVenuesRealtime` in AppDataContext
- Sottoscrizione a `venues_cloud` per INSERT/UPDATE/DELETE
- Aggiornamenti live senza ricaricare la pagina
- Abilita Realtime in Supabase Dashboard per `venues_cloud`
