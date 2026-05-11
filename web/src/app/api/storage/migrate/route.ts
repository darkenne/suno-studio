import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import type { Track, Playlist } from '@/types';

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

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { legacyWorkspaceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const legacyId = body.legacyWorkspaceId?.trim();
  if (!legacyId || legacyId === userId) {
    return NextResponse.json({ code: 200, msg: 'no migration needed' });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data: legacyRow } = await supabase
    .from('studio_snapshots')
    .select('*')
    .eq('workspace_id', legacyId)
    .maybeSingle();

  if (!legacyRow) {
    return NextResponse.json({ code: 200, msg: 'no legacy data found' });
  }

  const { data: userRow } = await supabase
    .from('studio_snapshots')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!userRow) {
    // Claim legacy row: link it to this user account
    await supabase
      .from('studio_snapshots')
      .update({ user_id: userId, workspace_id: userId })
      .eq('workspace_id', legacyId);
  } else {
    // Merge legacy tracks/playlists into existing user row (dedup by id)
    const legacyTracks: Track[] = Array.isArray(legacyRow.tracks) ? legacyRow.tracks : [];
    const userTracks: Track[] = Array.isArray(userRow.tracks) ? userRow.tracks : [];
    const existingTrackIds = new Set(userTracks.map((t: Track) => t.id));
    const mergedTracks = [
      ...userTracks,
      ...legacyTracks.filter((t: Track) => !existingTrackIds.has(t.id)),
    ];

    const legacyPlaylists: Playlist[] = Array.isArray(legacyRow.playlists) ? legacyRow.playlists : [];
    const userPlaylists: Playlist[] = Array.isArray(userRow.playlists) ? userRow.playlists : [];
    const existingPlIds = new Set(userPlaylists.map((p: Playlist) => p.id));
    const mergedPlaylists = [
      ...userPlaylists,
      ...legacyPlaylists.filter((p: Playlist) => !existingPlIds.has(p.id)),
    ];

    await supabase
      .from('studio_snapshots')
      .update({ tracks: mergedTracks, playlists: mergedPlaylists })
      .eq('workspace_id', userRow.workspace_id);

    await supabase
      .from('studio_snapshots')
      .delete()
      .eq('workspace_id', legacyId);
  }

  return NextResponse.json({ code: 200, msg: 'migrated' });
}
