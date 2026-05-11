import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from './supabaseAdmin';

export async function getAuthUserAndApiKey(
  req: NextRequest,
): Promise<{ userId: string; apiKey: string } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;

  const { data: settings } = await supabase
    .from('user_settings')
    .select('suno_api_key')
    .eq('user_id', user.id)
    .maybeSingle();

  const apiKey = settings?.suno_api_key || process.env.SUNO_API_KEY || '';
  return { userId: user.id, apiKey };
}
