'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import s from './Settings.module.css';

const DEFAULT_CREDITS = 50;

export default function SettingsPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [apiKey, setApiKey]           = useState('');
  const [showKey, setShowKey]         = useState(false);
  const [purchased, setPurchased]     = useState(0);
  const [addAmount, setAddAmount]     = useState('');

  const [keyLoading, setKeyLoading]         = useState(false);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [toast, setToast]                   = useState<{ msg: string; err?: boolean } | null>(null);
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
        setPurchased(Number(json?.data?.credits_purchased ?? 0));
      })
      .catch(() => {});
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

  /* ── Add credits ────────────────────────────────── */
  async function handleAddCredits() {
    const amount = parseInt(addAmount, 10);
    if (!accessToken || !Number.isFinite(amount) || amount <= 0) return;
    setCreditsLoading(true);
    try {
      const newTotal = purchased + amount;
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ credits_purchased: newTotal }),
      });
      if (!res.ok) throw new Error('Save failed');
      setPurchased(newTotal);
      setAddAmount('');
      showToast(`${amount} credits added`);
    } catch {
      showToast('Failed to add credits', true);
    } finally {
      setCreditsLoading(false);
    }
  }

  if (!authChecked) return null;

  const totalCredits = DEFAULT_CREDITS + purchased;

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
              Each account starts with {DEFAULT_CREDITS} default credits. Add purchased credits to track your total.
            </div>
          </div>
          <div className={s.panelBody}>
            <div className={s.creditStats}>
              <div className={s.creditStat}>
                <div className={s.creditStatKey}>Default</div>
                <div className={`${s.creditStatVal} tnum`}>{DEFAULT_CREDITS}</div>
              </div>
              <div className={s.creditStat}>
                <div className={s.creditStatKey}>Purchased</div>
                <div className={`${s.creditStatVal} tnum`}>{purchased}</div>
              </div>
              <div className={s.creditStat}>
                <div className={s.creditStatKey}>Total</div>
                <div className={`${s.creditStatVal} accent tnum`}>{totalCredits}</div>
              </div>
            </div>

            <div>
              <div className="label" style={{ marginBottom: 6 }}>Add Purchased Credits</div>
              <div className={s.addRow}>
                <input
                  className={s.addInput}
                  type="number"
                  min="1"
                  value={addAmount}
                  onChange={e => setAddAmount(e.target.value)}
                  placeholder="100"
                  onKeyDown={e => e.key === 'Enter' && handleAddCredits()}
                />
                <button
                  className="btn sm primary"
                  onClick={handleAddCredits}
                  disabled={creditsLoading || !addAmount || parseInt(addAmount, 10) <= 0}
                >
                  {creditsLoading ? 'Adding…' : 'Add Credits'}
                </button>
              </div>
              <div className="hint" style={{ marginTop: 8 }}>
                Enter the number of credits from your last Suno purchase. Credits accumulate.
              </div>
            </div>
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
