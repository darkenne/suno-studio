'use client';
import type { Playlist, Track } from '@/types';
import { ArrowRight, CircleDot, Plus, Play } from 'lucide-react';
import { Cover } from '@/components/cover/Cover';
import { formatTime } from '@/lib/utils';

interface HomeProps {
  tracks: Track[];
  playlists: Playlist[];
  credits: { used: number | null; total: number | null; remaining: number | null };
  isCreditsLoading: boolean;
  isDataLoading: boolean;
  currentTrackId?: string;
  onPlay: (t: Track) => void;
  onGoLibrary: () => void;
  onGoPlaylists: () => void;
  onOpenPlaylist: (id: string) => void;
  onGoCreate: () => void;
  onNewPlaylist: () => void;
}

export function Home({
  tracks, playlists, credits, isCreditsLoading, isDataLoading, currentTrackId, onPlay,
  onGoLibrary, onGoPlaylists, onOpenPlaylist, onGoCreate, onNewPlaylist,
}: HomeProps) {
  const { used, total, remaining } = credits;
  const hasCredits = !isCreditsLoading && used !== null && total !== null && remaining !== null;
  const pct = hasCredits && total > 0 ? (used / total) * 100 : 0;

  const recent = tracks
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const firstFour = playlists.slice(0, 4);
  const isEmpty = !isDataLoading && tracks.length === 0 && playlists.length === 0;

  return (
    <div>
      <div className="section no-underline" style={{ paddingBottom: 16 }}>
        <div className="h-eyebrow" style={{ marginBottom: 10 }}>Home</div>
        <h1 className="h-display">Hi, what are we making today?</h1>
      </div>

      {/* Onboarding empty state */}
      {isEmpty && (
        <div className="section">
          <div className="home-onboard">
            <div className="home-onboard-ic mono" aria-hidden>
              <CircleDot size={16} />
            </div>
            <div className="home-onboard-title">No tracks yet</div>
            <div className="home-onboard-sub">Head to Create to make your first piece of music.</div>
            <button type="button" className="btn primary" onClick={onGoCreate}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Plus size={14} />
                Start creating
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Credits */}
      <div className="section">
        <div className="home-sec-head">
          <div className="h-eyebrow">Credits</div>
        </div>
        <div className="credits-card">
          <div className="credits-main">
            <div className="credits-figure">
              <span className="credits-remaining tnum">{hasCredits ? remaining.toLocaleString() : '--'}</span>
              <span className="credits-sep">/</span>
              <span className="credits-total tnum">{hasCredits ? total.toLocaleString() : '--'}</span>
            </div>
            <div className="credits-pct mono">{hasCredits ? `${pct.toFixed(1)}% used` : 'LOADING'}</div>
          </div>
          <div className="credits-bar">
            <div className="credits-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="credits-legend">
            <div className="credits-legend-item">
              <span className="credits-legend-dot used" />
              <span className="mono uc">Used</span>
              <span className="tnum credits-legend-val">{hasCredits ? used.toLocaleString() : '--'}</span>
            </div>
            <div className="credits-legend-item">
              <span className="credits-legend-dot remain" />
              <span className="mono uc">Remaining</span>
              <span className="tnum credits-legend-val">{hasCredits ? remaining.toLocaleString() : '--'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Generated */}
      <div className="section">
        <div className="home-sec-head">
          <div className="h-eyebrow">Recently Generated</div>
          {(isDataLoading || recent.length > 0) && (
            <button type="button" className="home-see-all" onClick={onGoLibrary}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                See all <ArrowRight size={13} aria-hidden />
              </span>
            </button>
          )}
        </div>

        {isDataLoading ? (
          <div className="home-recent">
            <div className="track-list">
              <div className="track-header home-recent-header">
                <span>#</span>
                <span />
                <span>Title · Tags</span>
                <span>Model</span>
                <span>Mode · Prompt</span>
                <span style={{ textAlign: 'right' }}>Duration</span>
                <span />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`sk_recent_${i}`} className="track home-recent-row">
                  <div className="num tnum">{String(i + 1).padStart(2, '0')}</div>
                  <div className="cover skeleton-thumb" />
                  <div className="title-block">
                    <div className="skeleton-row-line w-lg" />
                    <div className="skeleton-row-line w-md" />
                  </div>
                  <div className="skeleton-row-line w-sm" />
                  <div className="skeleton-row-line w-sm" />
                  <div className="dur tnum"><span className="skeleton-line xs" /></div>
                  <div className="play-ic skeleton-circle" />
                </div>
              ))}
            </div>
          </div>
        ) : recent.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty-title">No tracks yet</div>
            <div className="home-empty-sub">Start from Create to generate your first track.</div>
            <button type="button" className="btn" onClick={onGoCreate}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Plus size={14} />
                Go to Create
              </span>
            </button>
          </div>
        ) : (
          <div className="home-recent">
            <div className="track-list">
              <div className="track-header home-recent-header">
                <span>#</span>
                <span />
                <span>Title · Tags</span>
                <span>Model</span>
                <span>Mode · Prompt</span>
                <span style={{ textAlign: 'right' }}>Duration</span>
                <span />
              </div>
              {recent.map((t, i) => (
                <div
                  key={t.id}
                  className={`track home-recent-row${t.id === currentTrackId ? ' playing' : ''}`}
                  onClick={() => onPlay(t)}
                >
                  <div className="num tnum">{String(i + 1).padStart(2, '0')}</div>
                  <div className="cover"><Cover track={t} size={44} /></div>
                  <div className="title-block">
                    <div className="title">
                      {t.title}
                      {t.id === currentTrackId && (
                        <span style={{ color: 'var(--accent)', marginLeft: 8, fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Play size={10} fill="currentColor" strokeWidth={1.8} />
                          NOW
                        </span>
                      )}
                    </div>
                    <div className="sub">{t.tags}</div>
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', letterSpacing: '0.04em' }}>{t.model}</div>
                  <div>
                    <div className="mode-pill" style={{ display: 'inline-block' }}>{t.mode} · {t.promptMode}</div>
                  </div>
                  <div className="dur tnum">{formatTime(t.duration)}</div>
                  <button
                    type="button"
                    className="play-ic"
                    title="Play"
                    onClick={e => { e.stopPropagation(); onPlay(t); }}
                  >
                    <Play size={14} fill="currentColor" strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Playlists */}
      <div className="section" style={{ borderBottom: 'none' }}>
        <div className="home-sec-head">
          <div className="h-eyebrow">Playlists</div>
          {(isDataLoading || playlists.length > 0) && (
            <button type="button" className="home-see-all" onClick={onGoPlaylists}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                See all <ArrowRight size={13} aria-hidden />
              </span>
            </button>
          )}
        </div>

        {isDataLoading ? (
          <div className="home-pl-grid home-pl-grid-loading">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`sk_pl_${i}`} className="pl-card">
                <div className="pl-cover skeleton-block" />
                <div className="pl-meta">
                  <div className="skeleton-row-line w-lg" />
                  <div className="skeleton-row-line w-sm" />
                </div>
              </div>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty-title">No playlists yet</div>
            <div className="home-empty-sub">Organize your tracks into collections.</div>
            <button type="button" className="btn" onClick={onNewPlaylist}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Plus size={14} />
                Create Playlist
              </span>
            </button>
          </div>
        ) : (
          <div className="home-pl-grid">
            {firstFour.map(pl => {
              const first = pl.tracks[0] ? tracks.find(t => t.id === pl.tracks[0].trackId) : null;
              return (
                <div key={pl.id} className="pl-card" onClick={() => onOpenPlaylist(pl.id)}>
                  <div className="pl-cover">
                    {first
                      ? <Cover track={first} size={260} />
                      : <div className="pl-cover-empty mono">EMPTY</div>}
                  </div>
                  <div className="pl-meta">
                    <div className="pl-title">{pl.title}</div>
                    <div className="pl-sub mono">{pl.tracks.length} TRACK{pl.tracks.length === 1 ? '' : 'S'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
