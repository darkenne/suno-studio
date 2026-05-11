import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserAndApiKey } from '@/lib/server/getUserApiKey';

const SUNO_BASE = 'https://api.sunoapi.org';

export async function GET(req: NextRequest) {
  const auth = await getAuthUserAndApiKey(req);
  const apiKey = auth?.apiKey || process.env.SUNO_API_KEY || '';

  if (!apiKey) {
    return NextResponse.json({ error: 'SUNO_API_KEY not configured' }, { status: 503 });
  }

  const taskId = req.nextUrl.searchParams.get('taskId');
  if (!taskId) {
    return NextResponse.json({ error: 'taskId required' }, { status: 400 });
  }

  const res = await fetch(
    `${SUNO_BASE}/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
    { headers: { 'Authorization': `Bearer ${apiKey}` } },
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
