import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  let supabase;
  try { supabase = getSupabaseAdmin(); } catch { return null; }
  const { data: { user } } = await supabase.auth.getUser(token);
  return user?.id ?? null;
}

/* GET — last 90 days of usage events */
export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let supabase;
  try { supabase = getSupabaseAdmin(); } catch {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('credit_usage')
    .select('id, credits_used, remaining_after, created_at')
    .eq('user_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ code: 200, data: data ?? [] });
}

/* POST — log a usage event */
export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { credits_used?: number; remaining_after?: number };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const creditsUsed    = Number(body.credits_used);
  const remainingAfter = Number(body.remaining_after);
  if (!Number.isFinite(creditsUsed) || creditsUsed <= 0 || !Number.isFinite(remainingAfter)) {
    return NextResponse.json({ error: 'invalid values' }, { status: 400 });
  }

  let supabase;
  try { supabase = getSupabaseAdmin(); } catch {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { error } = await supabase
    .from('credit_usage')
    .insert({ user_id: userId, credits_used: creditsUsed, remaining_after: remainingAfter });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ code: 200, msg: 'logged' });
}
