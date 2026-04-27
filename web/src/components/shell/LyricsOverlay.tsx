'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Cover } from '@/components/cover/Cover';
import { isJunkLyricText } from '@/lib/lyricLineFilters';
import type { TimedLyricLine, Track } from '@/types';

type Props = {
  open: boolean;
  onClose: () => void;
  track: Track;
  playhead: number;
  isPlaying: boolean;
  onSeek: (t: number) => void;
  /** Persist timed lines to library when loaded from the timestamped-lyrics API. */
  onTimedLyricsLoaded?: (trackId: string, lines: TimedLyricLine[]) => void;
};

function isTimedLyrics(lyrics: Track['lyrics']): lyrics is TimedLyricLine[] {
  return Array.isArray(lyrics) && lyrics.length > 0;
}

/**
 * Fullscreen-ish lyrics view over the main grid.
 * Cover artwork blown up + blurred behind a glass pane; karaoke-style
 * active-line highlight tracks the player's playhead.
 * Ported from project/lyricsOverlay.jsx
 */
export function LyricsOverlay({
  open,
  onClose,
  track,
  playhead,
  isPlaying,
  onSeek,
  onTimedLyricsLoaded,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [fetchedLines, setFetchedLines] = useState<TimedLyricLine[] | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ok' | 'err' | 'skip'>('idle');

  const hasTimedFromParent = isTimedLyrics(track?.lyrics);
  const lyricsFromTrack = hasTimedFromParent && track ? track.lyrics as TimedLyricLine[] : null;
  const lyrics = lyricsFromTrack ?? fetchedLines;
  const hasLyrics = Boolean(lyrics && lyrics.length > 0);
  const displayLyrics = useMemo(
    () => (lyrics ?? []).filter(l => !isJunkLyricText(l.text)),
    [lyrics],
  );
  const hasDisplayLyrics = displayLyrics.length > 0;
  const enabled = !!(open && track);

  useEffect(() => {
    setFetchedLines(null);
    setLoadState('idle');
  }, [track.id]);

  useEffect(() => {
    if (!open) return;
    if (track.instrumental) {
      setLoadState('skip');
      return;
    }
    if (hasTimedFromParent) {
      setLoadState('skip');
      return;
    }
    if (!track.taskId || !track.sunoId) {
      setLoadState('skip');
      return;
    }

    const { id: trId, taskId, sunoId } = track;
    const ac = new AbortController();
    setLoadState('loading');
    (async () => {
      try {
        const r = await fetch('/api/lyrics/timestamped', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, audioId: sunoId }),
          signal: ac.signal,
        });
        const j = (await r.json()) as { lines?: TimedLyricLine[]; error?: string };
        if (ac.signal.aborted) return;
        if (!r.ok) {
          setLoadState('err');
          return;
        }
        const rawLines = (j.lines ?? []) as TimedLyricLine[];
        const cleanLines = rawLines.filter(l => !isJunkLyricText(l.text));
        if (cleanLines.length > 0) {
          setFetchedLines(cleanLines);
          onTimedLyricsLoaded?.(trId, cleanLines);
        }
        setLoadState('ok');
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        if (!ac.signal.aborted) setLoadState('err');
      }
    })();
    return () => ac.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are primitives from `track`, not the whole object
  }, [
    open,
    track.id,
    track.taskId,
    track.sunoId,
    track.instrumental,
    hasTimedFromParent,
    onTimedLyricsLoaded,
  ]);

  const activeIdx = useMemo(() => {
    if (!hasDisplayLyrics) return -1;
    let idx = -1;
    for (let i = 0; i < displayLyrics.length; i++) {
      if (displayLyrics[i].t <= playhead) idx = i;
      else break;
    }
    return idx;
  }, [displayLyrics, hasDisplayLyrics, playhead]);

  useEffect(() => {
    if (!enabled) return;
    if (activeIdx < 0) return;
    const el = lineRefs.current[activeIdx];
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    const targetTop = el.offsetTop - scroller.clientHeight / 2 + el.clientHeight / 2;
    scroller.scrollTo({ top: targetTop, behavior: 'smooth' });
  }, [activeIdx, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, enabled]);

  if (!enabled) return null;

  const [c1] = track.palette || ['#d4e85c', '#1d2a14', '#6a7a3a'];

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = String(Math.floor(s % 60)).padStart(2, '0');
    return `${m}:${ss}`;
  };

  const canRequestTimestamped =
    !track.instrumental && !hasTimedFromParent && Boolean(track.taskId && track.sunoId);

  return (
    <div className="lyr-view">
      <div className="lyr-backdrop" aria-hidden>
        <div className="lyr-cover-bg">
          <Cover track={track} size={1200} />
        </div>
        <div
          className="lyr-backdrop-tint"
          style={{
            background: `radial-gradient(120% 80% at 50% 30%, ${hexA(c1, 0.10)}, transparent 60%), linear-gradient(180deg, rgba(8,10,14,0.55), rgba(8,10,14,0.78))`,
          }}
        />
      </div>

      <div className="lyr-pane">
        <div className="lyr-head">
          <div className="lyr-head-l">
            <div className="lyr-cover-mini">
              <Cover track={track} size={44} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="lyr-title">{track.title}</div>
              <div className="lyr-sub mono">
                <span style={{ color: 'var(--accent)' }}>● {isPlaying ? 'PLAYING' : 'PAUSED'}</span>
                <span className="dot-sep">·</span>
                <span>{track.tags.split(',')[0]}</span>
                <span className="dot-sep">·</span>
                <span>{track.model}</span>
                <span className="dot-sep">·</span>
                <span className="tnum">{fmt(playhead)} / {fmt(track.duration)}</span>
              </div>
            </div>
          </div>
          <div className="lyr-head-r">
            <button type="button" className="lyr-close" onClick={onClose} title="Close (Esc)">
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="lyr-body scroll" ref={scrollerRef}>
          {!hasLyrics && (
            <div className="lyr-empty">
              {loadState === 'loading' ? (
                <>
                  <div className="mono uc lyr-empty-eyebrow">Loading</div>
                  <div className="lyr-empty-msg">Fetching synced lyrics…</div>
                </>
              ) : track.instrumental ? (
                <>
                  <div className="mono uc lyr-empty-eyebrow">No timed lyrics</div>
                  <div className="lyr-empty-msg">
                    This track is instrumental — there&apos;s nothing to sing.
                  </div>
                </>
              ) : loadState === 'err' ? (
                <>
                  <div className="mono uc lyr-empty-eyebrow">No timed lyrics</div>
                  <div className="lyr-empty-msg">
                    Couldn&apos;t load synced lyrics. Check that SUNO_API_KEY is set and
                    the generation task and audio id are valid.
                  </div>
                </>
              ) : !canRequestTimestamped && loadState === 'skip' ? (
                <>
                  <div className="mono uc lyr-empty-eyebrow">No timed lyrics</div>
                  <div className="lyr-empty-msg">
                    Synced lyrics need a Suno task id and audio id (tracks created from
                    a completed generation in this app).
                  </div>
                </>
              ) : (
                <>
                  <div className="mono uc lyr-empty-eyebrow">No timed lyrics</div>
                  <div className="lyr-empty-msg">
                    Lyrics weren&apos;t generated with timestamps for this take.
                  </div>
                </>
              )}
            </div>
          )}

          {hasDisplayLyrics && (
            <div className="lyr-lines">
              <div className="lyr-spacer" />
              {displayLyrics.map((l, i) => {
                const isSection = /^\[.+\]$/.test(l.text.trim());
                const isBlank = l.text.trim() === '';
                const isActive = i === activeIdx;
                const isPast = i < activeIdx;
                const className =
                  'lyr-line'
                  + (isActive ? ' active' : '')
                  + (isPast ? ' past' : '')
                  + (isSection ? ' section' : '')
                  + (isBlank ? ' blank' : '');
                return (
                  <div
                    key={i}
                    ref={el => { lineRefs.current[i] = el; }}
                    className={className}
                    onClick={() => onSeek(l.t)}
                    title={`Jump to ${fmt(l.t)}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSeek(l.t);
                      }
                    }}
                  >
                    <span className="lyr-line-time mono tnum">{fmt(l.t)}</span>
                    <span className="lyr-line-text">{isBlank ? '' : l.text}</span>
                  </div>
                );
              })}
              <div className="lyr-spacer" />
            </div>
          )}
        </div>

        <div className="lyr-foot mono">
          <span className="lyr-foot-l">
            <span className="lyr-kbd">esc</span>
            <span style={{ marginLeft: 8, color: 'var(--fg-3)' }}>close</span>
            <span style={{ margin: '0 10px', color: 'var(--fg-3)' }}>·</span>
            <span style={{ color: 'var(--fg-3)' }}>click any line to jump</span>
          </span>
          <span className="lyr-foot-r">
            <span style={{ color: 'var(--fg-3)' }}>SYNCED</span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: 'var(--accent)',
                display: 'inline-block',
                marginLeft: 8,
                boxShadow: '0 0 8px var(--accent)',
              }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

/** hex (#rgb / #rrggbb) → rgba(.., a) string */
function hexA(hex: string, a: number): string {
  if (!hex || typeof hex !== 'string' || hex[0] !== '#') return hex;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
