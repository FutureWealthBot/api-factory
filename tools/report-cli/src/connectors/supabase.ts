export async function gatherSupabase() {
  const key = process.env.SUPABASE_KEY;
  const url = process.env.SUPABASE_URL;
  if (!key || !url) return { provider: 'supabase', authenticated: false };
  // we avoid calling the DB here; just return detected info
  return { provider: 'supabase', authenticated: true, db: { provider: 'supabase', url } };
}
