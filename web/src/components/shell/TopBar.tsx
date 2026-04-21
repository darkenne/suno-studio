'use client';
import type { BatchJob } from '@/types';
import s from './Shell.module.css';

interface TopBarProps {
  batchJobs: BatchJob[];
  batchTotal: number;
  savedCount: number;
}

export function TopBar({ batchJobs, batchTotal, savedCount }: TopBarProps) {
  const running = batchJobs.filter(j => j.status !== 'SUCCESS' && j.status !== 'FAILED').length;
  const isGenerating = running > 0;

  return (
    <div className={s.topbar}>
      <div className="flex items-center gap-6">
        <div className={s.brand}>
          <div className={s.brandMark} />
          <span>
            REEL
          </span>
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Workspace · <span style={{ color: 'var(--fg-1)' }}>Untitled Session</span>
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
          CREDITS <span className="tnum" style={{ color: 'var(--fg-1)', margin: '0 4px' }}>847</span> / 1000
        </span>
      </div>
    </div>
  );
}
