import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
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
  return user?.id ?? null;
}

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let supabase;
  try { supabase = getSupabaseAdmin(); } catch {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('suno_api_key, credits_purchased, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    code: 200,
    msg: 'success',
    data: data ?? { suno_api_key: null, credits_purchased: 0 },
  });
}

export async function PUT(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { suno_api_key?: string; credits_purchased?: number };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  let supabase;
  try { supabase = getSupabaseAdmin(); } catch {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const patch: Record<string, unknown> = { user_id: userId };
  if (body.suno_api_key !== undefined) patch.suno_api_key = body.suno_api_key || null;
  if (body.credits_purchased !== undefined) patch.credits_purchased = Math.max(0, Number(body.credits_purchased) || 0);

  const { error } = await supabase
    .from('user_settings')
    .upsert(patch, { onConflict: 'user_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ code: 200, msg: 'saved' });
}
