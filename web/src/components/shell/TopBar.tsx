'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BatchJob } from '@/types';
import { createClient } from '@/lib/supabase/client';
import s from './Shell.module.css';

interface TopBarProps {
  batchJobs: BatchJob[];
  batchTotal: number;
  savedCount: number;
  remainingCredits: number | null;
  totalCredits: number | null;
  isCreditsLoading: boolean;
}

export function TopBar({ batchJobs, batchTotal, savedCount, remainingCredits, totalCredits, isCreditsLoading }: TopBarProps) {
  const router = useRouter();
  const running = batchJobs.filter(j => j.status !== 'SUCCESS' && j.status !== 'FAILED').length;
  const isGenerating = running > 0;
  const remainingLabel = isCreditsLoading || remainingCredits === null ? '--' : remainingCredits.toLocaleString();
  const totalLabel = isCreditsLoading || totalCredits === null ? '--' : totalCredits.toLocaleString();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const meta = data.session?.user?.user_metadata;
      if (meta) {
        setAvatarUrl(meta.avatar_url ?? meta.picture ?? null);
        setUserName(meta.full_name ?? meta.name ?? null);
        setUserEmail(data.session?.user?.email ?? null);
      }
    });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  async function handleSignOut() {
    setMenuOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <div className={s.topbar}>
      <div className="flex items-center gap-6">
        <div className={s.brand}>
          <div className={s.brandMark} />
          <span>REEL</span>
        </div>
      </div>

      <div className={s.topStatus}>
        {isGenerating ? (
          <span>
            <span className={s.dot} />
            CREATING · {savedCount}/{batchTotal}
          </span>
        ) : (
          <span>
            <span className={s.dot} style={{ background: 'var(--fg-2)', boxShadow: 'none' }} />
            READY
          </span>
        )}
        <span>
          <span className={s.dot} />CONNECTED
        </span>
        <span>
          CREDITS <span className="tnum" style={{ color: 'var(--fg-1)', margin: '0 4px' }}>{remainingLabel}</span> / {totalLabel}
        </span>

        {/* Avatar + dropdown */}
        <div ref={menuRef} className={s.avatarWrap}>
          <button
            className={s.avatarBtn}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="User menu"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName ?? ''} className={s.avatarImg} referrerPolicy="no-referrer" />
            ) : (
              <div className={s.avatarFallback}>
                {userName?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </button>

          {menuOpen && (
            <div className={s.avatarMenu}>
              {(userName || userEmail) && (
                <div className={s.avatarMenuInfo}>
                  {userName && <span className={s.avatarMenuName}>{userName}</span>}
                  {userEmail && <span className={s.avatarMenuEmail}>{userEmail}</span>}
                </div>
              )}
              <div className={s.avatarMenuDivider} />
              <button className={s.avatarMenuBtn} onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
