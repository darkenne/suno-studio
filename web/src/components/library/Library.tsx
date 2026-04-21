'use client';
import { useMemo, useState } from 'react';
import type { Playlist, Track } from '@/types';
import { Cover } from '@/components/cover/Cover';
import { Seg } from '@/components/ui/Seg';
import { Menu, MenuItem, MenuSep, MenuHeading } from '@/components/ui/Menu';
import { useConfirm } from '@/hooks/useConfirm';
import { formatTime, formatHMS } from '@/lib/utils';
import s from './Library.module.css';

interface LibraryProps {
  tracks: Track[];
  playlists: Playlist[];
  currentTrackId?: string;
  onPlay: (t: Track) => void;
  onToggleFav: (id: string) => void;
  onDelete: (id: string) => void;
  onAddToPlaylist: (playlistId: string, trackIds: string[]) => void;
  onAddToQueue: (trackId: string) => void;
  onNewPlaylistWithTracks: (trackIds: string[]) => void;
}

export function Library({
  tracks, playlists, currentTrackId, onPlay, onToggleFav, onDelete,
  onAddToPlaylist, onAddToQueue, onNewPlaylistWithTracks,
}: LibraryProps) {
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<'all' | 'advanced' | 'simple'>('all');
  const [favOnly, setFavOnly] = useState(false);
  const [orderBy, setOrderBy] = useState<'newest' | 'oldest'>('newest');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rowMenuFor, setRowMenuFor] = useState<string | null>(null);
  const [rowMenuRect, setRowMenuRect] = useState<DOMRect | null>(null);
  const [addPlaylistFor, setAddPlaylistFor] = useState<string | null>(null);
  const [barMenuOpen, setBarMenuOpen] = useState(false);
  const [barMenuRect, setBarMenuRect] = useState<DOMRect | null>(null);

  const filtered = useMemo(() => {
    let list = [...tracks];
    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(qq) ||
        t.tags.toLowerCase().includes(qq) ||
        t.prompt.toLowerCase().includes(qq),
      );
    }
    if (mode !== 'all') list = list.filter(t => t.mode === mode);
    if (favOnly) list = list.filter(t => t.isFavorite);
    list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return orderBy === 'oldest' ? da - db : db - da;
    });
    return list;
  }, [tracks, q, mode, favOnly, orderBy]);

  const totalDur = filtered.reduce((acc, t) => acc + t.duration, 0);
  const favCount = tracks.filter(t => t.isFavorite).length;

  const toggleSelect = (id: string) => {
    setSelected(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const clearSelection = () => setSelected(new Set());
  const selectedArr = Array.from(selected);

  return (
    <div>
      <div className="section no-underline" style={{ paddingBottom: 16 }}>
        <div className="h-eyebrow" style={{ marginBottom: 10 }}>Library</div>
        <h1 className="h-display">Your saved tracks</h1>
      </div>

      <div className="section no-underline" style={{ paddingTop: 0, paddingBottom: 20 }}>
        <div className="stat-row">
          <div className="stat"><div className="k">Total Tracks</div><div className="v tnum">{tracks.length}</div></div>
          <div className="stat"><div className="k">Favorites</div><div className="v tnum">{favCount}</div></div>
          <div className="stat"><div className="k">Total Runtime</div><div className="v tnum">{formatHMS(totalDur)}</div></div>
          <div className="stat">
            <div className="k">Showing</div>
            <div className="v tnum">{filtered.length}<span className="unit">/ {tracks.length}</span></div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={s.toolbar}>
        <div className={s.search}>
          <span className={s.searchIcon} aria-hidden>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4" />
              <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          <input
            className={s.searchInput}
            placeholder="title · tags · prompt"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <Seg
          options={[{ value: 'all', label: 'All' }, { value: 'advanced', label: 'Advanced' }, { value: 'simple', label: 'Simple' }]}
          value={mode}
          onChange={setMode}
        />
        <button type="button" className={`btn sm${favOnly ? ' primary' : ''}`} onClick={() => setFavOnly(v => !v)}>
          ★ Favorites Only
        </button>
        <div style={{ flex: 1 }} />
        <Seg
          options={[{ value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' }]}
          value={orderBy}
          onChange={setOrderBy}
        />
      </div>

      {/* Header row */}
      <div className={`${s.trackHeader} lib-track-header`}>
        <span />
        <span>#</span>
        <span />
        <span>Title · Tags</span>
        <span>Mode · Prompt</span>
        <span>Model</span>
        <span style={{ textAlign: 'right' }}>Duration</span>
        <span />
        <span />
      </div>

      {/* Track list */}
      <div className={s.trackList}>
        {filtered.map((t, i) => (
          <div
            key={t.id}
            className={
              `${s.track} lib-track` +
              (t.id === currentTrackId ? ` ${s.playing}` : '') +
              (selected.has(t.id) ? ' selected' : '')
            }
            onClick={() => onPlay(t)}
          >
            <label className="track-check" onClick={e => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selected.has(t.id)}
                onChange={() => toggleSelect(t.id)}
              />
              <span className="chk" aria-hidden>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </label>
            <div className={s.num}>{String(i + 1).padStart(2, '0')}</div>
            <div className={s.cover}><Cover track={t} size={44} /></div>
            <div className={s.titleBlock}>
              <div className={s.title}>
                {t.title}
                {t.id === currentTrackId && (
                  <span style={{ color: 'var(--accent)', marginLeft: 8, fontSize: 10 }}>▶ NOW</span>
                )}
              </div>
              <div className={s.sub}>{t.tags}</div>
            </div>
            <div>
              <div className={s.modePill}>{t.mode} · {t.promptMode}</div>
              {t.instrumental && (
                <div className="mono" style={{ fontSize: 9, color: 'var(--fg-3)', marginTop: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  instrumental
                </div>
              )}
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', letterSpacing: '0.04em' }}>{t.model}</div>
            <div className={s.dur}>{formatTime(t.duration)}</div>
            <button
              type="button"
              className={`${s.fav}${t.isFavorite ? ` ${s.on}` : ''}`}
              onClick={e => { e.stopPropagation(); onToggleFav(t.id); }}
              title={t.isFavorite ? 'Unfavorite' : 'Favorite'}
            >
              {t.isFavorite ? '★' : '☆'}
            </button>
            <button
              type="button"
              className={s.menu}
              onClick={e => {
                e.stopPropagation();
                setRowMenuRect(e.currentTarget.getBoundingClientRect());
                setRowMenuFor(t.id);
                setAddPlaylistFor(null);
              }}
              title="More"
            >
              ⋯
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty">
            No tracks match these filters.<br />
            Try clearing search or switching to ALL.
          </div>
        )}
      </div>

      {/* Multi-select action bar */}
      {selected.size > 0 && (
        <div className="multi-bar">
          <div className="multi-bar-inner">
            <div className="mono uc" style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.12em' }}>
              ● {selected.size} SELECTED
            </div>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              className="btn sm primary"
              onClick={e => {
                setBarMenuRect(e.currentTarget.getBoundingClientRect());
                setBarMenuOpen(true);
              }}
            >
              + Add to Playlist
            </button>
            <button type="button" className="btn sm ghost" onClick={clearSelection}>Clear</button>
          </div>
        </div>
      )}

      {/* Row context menu */}
      <Menu
        open={!!rowMenuFor}
        anchorRect={rowMenuRect}
        onClose={() => { setRowMenuFor(null); setAddPlaylistFor(null); }}
      >
        {!addPlaylistFor ? (
          <>
            <MenuItem onClick={() => { if (rowMenuFor) { onAddToQueue(rowMenuFor); setRowMenuFor(null); } }}>
              Add to Queue
            </MenuItem>
            <MenuItem onClick={() => setAddPlaylistFor(rowMenuFor)}>
              Add to Playlist →
            </MenuItem>
            <MenuSep />
            <MenuItem
              danger
              onClick={async () => {
                const id = rowMenuFor;
                const t = tracks.find(x => x.id === id);
                setRowMenuFor(null);
                if (!t) return;
                const ok = await confirm({
                  eyebrow: 'Library',
                  title: `Delete "${t.title}"?`,
                  body: 'This removes the track from your library. The generated audio cannot be recovered.',
                  confirmLabel: 'Delete track',
                  tone: 'danger',
                });
                if (ok && id) onDelete(id);
              }}
            >
              Delete Track
            </MenuItem>
          </>
        ) : (
          <>
            <MenuHeading>Add to Playlist</MenuHeading>
            {playlists.map(pl => (
              <MenuItem
                key={pl.id}
                sub={pl.tracks.length}
                onClick={() => {
                  if (addPlaylistFor) onAddToPlaylist(pl.id, [addPlaylistFor]);
                  setRowMenuFor(null);
                  setAddPlaylistFor(null);
                }}
              >
                {pl.title}
              </MenuItem>
            ))}
            <MenuSep />
            <MenuItem
              onClick={() => {
                if (addPlaylistFor) onNewPlaylistWithTracks([addPlaylistFor]);
                setRowMenuFor(null);
                setAddPlaylistFor(null);
              }}
            >
              + New Playlist
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Multi-select bar menu */}
      <Menu open={barMenuOpen} anchorRect={barMenuRect} onClose={() => setBarMenuOpen(false)}>
        <MenuHeading>Add {selected.size} track{selected.size === 1 ? '' : 's'} to…</MenuHeading>
        {playlists.map(pl => (
          <MenuItem
            key={pl.id}
            sub={pl.tracks.length}
            onClick={() => { onAddToPlaylist(pl.id, selectedArr); setBarMenuOpen(false); clearSelection(); }}
          >
            {pl.title}
          </MenuItem>
        ))}
        <MenuSep />
        <MenuItem onClick={() => { onNewPlaylistWithTracks(selectedArr); setBarMenuOpen(false); clearSelection(); }}>
          + New Playlist
        </MenuItem>
      </Menu>
    </div>
  );
}
