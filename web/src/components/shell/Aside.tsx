'use client';
import type { View, Track, BatchJob } from '@/types';
import { Cover } from '@/components/cover/Cover';
import { Waveform } from '@/components/ui/Waveform';
import { formatTime, relTime, hashSimple } from '@/lib/utils';
import s from './Shell.module.css';

interface AsideProps {
  view: View;
  batchTracks: Track[];
  batchJobs: BatchJob[];
  completed: boolean;
  onPlay: (t: Track) => void;
  currentTrackId?: string;
  recentTracks: Track[];
}

export function Aside({
  view, batchTracks, batchJobs, completed, onPlay, currentTrackId, recentTracks,
}: AsideProps) {
  const pendingJobs = batchJobs.filter(j => j.status !== 'SUCCESS' && j.status !== 'FAILED');
  const showBatch = view === 'generating' && (batchTracks.length > 0 || pendingJobs.length > 0);

  if (showBatch) {
    return (
      <div className={s.aside}>
        <div className={s.asideHead}>
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 6 }}>Live Results</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>
              {batchTracks.length} ready · {pendingJobs.length} creating
            </div>
          </div>
          <div className="mono uc" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.14em' }}>
            {completed ? 'DONE' : 'LIVE'}
          </div>
        </div>
        <div className={`${s.asideBody} scroll`}>
          {pendingJobs.map(j => (
            <div key={j.taskId} className="result-card" style={{ borderColor: 'var(--line)' }}>
              <div className="rc-cover" style={{ background: 'var(--bg-3)', display: 'grid', placeItems: 'center' }}>
                <Waveform state="pending" seed={hashSimple(j.taskId)} bars={10} height={28} />
              </div>
              <div className="rc-body">
                <div className="rc-title" style={{ color: 'var(--fg-2)' }}>Creating...</div>
                <div className="rc-sub">{j.taskId} · {j.statusMessage}</div>
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--warn)', letterSpacing: '0.08em' }}>
                {j.status}
              </div>
            </div>
          ))}
          {batchTracks.map(t => (
            <div
              key={t.id}
              className={`result-card${t.fresh ? ' fresh' : ''}`}
              onClick={() => onPlay(t)}
              style={{ cursor: 'pointer' }}
            >
              <div className="rc-cover"><Cover track={t} size={44} /></div>
              <div className="rc-body">
                <div className="rc-title">{t.title}</div>
                <div className="rc-sub">{t.model} · {formatTime(t.duration)} · saved</div>
              </div>
              <div className="rc-play">▶</div>
            </div>
          ))}
          {batchTracks.length === 0 && pendingJobs.length === 0 && (
            <div className="empty">No jobs running.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={s.aside}>
      <div className={s.asideHead}>
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 6 }}>Recent</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>Last 24 hours</div>
        </div>
        <button className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          See all →
        </button>
      </div>
      <div className={`${s.asideBody} scroll`}>
        {recentTracks.map(t => (
          <div
            key={t.id}
            className="result-card"
            onClick={() => onPlay(t)}
            style={{ cursor: 'pointer', borderColor: t.id === currentTrackId ? 'var(--accent-line)' : 'var(--line)' }}
          >
            <div className="rc-cover"><Cover track={t} size={44} /></div>
            <div className="rc-body">
              <div className="rc-title">{t.title}</div>
              <div className="rc-sub">{t.model} · {formatTime(t.duration)} · {relTime(t.createdAt)}</div>
            </div>
            <div className="rc-play">▶</div>
          </div>
        ))}
      </div>
    </div>
  );
}
