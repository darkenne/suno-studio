'use client';
import { useState, useEffect, useRef } from 'react';
import type { Playlist, Track } from '@/types';
import { ArrowLeft, Download, GripVertical, MoreHorizontal, Play, Plus, Shuffle, X } from 'lucide-react';
import { Cover } from '@/components/cover/Cover';
import { Menu, MenuItem, MenuSep } from '@/components/ui/Menu';
import { useConfirm } from '@/hooks/useConfirm';
import { formatTime, formatHMS2 } from '@/lib/utils';

/* ── PlaylistTitleModal ─────────────────────────────────── */
interface PlaylistTitleModalProps {
  open: boolean;
  initialTitle?: string;
  mode?: 'create' | 'rename';
  onCancel: () => void;
  onSubmit: (title: string) => void;
}

export function PlaylistTitleModal({ open, initialTitle, mode = 'create', onCancel, onSubmit }: PlaylistTitleModalProps) {
  const [val, setVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setVal(initialTitle ?? 'Untitled');
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 20);
    }
  }, [open, initialTitle]);

  const submit = () => {
    const t = val.trim();
    if (!t) return;
    onSubmit(t.slice(0, 100));
  };

  if (!open) return null;

  return (
    <div
      className="dlg-backdrop"
      onMouseDown={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="dlg-panel" style={{ maxWidth: 440, width: '100%' }} role="dialog" aria-modal="true">
        <div className="dlg-head">
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 6 }}>
              {mode === 'create' ? 'New Playlist' : 'Rename Playlist'}
            </div>
            <h2 className="dlg-title">{mode === 'create' ? 'Name your playlist' : 'Rename playlist'}</h2>
          </div>
          <button className="dlg-x" onClick={onCancel} aria-label="Close">
            <X size={14} />
          </button>
        </div>
        <div className="dlg-body">
          <div className="field" style={{ margin: 0 }}>
            <div className="label">
              <span>Title</span>
              <span className="count tnum">{val.length}/100</span>
            </div>
            <input
              ref={inputRef}
              className="input"
              maxLength={100}
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              placeholder="Untitled"
            />
          </div>
        </div>
        <div className="dlg-foot">
          <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn primary" onClick={submit} disabled={!val.trim()}>
            {mode === 'create' ? 'Create' : 'Rename'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── PlaylistsPage ──────────────────────────────────────── */
interface PlaylistsPageProps {
  playlists: Playlist[];
  tracks: Track[];
  onOpen: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export function PlaylistsPage({ playlists, tracks, onOpen, onCreate, onDelete }: PlaylistsPageProps) {
  const confirm = useConfirm();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

  const trackOf = (id: string) => tracks.find(t => t.id === id);

  return (
    <div>
      <div className="section no-underline" style={{ paddingBottom: 16 }}>
        <div className="h-eyebrow" style={{ marginBottom: 10 }}>Playlists</div>
        <h1 className="h-display">Your collections</h1>
      </div>

      <div className="section no-underline">
        <div className="pl-grid">
          {/* Create card */}
          <button type="button" className="pl-card new" onClick={onCreate}>
            <div className="pl-cover-new">
              <Plus size={28} />
            </div>
            <div className="pl-meta">
              <div className="pl-title">Create Playlist</div>
              <div className="pl-sub mono">NEW</div>
            </div>
          </button>

          {playlists.map(pl => {
            const first = pl.tracks[0] ? trackOf(pl.tracks[0].trackId) : null;
            return (
              <div key={pl.id} className="pl-card" onClick={() => onOpen(pl.id)}>
                <div className="pl-cover">
                  {first
                    ? <Cover track={first} size={260} />
                    : <div className="pl-cover-empty mono">EMPTY</div>}
                </div>
                <div className="pl-meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="pl-title">{pl.title}</div>
                    <div className="pl-sub mono">{pl.tracks.length} TRACK{pl.tracks.length === 1 ? '' : 'S'}</div>
                  </div>
                  <button
                    type="button"
                    className="pl-card-menu"
                    onClick={e => {
                      e.stopPropagation();
                      setMenuRect(e.currentTarget.getBoundingClientRect());
                      setMenuFor(pl.id);
                    }}
                    title="More"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Menu open={!!menuFor} anchorRect={menuRect} onClose={() => setMenuFor(null)}>
        <MenuItem
          danger
          onClick={async () => {
            const pl = playlists.find(p => p.id === menuFor);
            setMenuFor(null);
            if (!pl) return;
            const ok = await confirm({
              eyebrow: 'Playlist',
              title: `Delete "${pl.title}"?`,
              body: 'The playlist is removed. Tracks inside it remain in your library.',
              confirmLabel: 'Delete',
              tone: 'danger',
            });
            if (ok) onDelete(pl.id);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
}

/* ── PlaylistDetailPage ─────────────────────────────────── */
interface PlaylistDetailPageProps {
  playlist: Playlist;
  tracks: Track[];
  currentTrackId?: string;
  onPlayPlaylist: (id: string, shuffle: boolean) => void;
  onPlayTrack: (t: Track, playlistId: string) => void;
  onRename: (id: string, title: string) => void;
  onDescribe: (id: string, desc: string) => void;
  onRemoveTrack: (playlistId: string, trackId: string) => void;
  onReorder: (id: string, trackIds: string[]) => void;
  onDelete: (id: string) => void;
  onAddToQueue: (trackId: string) => void;
  onBack: () => void;
}

export function PlaylistDetailPage({
  playlist, tracks, currentTrackId, onPlayPlaylist, onPlayTrack,
  onRename, onDescribe, onRemoveTrack, onReorder, onDelete, onAddToQueue, onBack,
}: PlaylistDetailPageProps) {
  const confirm = useConfirm();
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [titleVal, setTitleVal] = useState(playlist.title);
  const [descVal, setDescVal] = useState(playlist.description);
  const [menuTrack, setMenuTrack] = useState<string | null>(null);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const [headMenuOpen, setHeadMenuOpen] = useState(false);
  const [headMenuRect, setHeadMenuRect] = useState<DOMRect | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dlPhase, setDlPhase] = useState<'idle' | 'fetching' | 'encoding' | 'done'>('idle');
  const [dlLoaded, setDlLoaded] = useState(0);
  const [dlTotal, setDlTotal] = useState(0);

  useEffect(() => {
    setTitleVal(playlist.title);
    setDescVal(playlist.description);
  }, [playlist.id, playlist.title, playlist.description]);

  const downloadMerged = async () => {
    const items = list.filter(t => t.audioUrl);
    if (items.length === 0) return;
    setDlPhase('fetching');
    setDlLoaded(0);
    setDlTotal(items.length);
    try {
      const ctx = new AudioContext();
      const buffers: AudioBuffer[] = [];
      for (let i = 0; i < items.length; i++) {
        const res = await fetch(items[i].audioUrl!);
        const ab = await res.arrayBuffer();
        const decoded = await ctx.decodeAudioData(ab);
        buffers.push(decoded);
        setDlLoaded(i + 1);
      }
      setDlPhase('encoding');
      await new Promise(r => setTimeout(r, 0));
      const wav = mergeToWav(buffers);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${playlist.title}.wav`;
      a.click();
      URL.revokeObjectURL(url);
      setDlPhase('done');
      setTimeout(() => setDlPhase('idle'), 2500);
    } catch {
      setDlPhase('idle');
    }
  };

  const list = playlist.tracks
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(pt => tracks.find(t => t.id === pt.trackId))
    .filter((t): t is Track => Boolean(t));

  const first = list[0];

  const saveTitle = () => {
    const v = titleVal.trim().slice(0, 100);
    if (v && v !== playlist.title) onRename(playlist.id, v);
    else setTitleVal(playlist.title);
    setEditingTitle(false);
  };

  const saveDesc = () => {
    onDescribe(playlist.id, descVal.slice(0, 200));
    setEditingDesc(false);
  };

  const onRowDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragId || !overId || dragId === overId) { setDragId(null); setOverId(null); return; }
    const ids = list.map(t => t.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(overId);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    onReorder(playlist.id, ids);
    setDragId(null);
    setOverId(null);
  };

  const totalDur = list.reduce((s, t) => s + t.duration, 0);

  return (
    <div>
      <div className="section no-underline" style={{ paddingBottom: 20 }}>
        <button type="button" className="btn sm ghost" onClick={onBack} style={{ marginBottom: 16 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} />
            All playlists
          </span>
        </button>

        <div className="pl-detail-head">
          <div className="pl-detail-cover">
            {first ? <Cover track={first} size={220} /> : <div className="pl-cover-empty mono">EMPTY</div>}
          </div>
          <div className="pl-detail-meta">
            <div className="h-eyebrow" style={{ marginBottom: 8 }}>Playlist</div>

            {editingTitle ? (
              <input
                className="pl-title-input"
                autoFocus
                value={titleVal}
                maxLength={100}
                onChange={e => setTitleVal(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') { setTitleVal(playlist.title); setEditingTitle(false); }
                }}
              />
            ) : (
              <h1 className="h-display pl-title-edit" onClick={() => setEditingTitle(true)} title="Click to rename">
                {playlist.title}
              </h1>
            )}

            {editingDesc ? (
              <input
                className="pl-desc-input"
                autoFocus
                value={descVal}
                maxLength={200}
                onChange={e => setDescVal(e.target.value)}
                onBlur={saveDesc}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveDesc();
                  if (e.key === 'Escape') { setDescVal(playlist.description); setEditingDesc(false); }
                }}
              />
            ) : (
              <div
                className={`pl-desc-edit${!playlist.description ? ' placeholder' : ''}`}
                onClick={() => setEditingDesc(true)}
                title="Click to edit"
              >
                {playlist.description || 'Add playlist description'}
              </div>
            )}

            <div className="pl-stat mono">
              {list.length} SONG{list.length === 1 ? '' : 'S'}
              <span style={{ margin: '0 10px', color: 'var(--fg-3)' }}>·</span>
              {formatHMS2(totalDur)}
            </div>

            <div className="pl-actions">
              <button
                type="button"
                className="btn primary"
                onClick={() => onPlayPlaylist(playlist.id, false)}
                disabled={list.length === 0}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Play size={13} strokeWidth={2} aria-hidden="true" />
                  Play
                </span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => onPlayPlaylist(playlist.id, true)}
                disabled={list.length === 0}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Shuffle size={13} strokeWidth={2} aria-hidden="true" />
                  Shuffle
                </span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={downloadMerged}
                disabled={list.length === 0 || dlPhase !== 'idle'}
                title="Merge all tracks and download as one WAV file"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Download size={13} strokeWidth={2} aria-hidden="true" />
                  {dlPhase === 'idle' && 'Download All'}
                  {dlPhase === 'fetching' && `Loading ${dlLoaded}/${dlTotal}…`}
                  {dlPhase === 'encoding' && 'Encoding…'}
                  {dlPhase === 'done' && 'Done!'}
                </span>
              </button>
              <button
                type="button"
                className="btn ghost icon"
                onClick={e => {
                  setHeadMenuRect(e.currentTarget.getBoundingClientRect());
                  setHeadMenuOpen(true);
                }}
                title="More"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section no-underline">
        <div className="home-recent">
          <div className="track-header pl-track-header">
            <span />
            <span>#</span>
            <span />
            <span>Title · Tags</span>
            <span>Mode · Prompt</span>
            <span>Model</span>
            <span style={{ textAlign: 'right' }}>Duration</span>
            <span />
          </div>
          <div
            className="track-list"
            onDragOver={e => e.preventDefault()}
            onDrop={onRowDrop}
          >
            {list.map((t, i) => (
              <div
                key={t.id}
                className={
                  `track pl-track` +
                  (t.id === currentTrackId ? ' playing' : '') +
                  (dragId === t.id ? ' dragging' : '') +
                  (overId === t.id && dragId !== t.id ? ' dragover' : '')
                }
                draggable
                onDragStart={() => setDragId(t.id)}
                onDragEnd={() => { setDragId(null); setOverId(null); }}
                onDragOver={e => { e.preventDefault(); setOverId(t.id); }}
                onClick={() => onPlayTrack(t, playlist.id)}
              >
                <div className="drag-handle" title="Drag to reorder"><GripVertical size={14} /></div>
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
                <div>
                  <div className="mode-pill" style={{ display: 'inline-block' }}>{t.mode} · {t.promptMode}</div>
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', letterSpacing: '0.04em' }}>{t.model}</div>
                <div className="dur tnum">{formatTime(t.duration)}</div>
                <button
                  type="button"
                  className="menu"
                  onClick={e => {
                    e.stopPropagation();
                    setMenuRect(e.currentTarget.getBoundingClientRect());
                    setMenuTrack(t.id);
                  }}
                  title="More"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            ))}
            {list.length === 0 && (
              <div className="empty">
                No tracks yet.<br />
                Add from the Library via the menu button or multi-select.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Track row menu */}
      <Menu open={!!menuTrack} anchorRect={menuRect} onClose={() => setMenuTrack(null)}>
        <MenuItem onClick={() => { if (menuTrack) { onAddToQueue(menuTrack); setMenuTrack(null); } }}>
          Add to Queue
        </MenuItem>
        <MenuSep />
        <MenuItem
          danger
          onClick={() => {
            if (menuTrack) { onRemoveTrack(playlist.id, menuTrack); setMenuTrack(null); }
          }}
        >
          Remove from Playlist
        </MenuItem>
      </Menu>

      {/* Head menu */}
      <Menu open={headMenuOpen} anchorRect={headMenuRect} onClose={() => setHeadMenuOpen(false)} width={200}>
        <MenuItem onClick={() => { setHeadMenuOpen(false); setEditingTitle(true); }}>Rename</MenuItem>
        <MenuSep />
        <MenuItem
          danger
          onClick={async () => {
            setHeadMenuOpen(false);
            const ok = await confirm({
              eyebrow: 'Playlist',
              title: `Delete "${playlist.title}"?`,
              body: 'The playlist is removed. Tracks inside it remain in your library.',
              confirmLabel: 'Delete',
              tone: 'danger',
            });
            if (ok) onDelete(playlist.id);
          }}
        >
          Delete Playlist
        </MenuItem>
      </Menu>
    </div>
  );
}

/* ── Audio merge helpers ────────────────────────────────── */
function mergeToWav(buffers: AudioBuffer[]): ArrayBuffer {
  const sampleRate = buffers[0].sampleRate;
  const numChannels = buffers[0].numberOfChannels;
  const totalFrames = buffers.reduce((s, b) => s + b.length, 0);
  const bytesPerSample = 2;
  const dataSize = totalFrames * numChannels * bytesPerSample;
  const out = new ArrayBuffer(44 + dataSize);
  const view = new DataView(out);

  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true);
  w(8, 'WAVE'); w(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  w(36, 'data'); view.setUint32(40, dataSize, true);

  let offset = 44;
  for (const buf of buffers) {
    const channels = Array.from({ length: numChannels }, (_, c) => buf.getChannelData(c));
    for (let i = 0; i < buf.length; i++) {
      for (let c = 0; c < numChannels; c++) {
        const s = Math.max(-1, Math.min(1, channels[c][i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
      }
    }
  }
  return out;
}
