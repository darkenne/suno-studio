import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import type { Playlist, Track } from '@/types';

type SnapshotRow = {
  workspace_id: string;
  tracks: Track[];
  playlists: Playlist[];
  updated_at?: string;
};

function readWorkspaceId(req: NextRequest): string | null {
  const id = req.nextUrl.searchParams.get('workspaceId');
  if (!id) return null;
  const trimmed = id.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(req: NextRequest) {
  const workspaceId = readWorkspaceId(req);
  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('studio_snapshots')
    .select('workspace_id, tracks, playlists, updated_at')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    code: 200,
    msg: 'success',
    data: data ?? null,
  });
}

export async function PUT(req: NextRequest) {
  let body: { workspaceId?: string; tracks?: Track[]; playlists?: Playlist[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const workspaceId = body.workspaceId?.trim();
  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
  }
  if (!Array.isArray(body.tracks) || !Array.isArray(body.playlists)) {
    return NextResponse.json({ error: 'tracks/playlists must be arrays' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const payload: SnapshotRow = {
    workspace_id: workspaceId,
    tracks: body.tracks,
    playlists: body.playlists,
  };

  const { error } = await supabase
    .from('studio_snapshots')
    .upsert(payload, { onConflict: 'workspace_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ code: 200, msg: 'saved' });
}
