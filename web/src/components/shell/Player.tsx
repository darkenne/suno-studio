'use client';
import type { RepeatMode, Track } from '@/types';
import { Download, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { Cover } from '@/components/cover/Cover';
import { formatTime } from '@/lib/utils';
import s from './Shell.module.css';

interface PlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  playhead: number;
  onSeek: (v: number) => void;
  onPrev: () => void;
  onNext: () => void;
  repeat: RepeatMode;
  onRepeatToggle: () => void;
  shuffle: boolean;
  onShuffleToggle: () => void;
  volume: number;
  onVolumeChange: (v: number) => void;
}

export function Player({
  track, isPlaying, onPlayPause, playhead, onSeek,
  onPrev, onNext, repeat, onRepeatToggle, shuffle, onShuffleToggle,
  volume, onVolumeChange,
}: PlayerProps) {
  const empty = !track;
  const dur = track?.duration || 1;
  const pct = empty ? 0 : Math.min(100, (playhead / dur) * 100);

  const onBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (empty) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(dur, (e.clientX - rect.left) / rect.width * dur)));
  };

  const accentOn  = { color: 'var(--accent)' } as const;
  const mutedOff  = { color: 'var(--fg-3)' } as const;
  const repeatStyle = repeat !== 'off' ? accentOn : mutedOff;

  return (
    <div className={s.player}>
      {/* ── Left: cover + track info ── */}
      <div className={s.playerLeft}>
        <div style={{ width: 44, height: 44, borderRadius: 2, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!empty ? (
            <Cover track={track} size={44} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ opacity: 0.22 }}>
              <rect x="1" y="1" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor"/>
              <path d="M1 12l4-4 3 3 2.5-2.5L17 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div className={s.playerTrackInfo}>
          <div className={s.playerTitle} style={empty ? { color: 'var(--fg-3)' } : undefined}>
            {empty ? 'No track loaded' : track.title}
          </div>
          {!empty && (
            <div className={s.playerSub}>{track.tags.split(',')[0]?.trim()} · {track.model}</div>
          )}
        </div>
      </div>

      {/* ── Center: controls + progress ── */}
      <div className={s.playerCenter}>
        <div className={s.playerControls} style={empty ? { opacity: 0.35 } : undefined}>
          <button
            type="button"
            title={shuffle ? 'Shuffle on' : 'Shuffle off'}
            style={!empty && shuffle ? accentOn : mutedOff}
            onClick={!empty ? onShuffleToggle : undefined}
          >
            <Shuffle size={14} />
          </button>
          <button type="button" title="Previous" onClick={!empty ? onPrev : undefined}><SkipBack size={14} /></button>
          <button className={s.playerPlayBtn} type="button" onClick={!empty ? onPlayPause : undefined} title={isPlaying ? 'Pause' : 'Play'}>
            <span style={{ display: 'inline-flex' }}>{isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" strokeWidth={1.8} />}</span>
          </button>
          <button type="button" title="Next" onClick={!empty ? onNext : undefined}><SkipForward size={14} /></button>
          <button
            type="button"
            title={repeat === 'off' ? 'Repeat off' : repeat === 'all' ? 'Repeat all' : 'Repeat one'}
            style={!empty ? repeatStyle : mutedOff}
            onClick={!empty ? onRepeatToggle : undefined}
          >
            {repeat === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
          </button>
        </div>

        <div className={s.playerBarWrap}>
          <span className="tnum">{formatTime(empty ? 0 : playhead)}</span>
          <div className={s.playerBar} onClick={onBarClick} style={empty ? { cursor: 'default' } : undefined}>
            {!empty && <div className={s.playerBarFill} style={{ width: `${pct}%` }} />}
            {!empty && <div className={s.playerBarHead} style={{ left: `${pct}%` }} />}
          </div>
          <span className="tnum" style={{ color: 'var(--fg-3)' }}>{formatTime(empty ? 0 : dur)}</span>
        </div>
      </div>

      {/* ── Right: actions + volume ── */}
      <div className={s.playerRight} style={empty ? { opacity: 0.35 } : undefined}>
        <button
          type="button"
          className="mono"
          style={{ fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          Lyrics
        </button>
        <button
          type="button"
          className="mono"
          style={{ fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          Stems
        </button>
        {!empty && track.audioUrl ? (
          <a
            href={track.audioUrl}
            download={`${track.title}.mp3`}
            className="mono"
            style={{ fontSize: 10, color: 'var(--fg-2)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}
            title="Download WAV"
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Download size={12} />
              WAV
            </span>
          </a>
        ) : (
          <span
            className="mono"
            style={{ fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Download size={12} />
              WAV
            </span>
          </span>
        )}

        <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>VOL</span>
        <input
          type="range"
          className={s.playerVolSlider}
          min={0} max={1} step={0.01}
          value={volume}
          onChange={e => onVolumeChange(parseFloat(e.target.value))}
          title={`Volume: ${Math.round(volume * 100)}%`}
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
