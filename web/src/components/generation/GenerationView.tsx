'use client';
import { useEffect, useState } from 'react';
import type { BatchJob, Track } from '@/types';
import { ArrowRight, Check, X } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';

interface GenerationViewProps {
  jobs: BatchJob[];
  allTracks: Track[];
  totalCount: number;
  onCancel: () => void;
  onDone: () => void;
}

export function GenerationView({ jobs, allTracks, totalCount, onCancel, onDone }: GenerationViewProps) {
  const confirm = useConfirm();

  const completed = jobs.filter(j => j.status === 'SUCCESS').length;
  const failed    = jobs.filter(j => j.status === 'FAILED').length;
  const running   = jobs.length - completed - failed;
  const savedCount = allTracks.length;
  const pct = totalCount > 0 ? Math.min(100, Math.round((savedCount / totalCount) * 100)) : 0;
  const isComplete = running === 0 && jobs.length > 0;

  const doCancel = async () => {
    const ok = await confirm({
      eyebrow: 'Run',
      title: 'Stop this run?',
      body: 'Tracks still being made will be marked as failed. Tracks already saved to your library are kept.',
      confirmLabel: 'Stop run',
      cancelLabel: 'Keep going',
      tone: 'danger',
    });
    if (ok) onCancel();
  };

  return (
    <div>
      <div className="section no-underline" style={{ paddingBottom: 20 }}>
        <div className="h-eyebrow" style={{ marginBottom: 10 }}>
          {isComplete ? 'Run · Complete' : 'Run · In Progress'}
        </div>
        <h1 className="h-display">
          {isComplete
            ? `Made ${savedCount} of ${totalCount} tracks`
            : `Creating ${totalCount} tracks across ${jobs.length} requests`}
        </h1>
      </div>

      <div className="section" style={{ paddingTop: 0, paddingBottom: 20 }}>
        <div className="batch-bar">
          <div className="mono uc" style={{ fontSize: 10, color: 'var(--fg-2)', letterSpacing: '0.14em' }}>
            {isComplete ? 'DONE' : 'CREATING'}
          </div>
          <div className="meter">
            <div className="fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="num tnum">
            <span style={{ color: 'var(--accent)' }}>{savedCount}</span>
            <span style={{ color: 'var(--fg-3)' }}> / </span>
            <span>{totalCount}</span>
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', minWidth: 40, textAlign: 'right' }}>
            {pct}%
          </div>
        </div>

        <div className="stat-row" style={{ marginTop: 0 }}>
          <div className="stat"><div className="k">Requests Total</div><div className="v tnum">{jobs.length}</div></div>
          <div className="stat">
            <div className="k">Running</div>
            <div className="v tnum" style={{ color: running > 0 ? 'var(--warn)' : 'var(--fg-3)' }}>{running}</div>
          </div>
          <div className="stat">
            <div className="k">Succeeded</div>
            <div className="v tnum" style={{ color: 'var(--accent)' }}>{completed}</div>
          </div>
          <div className="stat">
            <div className="k">Failed</div>
            <div className="v tnum" style={{ color: failed > 0 ? 'var(--err)' : 'var(--fg-3)' }}>{failed}</div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2>Requests</h2>
          <span className="muted">UPDATES EVERY 3S</span>
        </div>
        <div className="jobs">
          {jobs.map((j, i) => <JobRow key={j.taskId} job={j} index={i} />)}
        </div>
      </div>

      <div className="section" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        {!isComplete && <button type="button" className="btn" onClick={doCancel}>Stop Run</button>}
        {isComplete && (
          <button type="button" className="btn primary" onClick={onDone}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              View in Library <ArrowRight size={13} />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function JobRow({ job, index }: { job: BatchJob; index: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - job.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [job.startedAt]);

  const isRunning = job.status === 'PENDING' || job.status === 'TEXT' || job.status === 'FIRST';
  const klass = job.status === 'SUCCESS' ? 'ok' : job.status === 'FAILED' ? 'err' : isRunning ? 'running' : '';

  const stageMap: Record<string, string> = {
    PENDING: 'WAITING',
    TEXT:    'WRITING LYRICS',
    FIRST:   'CREATING AUDIO',
    SUCCESS: 'SAVED',
    FAILED:  'FAILED',
  };

  return (
    <div className={`job ${klass}`}>
      <div className="sig" />
      <div className="id mono">
        <b>#{String(index + 1).padStart(2, '0')}</b>
        <span style={{ margin: '0 8px', color: 'var(--fg-3)' }}>·</span>
        {job.taskId}
        <span style={{ margin: '0 8px', color: 'var(--fg-3)' }}>·</span>
        <span style={{ color: 'var(--fg-3)' }}>{job.targetCount} track{job.targetCount > 1 ? 's' : ''}</span>
      </div>
      <div className="stage">{stageMap[job.status] ?? job.status}</div>
      <div className="timer tnum">
        {job.status === 'SUCCESS' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check size={12} />{elapsed}s</span>
        ) : job.status === 'FAILED' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><X size={12} />{elapsed}s</span>
        ) : `${elapsed}s`}
      </div>
    </div>
  );
}
