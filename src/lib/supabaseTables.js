/**
 * Nomi tabelle Supabase – usati da AddVenue, AddBartender, AdminDashboard.
 * UNIFICAZIONE: venues_cloud (locali), app_users (bartender/user/proprietario).
 *
 * RLS BYPASS (DEBUG): Se i dati non appaiono in AdminDashboard nonostante
 * l'inserimento riuscito, disattiva temporaneamente l'RLS su Supabase:
 * Table Editor → venues_cloud / app_users → RLS → Disable.
 */
export const TABLE_VENUES = "venues_cloud";
export const TABLE_APP_USERS = "app_users";
