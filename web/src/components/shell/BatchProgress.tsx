'use client';
import { useEffect, useRef, useState } from 'react';
import type { BatchJob } from '@/types';
import { ChevronRight, Loader2, X } from 'lucide-react';
import s from './BatchProgress.module.css';

interface Props {
  jobs: BatchJob[];
  batchTotal: number;
  savedCount: number;
  onNavigate: () => void;
}

export function BatchProgress({ jobs, batchTotal, savedCount, onNavigate }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const batchKey = jobs[0]?.taskId ?? '';
  const prevKeyRef = useRef('');

  useEffect(() => {
    if (batchKey && batchKey !== prevKeyRef.current) {
      setDismissed(false);
      prevKeyRef.current = batchKey;
    }
  }, [batchKey]);

  const running   = jobs.filter(j => j.status !== 'SUCCESS' && j.status !== 'FAILED').length;
  const isDone    = jobs.length > 0 && running === 0;
  const pct       = batchTotal > 0 ? Math.min(100, Math.round((savedCount / batchTotal) * 100)) : 0;

  // Auto-dismiss 12s after completion
  useEffect(() => {
    if (!isDone || dismissed) return;
    const id = setTimeout(() => setDismissed(true), 12_000);
    return () => clearTimeout(id);
  }, [isDone, dismissed]);

  if (!jobs.length || dismissed) return null;

  return (
    <div className={`${s.wrap}${isDone ? ` ${s.done}` : ''}`} onClick={onNavigate} role="button" tabIndex={0}>
      <div className={s.inner}>
        <div className={s.top}>
          <div className={s.status}>
            {!isDone && <Loader2 size={12} className={s.spin} />}
            <span>{isDone ? 'Generation complete' : 'Generating tracks…'}</span>
          </div>
          <button
            className={s.dismiss}
            onClick={e => { e.stopPropagation(); setDismissed(true); }}
            aria-label="Dismiss"
          >
            <X size={11} />
          </button>
        </div>

        <div className={s.meter}>
          <div className={s.fill} style={{ width: `${pct}%` }} />
        </div>

        <div className={s.counts}>
          <span className="tnum">{savedCount} / {batchTotal} tracks</span>
          {isDone && (
            <span className={s.viewLink}>
              View Library <ChevronRight size={10} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
