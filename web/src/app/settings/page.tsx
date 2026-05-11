'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import s from './Settings.module.css';

const DEFAULT_CREDITS = 50;

type UsageEvent = {
  id: number;
  credits_used: number;
  remaining_after: number;
  created_at: string;
};

type DayBucket = { date: string; total: number };

function buildDailyBuckets(events: UsageEvent[]): DayBucket[] {
  const map = new Map<string, number>();
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  for (const e of events) {
    const day = e.created_at.slice(0, 10);
    if (map.has(day)) map.set(day, (map.get(day) ?? 0) + e.credits_used);
  }
  return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
}

function UsageChart({ buckets }: { buckets: DayBucket[] }) {
  const max = Math.max(...buckets.map(b => b.total), 1);
  const W = 580, H = 80, PAD = 4;
  const barW = Math.floor((W - PAD * 2) / buckets.length) - 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.chart} aria-hidden>
      {buckets.map((b, i) => {
        const barH = Math.max(b.total > 0 ? Math.round((b.total / max) * (H - PAD * 2)) : 1, b.total > 0 ? 3 : 1);
        const x = PAD + i * (barW + 1);
        const y = H - PAD - barH;
        return (
          <rect
            key={b.date}
            x={x} y={y} width={barW} height={barH}
            className={b.total > 0 ? s.barActive : s.barEmpty}
            rx={1}
          >
            <title>{b.date}: {b.total} credits</title>
          </rect>
        );
      })}
    </svg>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [apiKey, setApiKey]   = useState('');
  const [showKey, setShowKey] = useState(false);
  const [creditsPurchased, setCreditsPurchased] = useState(0);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  const [usageEvents, setUsageEvents] = useState<UsageEvent[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);

  const [keyLoading, setKeyLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, err = false) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, err });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  /* ── Auth ───────────────────────────────────────── */
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/login'); return; }
      setAccessToken(data.session.access_token);
      setAuthChecked(true);
    });
  }, [router]);

  /* ── Load settings ──────────────────────────────── */
  useEffect(() => {
    if (!accessToken) return;
    fetch('/api/user/settings', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(json => {
        setApiKey(json?.data?.suno_api_key ?? '');
        setCreditsPurchased(Number(json?.data?.credits_purchased ?? 0));
      })
      .catch(() => {});
  }, [accessToken]);

  /* ── Fetch remaining credits ───────────────────── */
  useEffect(() => {
    if (!accessToken) return;
    fetch('/api/generate/credit', {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })
      .then(r => r.json())
      .then(json => {
        const r = Number(json?.data);
        if (Number.isFinite(r)) setCreditsRemaining(r);
      })
      .catch(() => {});
  }, [accessToken]);

  /* ── Load usage events ──────────────────────────── */
  useEffect(() => {
    if (!accessToken) return;
    setUsageLoading(true);
    fetch('/api/user/credit-usage', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(json => setUsageEvents(Array.isArray(json?.data) ? json.data : []))
      .catch(() => {})
      .finally(() => setUsageLoading(false));
  }, [accessToken]);

  /* ── Save API key ───────────────────────────────── */
  async function handleSaveKey() {
    if (!accessToken) return;
    setKeyLoading(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ suno_api_key: apiKey.trim() }),
      });
      if (!res.ok) throw new Error('Save failed');
      showToast('API key saved');
    } catch {
      showToast('Failed to save API key', true);
    } finally {
      setKeyLoading(false);
    }
  }

  if (!authChecked) return null;

  const totalCredits = DEFAULT_CREDITS + creditsPurchased;
  const totalUsed = usageEvents.reduce((sum, e) => sum + e.credits_used, 0);
  const buckets = buildDailyBuckets(usageEvents);

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={s.header}>
        <button className={s.backBtn} onClick={() => router.replace('/')}>
          <ArrowLeft size={13} />
          Studio
        </button>
        <div className={s.headerDivider} />
        <span className={s.headerTitle}>Settings</span>
      </div>

      <div className={s.body}>
        <div className="section no-underline" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 24 }}>
          <div className="h-eyebrow" style={{ marginBottom: 8 }}>Account</div>
          <h1 className="h-display">Settings</h1>
        </div>

        {/* API Key */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <div className={s.panelTitle}>Suno API Key</div>
            <div className={s.panelDesc}>
              Enter your API key from api.sunoapi.org. This key is used to generate music and track your credits.
            </div>
          </div>
          <div className={s.panelBody}>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>API Key</div>
              <div className={s.keyRow}>
                <div className={s.keyInputWrap}>
                  <input
                    className={s.keyInput}
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-••••••••••••••••••••••••"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className={s.keyToggle}
                    onClick={() => setShowKey(v => !v)}
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  className="btn primary sm"
                  onClick={handleSaveKey}
                  disabled={keyLoading}
                >
                  {keyLoading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
            <div className="hint">
              Keys are stored securely per account. Leave blank to use the server default key.
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <div className={s.panelTitle}>Credits</div>
            <div className={s.panelDesc}>
              Credit balance and 30-day usage trend for your account.
            </div>
          </div>
          <div className={s.panelBody}>
            <div className={s.creditStats}>
              <div className={s.creditStat}>
                <div className={s.creditStatKey}>Total</div>
                <div className={`${s.creditStatVal} tnum`}>{totalCredits}</div>
              </div>
              <div className={s.creditStat}>
                <div className={s.creditStatKey}>Remaining</div>
                <div className={`${s.creditStatVal} accent tnum`}>
                  {creditsRemaining !== null ? creditsRemaining : '—'}
                </div>
              </div>
              <div className={s.creditStat}>
                <div className={s.creditStatKey}>Used</div>
                <div className={`${s.creditStatVal} tnum`}>
                  {creditsRemaining !== null ? Math.max(totalCredits - creditsRemaining, 0) : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage chart */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <div className={s.panelTitle}>Usage Trend</div>
            <div className={s.panelDesc}>Credits consumed per day over the last 30 days.</div>
          </div>
          <div className={s.panelBody}>
            {usageLoading ? (
              <div className={s.chartPlaceholder}>Loading…</div>
            ) : (
              <>
                <UsageChart buckets={buckets} />
                <div className={s.chartLegend}>
                  <span>{buckets[0]?.date}</span>
                  <span>{buckets[buckets.length - 1]?.date}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Usage history */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <div className={s.panelTitle}>Usage History</div>
            <div className={s.panelDesc}>Last 200 credit usage events (most recent first).</div>
          </div>
          <div className={s.panelBody} style={{ padding: 0 }}>
            {usageLoading ? (
              <div className={s.histEmpty}>Loading…</div>
            ) : usageEvents.length === 0 ? (
              <div className={s.histEmpty}>No usage recorded yet.</div>
            ) : (
              <div className={s.histTable}>
                <div className={s.histHead}>
                  <span>Date</span>
                  <span className="tnum">Used</span>
                  <span className="tnum">Remaining</span>
                </div>
                {usageEvents.map(e => (
                  <div key={e.id} className={s.histRow}>
                    <span className={s.histDate}>
                      {new Date(e.created_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <span className={`${s.histUsed} tnum`}>−{e.credits_used}</span>
                    <span className={`${s.histRemaining} tnum`}>{e.remaining_after}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className={`${s.toast}${toast.err ? ` ${s.err}` : ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
