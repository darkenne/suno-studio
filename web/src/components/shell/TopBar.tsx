'use client';
import type { BatchJob } from '@/types';
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
  const running = batchJobs.filter(j => j.status !== 'SUCCESS' && j.status !== 'FAILED').length;
  const isGenerating = running > 0;
  const remainingLabel = isCreditsLoading || remainingCredits === null ? '--' : remainingCredits.toLocaleString();
  const totalLabel = isCreditsLoading || totalCredits === null ? '--' : totalCredits.toLocaleString();

  return (
    <div className={s.topbar}>
      <div className="flex items-center gap-6">
        <div className={s.brand}>
          <div className={s.brandMark} />
          <span>
            REEL
          </span>
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
      </div>
    </div>
  );
}
