import { NextRequest, NextResponse } from 'next/server';
import { alignedWordsToTimedLines, type AlignedWord } from '@/lib/alignedWordsToTimed';

const SUNO_BASE = 'https://api.sunoapi.org';
const API_KEY   = process.env.SUNO_API_KEY ?? '';

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'SUNO_API_KEY not configured' }, { status: 503 });
  }
  const body = await req.json();
  const taskId = typeof body?.taskId === 'string' ? body.taskId : '';
  const audioId = typeof body?.audioId === 'string' ? body.audioId : '';
  if (!taskId || !audioId) {
    return NextResponse.json({ error: 'taskId and audioId are required' }, { status: 400 });
  }

  const res = await fetch(`${SUNO_BASE}/api/v1/generate/get-timestamped-lyrics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ taskId, audioId }),
  });
  const data = await res.json();
  if (!res.ok || data?.code !== 200) {
    return NextResponse.json(
      { error: data?.msg ?? 'Timestamped lyrics request failed', code: data?.code },
      { status: res.status >= 400 ? res.status : 502 },
    );
  }
  const aligned: AlignedWord[] = data?.data?.alignedWords ?? [];
  const lines = alignedWordsToTimedLines(aligned);
  return NextResponse.json({
    lines,
    waveformData: data?.data?.waveformData,
    hootCer: data?.data?.hootCer,
    isStreamed: data?.data?.isStreamed,
  });
}
