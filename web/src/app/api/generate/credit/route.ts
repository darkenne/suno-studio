import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserAndApiKey } from '@/lib/server/getUserApiKey';

const SUNO_BASE = 'https://api.sunoapi.org';

export async function GET(req: NextRequest) {
  const auth = await getAuthUserAndApiKey(req);
  const apiKey = auth?.apiKey || process.env.SUNO_API_KEY || '';

  if (!apiKey) {
    return NextResponse.json({ error: 'SUNO_API_KEY not configured' }, { status: 503 });
  }

  const res = await fetch(`${SUNO_BASE}/api/v1/generate/credit`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
