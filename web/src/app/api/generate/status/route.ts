import { NextRequest, NextResponse } from 'next/server';

const SUNO_BASE = 'https://api.sunoapi.org';
const API_KEY   = process.env.SUNO_API_KEY ?? '';

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'SUNO_API_KEY not configured' }, { status: 503 });
  }
  const taskId = req.nextUrl.searchParams.get('taskId');
  if (!taskId) {
    return NextResponse.json({ error: 'taskId required' }, { status: 400 });
  }
  const res = await fetch(
    `${SUNO_BASE}/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
    { headers: { 'Authorization': `Bearer ${API_KEY}` } },
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
