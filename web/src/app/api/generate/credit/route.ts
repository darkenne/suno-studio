import { NextResponse } from 'next/server';

const SUNO_BASE = 'https://api.sunoapi.org';
const API_KEY = process.env.SUNO_API_KEY ?? '';

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: 'SUNO_API_KEY not configured' }, { status: 503 });
  }

  const res = await fetch(`${SUNO_BASE}/api/v1/generate/credit`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
