// Barrel re-export: maps legacy "@/utils/supabase" imports to the browser client.
// New code should import directly from "@/utils/supabase/client" or "@/utils/supabase/server".
export { createClient } from './client'
