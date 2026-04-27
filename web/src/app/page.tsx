'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AccentKey, AdvancedFormValues, CreateMode, FontPair, Playlist, PlaylistTrack, RepeatMode, TimedLyricLine, Track, View } from '@/types';
import { ConfirmProvider } from '@/hooks/useConfirm';
import { useBatch } from '@/hooks/useBatch';
import { useToasts } from '@/hooks/useToasts';
import { TopBar } from '@/components/shell/TopBar';
import { Nav } from '@/components/shell/Nav';
import { Aside } from '@/components/shell/Aside';
import { Player } from '@/components/shell/Player';
import { LyricsOverlay } from '@/components/shell/LyricsOverlay';
import { Tweaks } from '@/components/shell/Tweaks';
import { CreatePanel } from '@/components/create/CreatePanel';
import { SimplePanel } from '@/components/create/SimplePanel';
import { GenerationView } from '@/components/generation/GenerationView';
import { Library } from '@/components/library/Library';
import { Home } from '@/components/home/Home';
import { PlaylistsPage, PlaylistDetailPage, PlaylistTitleModal } from '@/components/playlists/Playlists';
import { Toasts } from '@/components/ui/Toasts';
import s from '@/components/shell/Shell.module.css';

const WORKSPACE_KEY     = 'suno_workspace_id';
const BASE_CREDITS_TOTAL = 1050;
const CREDITS_TOTAL_KEY_PREFIX = 'suno_total_credited';

type CreditsState = {
  used: number | null;
  total: number | null;
  remaining: number | null;
};

function Studio() {
  const [view, setView]                     = useState<View>('home');
  const [createMode, setCreateMode]         = useState<CreateMode>('simple');
  const [tracks, setTracks]                 = useState<Track[]>([]);
  const [playlists, setPlaylists]           = useState<Playlist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack]     = useState<Track | null>(null);
  const [isPlaying, setIsPlaying]           = useState(false);
  const [playhead, setPlayhead]             = useState(0);
  const [tweaksOpen, setTweaksOpen]         = useState(false);
  const [accent, setAccent]                 = useState<AccentKey>('lime');
  const [fontPair, setFontPair]             = useState<FontPair>('mono-sans');
  const [repeat, setRepeat]                 = useState<RepeatMode>('off');
  const [shuffle, setShuffle]               = useState(false);
  const [volume, setVolume]                 = useState(0.8);
  const [lyricsOpen, setLyricsOpen]         = useState(false);
  const [hydrated, setHydrated]             = useState(false);
  const [workspaceId, setWorkspaceId]       = useState<string | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [creditedTotal, setCreditedTotal]   = useState<number>(BASE_CREDITS_TOTAL);
  const [lastRemaining, setLastRemaining]   = useState<number | null>(null);
  const creditedTotalRef                    = useRef<number>(BASE_CREDITS_TOTAL);
  const lastRemainingRef                    = useRef<number | null>(null);
  const [credits, setCredits]               = useState<CreditsState>({
    used: null,
    total: null,
    remaining: null,
  });

  /* Playlist modal */
  const [plModalOpen, setPlModalOpen]       = useState(false);
  const [plModalMode, setPlModalMode]       = useState<'create' | 'rename'>('create');
  const [plModalInitial, setPlModalInitial] = useState('');
  const [plModalCallback, setPlModalCallback] = useState<((title: string) => void) | null>(null);

  /* Queue (tracks to play next) */
  const [queue, setQueue]                   = useState<string[]>([]);

  const { toasts, push: pushToast, dismiss: dismissToast } = useToasts();
  const { jobs, batchTotal, batchTracks, isComplete, startBatch, cancelBatch } = useBatch();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ── Resolve workspace id ─────────────────────────── */
  useEffect(() => {
    try {
      const existing = localStorage.getItem(WORKSPACE_KEY);
      if (existing) {
        setWorkspaceId(existing);
        return;
      }
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `ws_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(WORKSPACE_KEY, id);
      setWorkspaceId(id);
    } catch {
      setWorkspaceId('default-workspace');
    }
  }, []);

  /* ── Load snapshot from Supabase ─────────────────── */
  useEffect(() => {
    if (!workspaceId) return;
    let mounted = true;
    const controller = new AbortController();

    const loadSnapshot = async () => {
      try {
        const res = await fetch(`/api/storage/snapshot?workspaceId=${encodeURIComponent(workspaceId)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) return;
        const payload = await res.json();
        const remoteTracks = payload?.data?.tracks;
        const remotePlaylists = payload?.data?.playlists;
        if (!mounted) return;
        if (Array.isArray(remoteTracks)) {
          setTracks(remoteTracks as Track[]);
          setCurrentTrack((remoteTracks as Track[])[0] ?? null);
          if (Array.isArray(remotePlaylists) && remotePlaylists.length > 0) {
            setPlaylists(remotePlaylists as Playlist[]);
          } else {
            setPlaylists([]);
          }
        }
      } catch {
        // keep local in-memory defaults
      } finally {
        if (mounted) setHydrated(true);
      }
    };

    loadSnapshot();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [workspaceId]);

  useEffect(() => {
    creditedTotalRef.current = creditedTotal;
  }, [creditedTotal]);

  useEffect(() => {
    lastRemainingRef.current = lastRemaining;
  }, [lastRemaining]);

  useEffect(() => {
    if (!workspaceId) return;
    try {
      const raw = localStorage.getItem(`${CREDITS_TOTAL_KEY_PREFIX}_${workspaceId}`);
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed >= BASE_CREDITS_TOTAL) {
        setCreditedTotal(parsed);
        return;
      }
    } catch {
      // ignore read failure
    }
    setCreditedTotal(BASE_CREDITS_TOTAL);
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    try {
      localStorage.setItem(`${CREDITS_TOTAL_KEY_PREFIX}_${workspaceId}`, String(creditedTotal));
    } catch {
      // ignore write failure
    }
  }, [workspaceId, creditedTotal]);

  /* ── Persist snapshot to Supabase ────────────────── */
  useEffect(() => {
    if (!hydrated || !workspaceId) return;
    const controller = new AbortController();
    const id = setTimeout(async () => {
      try {
        await fetch('/api/storage/snapshot', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId, tracks, playlists }),
          signal: controller.signal,
        });
      } catch {
        // ignore transient save failures
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(id);
    };
  }, [tracks, playlists, hydrated, workspaceId]);

  /* ── Audio ────────────────────────────────────────── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = currentTrack?.audioUrl ?? currentTrack?.streamAudioUrl ?? '';
    if (audio.src !== url) { audio.src = url; audio.load(); }
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;
    if (isPlaying) audio.play().catch(() => {}); else audio.pause();
  }, [isPlaying, currentTrack]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  useEffect(() => {
    if (!currentTrack) setLyricsOpen(false);
  }, [currentTrack]);

  const handleNextRef = useRef<() => void>(() => {});

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime  = () => setPlayhead(audio.currentTime);
    const onEnded = () => handleNextRef.current();
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('ended', onEnded); };
  }, []);

  useEffect(() => {
    if (!isPlaying || !currentTrack || currentTrack.audioUrl) return;
    const id = setInterval(() => {
      setPlayhead(p => {
        if (p >= currentTrack.duration) { handleNextRef.current(); return 0; }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, currentTrack]);

  /* ── Design tokens ───────────────────────────────── */
  useEffect(() => {
    const root = document.documentElement;
    const accents: Record<AccentKey, [string, string, string]> = {
      lime:    ['oklch(0.88 0.22 130)', 'oklch(0.88 0.22 130 / 0.14)', 'oklch(0.88 0.22 130 / 0.45)'],
      amber:   ['oklch(0.83 0.18 70)',  'oklch(0.83 0.18 70 / 0.14)',  'oklch(0.83 0.18 70 / 0.45)'],
      cyan:    ['oklch(0.85 0.16 210)', 'oklch(0.85 0.16 210 / 0.14)', 'oklch(0.85 0.16 210 / 0.45)'],
      magenta: ['oklch(0.78 0.25 340)', 'oklch(0.78 0.25 340 / 0.14)', 'oklch(0.78 0.25 340 / 0.45)'],
      coral:   ['oklch(0.78 0.20 30)',  'oklch(0.78 0.20 30 / 0.14)',  'oklch(0.78 0.20 30 / 0.45)'],
    };
    const [a, soft, line] = accents[accent];
    root.style.setProperty('--accent', a);
    root.style.setProperty('--accent-soft', soft);
    root.style.setProperty('--accent-line', line);
  }, [accent]);

  useEffect(() => {
    const root = document.documentElement;
    const fonts: Record<FontPair, [string, string]> = {
      'mono-sans':    ['var(--font-inter-tight), "Inter Tight", system-ui, sans-serif',   'var(--font-jetbrains), "JetBrains Mono", ui-monospace, monospace'],
      'serif-mono':   ['var(--font-fraunces), "Fraunces", Georgia, serif',                'var(--font-jetbrains), "JetBrains Mono", ui-monospace, monospace'],
      'grotesk-mono': ['var(--font-space-grotesk), "Space Grotesk", system-ui, sans-serif', 'var(--font-ibm-plex), "IBM Plex Mono", ui-monospace, monospace'],
      'neue-mono':    ['var(--font-inter-tight), "Inter Tight", system-ui, sans-serif',   'var(--font-ibm-plex), "IBM Plex Mono", ui-monospace, monospace'],
    };
    const [sans, mono] = fonts[fontPair];
    root.style.setProperty('--sans', sans);
    root.style.setProperty('--mono', mono);
  }, [fontPair]);

  useEffect(() => {
    const timers = new WeakMap<EventTarget, ReturnType<typeof setTimeout>>();
    const handler = (e: Event) => {
      const el = e.target as HTMLElement;
      if (!el?.classList) return;
      el.classList.add('is-scrolling');
      const prev = timers.get(el);
      if (prev) clearTimeout(prev);
      timers.set(el, setTimeout(() => el.classList.remove('is-scrolling'), 900));
    };
    document.addEventListener('scroll', handler, true);
    return () => document.removeEventListener('scroll', handler, true);
  }, []);

  /* ── Credits ──────────────────────────────────────── */
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchCredits = async () => {
      try {
        const res = await fetch('/api/generate/credit', {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) return;
        const payload = await res.json();
        const remaining = Number(payload?.data);
        if (!Number.isFinite(remaining) || !mounted) return;

        const prevTotal = creditedTotalRef.current;
        const prevRemaining = lastRemainingRef.current;
        let nextTotal = prevTotal;
        if (prevRemaining === null) {
          // First sample: keep configured base, but never lower than remaining.
          nextTotal = Math.max(prevTotal, remaining);
        } else if (remaining > prevRemaining) {
          // Remaining increase implies recharge happened.
          nextTotal = prevTotal + (remaining - prevRemaining);
        }

        setCreditedTotal(nextTotal);
        setLastRemaining(remaining);
        setCredits({
          total: nextTotal,
          remaining,
          used: Math.max(nextTotal - remaining, 0),
        });
        setCreditsLoading(false);
      } catch {
        setCreditsLoading(false);
      }
    };

    fetchCredits();
    const id = setInterval(fetchCredits, 15_000);

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(id);
    };
  }, []);

  /* ── Playback helpers ────────────────────────────── */
  const playTrack = useCallback((t: Track) => {
    setCurrentTrack(t);
    setPlayhead(0);
    setIsPlaying(true);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, []);

  const onTimedLyricsLoaded = useCallback((trackId: string, lines: TimedLyricLine[]) => {
    if (!lines.length) return;
    setTracks(ts => ts.map(t => (t.id === trackId ? { ...t, lyrics: lines } : t)));
    setCurrentTrack(ct => (ct?.id === trackId ? { ...ct, lyrics: lines } : ct));
  }, []);

  const handleNext = useCallback(() => {
    if (!tracks.length) return;
    if (repeat === 'one' && currentTrack) {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
      setPlayhead(0);
      return;
    }
    /* Drain queue first */
    if (queue.length > 0) {
      const [nextId, ...rest] = queue;
      setQueue(rest);
      const qt = tracks.find(t => t.id === nextId);
      if (qt) { playTrack(qt); return; }
    }
    const idx = currentTrack ? tracks.findIndex(t => t.id === currentTrack.id) : -1;
    let next: Track | undefined;
    if (shuffle) {
      const pool = tracks.filter(t => t.id !== currentTrack?.id);
      next = pool[Math.floor(Math.random() * pool.length)];
    } else {
      const ni = idx + 1;
      next = ni < tracks.length ? tracks[ni] : (repeat === 'all' ? tracks[0] : undefined);
    }
    if (next) playTrack(next); else { setIsPlaying(false); setPlayhead(0); }
  }, [tracks, currentTrack, repeat, shuffle, queue, playTrack]);

  const handlePrev = useCallback(() => {
    if (playhead > 3 && currentTrack) {
      setPlayhead(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    const idx = currentTrack ? tracks.findIndex(t => t.id === currentTrack.id) : -1;
    let prev: Track | undefined;
    if (shuffle) {
      const pool = tracks.filter(t => t.id !== currentTrack?.id);
      prev = pool[Math.floor(Math.random() * pool.length)];
    } else {
      const pi = idx - 1;
      prev = pi >= 0 ? tracks[pi] : (repeat === 'all' ? tracks[tracks.length - 1] : undefined);
    }
    if (prev) playTrack(prev); else { setPlayhead(0); if (audioRef.current) audioRef.current.currentTime = 0; }
  }, [tracks, currentTrack, repeat, shuffle, playhead, playTrack]);

  useEffect(() => { handleNextRef.current = handleNext; }, [handleNext]);

  /* ── Batch generation ────────────────────────────── */
  const handleStartBatch = useCallback((values: AdvancedFormValues) => {
    startBatch(values, {
      onNewTracks: newTracks => setTracks(prev => [...newTracks, ...prev]),
      onToast: pushToast,
    });
    setView('generating');
  }, [startBatch, pushToast]);

  const handleCancelBatch = useCallback(() => {
    cancelBatch({ onToast: pushToast });
  }, [cancelBatch, pushToast]);

  /* ── Track actions ───────────────────────────────── */
  const toggleFav = (id: string) => {
    setTracks(ts => ts.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  const deleteTrack = (id: string) => {
    setTracks(ts => ts.filter(t => t.id !== id));
    setPlaylists(pls => pls.map(pl => ({
      ...pl,
      tracks: pl.tracks.filter(pt => pt.trackId !== id),
    })));
    pushToast('Track removed');
  };

  const deleteTracks = (ids: string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setTracks(ts => ts.filter(t => !idSet.has(t.id)));
    setPlaylists(pls => pls.map(pl => ({
      ...pl,
      tracks: pl.tracks.filter(pt => !idSet.has(pt.trackId)),
    })));
    pushToast(`${ids.length} track${ids.length === 1 ? '' : 's'} deleted.`);
  };

  const addToQueue = (trackId: string) => {
    setQueue(q => [...q, trackId]);
    const t = tracks.find(x => x.id === trackId);
    pushToast(`"${t?.title ?? trackId}" added to queue`);
  };

  /* ── Playlist actions ────────────────────────────── */
  const openCreatePlaylistModal = (cb: (title: string) => void) => {
    setPlModalMode('create');
    setPlModalInitial('Untitled');
    setPlModalCallback(() => cb);
    setPlModalOpen(true);
  };

  const createPlaylist = (title: string, trackIds: string[] = []): Playlist => {
    const pl: Playlist = {
      id: 'pl_' + Math.random().toString(36).slice(2, 8),
      title,
      description: '',
      createdAt: new Date().toISOString(),
      tracks: trackIds.map((id, i) => ({ trackId: id, position: i, addedAt: new Date().toISOString() })),
    };
    setPlaylists(prev => [...prev, pl]);
    return pl;
  };

  const handleNewPlaylist = () => {
    openCreatePlaylistModal(title => {
      const pl = createPlaylist(title);
      setActivePlaylistId(pl.id);
      setView('playlist-detail');
    });
  };

  const handleNewPlaylistWithTracks = (trackIds: string[]) => {
    openCreatePlaylistModal(title => {
      const pl = createPlaylist(title, trackIds);
      setActivePlaylistId(pl.id);
      setView('playlist-detail');
      pushToast(`Playlist "${pl.title}" created with ${trackIds.length} track${trackIds.length === 1 ? '' : 's'}`);
    });
  };

  const openPlaylist = (id: string) => {
    setLyricsOpen(false);
    setActivePlaylistId(id);
    setView('playlist-detail');
  };

  const renamePlaylist = (id: string, title: string) => {
    setPlaylists(pls => pls.map(pl => pl.id === id ? { ...pl, title } : pl));
  };

  const describePlaylist = (id: string, description: string) => {
    setPlaylists(pls => pls.map(pl => pl.id === id ? { ...pl, description } : pl));
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(pls => pls.filter(pl => pl.id !== id));
    if (activePlaylistId === id) {
      setActivePlaylistId(null);
      setView('playlists');
    }
  };

  const addToPlaylist = (playlistId: string, trackIds: string[]) => {
    setPlaylists(pls => pls.map(pl => {
      if (pl.id !== playlistId) return pl;
      const existing = new Set(pl.tracks.map(pt => pt.trackId));
      const newItems: PlaylistTrack[] = trackIds
        .filter(id => !existing.has(id))
        .map((id, i) => ({ trackId: id, position: pl.tracks.length + i, addedAt: new Date().toISOString() }));
      return { ...pl, tracks: [...pl.tracks, ...newItems] };
    }));
    const pl = playlists.find(p => p.id === playlistId);
    pushToast(
      `Added to "${pl?.title ?? 'playlist'}"`,
      'ok',
      {
        label: 'View',
        fn: () => {
          setActivePlaylistId(playlistId);
          setView('playlist-detail');
        },
      },
    );
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(pls => pls.map(pl => pl.id !== playlistId ? pl : {
      ...pl,
      tracks: pl.tracks.filter(pt => pt.trackId !== trackId).map((pt, i) => ({ ...pt, position: i })),
    }));
  };

  const reorderPlaylist = (playlistId: string, orderedIds: string[]) => {
    setPlaylists(pls => pls.map(pl => pl.id !== playlistId ? pl : {
      ...pl,
      tracks: orderedIds.map((id, i) => {
        const existing = pl.tracks.find(pt => pt.trackId === id);
        return existing ? { ...existing, position: i } : { trackId: id, position: i, addedAt: new Date().toISOString() };
      }),
    }));
  };

  const playPlaylist = (playlistId: string, doShuffle: boolean) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl || pl.tracks.length === 0) return;
    const ordered = pl.tracks
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(pt => tracks.find(t => t.id === pt.trackId))
      .filter((t): t is Track => Boolean(t));
    if (ordered.length === 0) return;
    if (doShuffle) {
      const shuffled = [...ordered].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0]);
      setQueue(shuffled.slice(1).map(t => t.id));
    } else {
      playTrack(ordered[0]);
      setQueue(ordered.slice(1).map(t => t.id));
    }
    setShuffle(doShuffle);
  };

  /* ── Misc ─────────────────────────────────────────── */
  const runningCount = jobs.filter(j => j.status !== 'SUCCESS' && j.status !== 'FAILED').length;
  const activePlaylist = playlists.find(p => p.id === activePlaylistId) ?? null;

  const noAside = view === 'playlists' || view === 'playlist-detail' || view === 'library';

  return (
    <div className={`${s.app}${noAside ? ` ${s.noAside}` : ''}`}>
      <TopBar
        batchJobs={jobs}
        batchTotal={batchTotal}
        savedCount={batchTracks.length}
        remainingCredits={credits.remaining}
        totalCredits={credits.total}
        isCreditsLoading={creditsLoading}
      />

      <Nav
        view={view}
        onNav={v => { setLyricsOpen(false); setView(v); }}
        onOpenPlaylist={openPlaylist}
        onNewPlaylist={handleNewPlaylist}
        activePlaylistId={activePlaylistId}
        playlists={playlists}
        trackCount={tracks.length}
        favCount={tracks.filter(t => t.isFavorite).length}
        runningCount={runningCount}
      />

      <main className={lyricsOpen && currentTrack ? s.main : `${s.main} scroll`}>
        {lyricsOpen && currentTrack ? (
          <LyricsOverlay
            open={lyricsOpen}
            onClose={() => setLyricsOpen(false)}
            track={currentTrack}
            playhead={playhead}
            isPlaying={isPlaying}
            onSeek={t => {
              setPlayhead(t);
              if (audioRef.current && currentTrack?.audioUrl) {
                audioRef.current.currentTime = t;
              }
              setIsPlaying(true);
            }}
            onTimedLyricsLoaded={onTimedLyricsLoaded}
          />
        ) : (
          <>
            {view === 'home' && (
              <Home
                tracks={tracks}
                playlists={playlists}
                credits={credits}
                isCreditsLoading={creditsLoading}
                isDataLoading={!hydrated}
                currentTrackId={currentTrack?.id}
                onPlay={playTrack}
                onGoLibrary={() => setView('library')}
                onGoPlaylists={() => setView('playlists')}
                onOpenPlaylist={openPlaylist}
                onGoCreate={() => setView('create')}
                onNewPlaylist={handleNewPlaylist}
              />
            )}

            {view === 'create' && createMode === 'advanced' && (
              <CreatePanel onStartBatch={handleStartBatch} onSwitchMode={setCreateMode} />
            )}
            {view === 'create' && createMode === 'simple' && (
              <SimplePanel onStartBatch={handleStartBatch} onSwitchMode={setCreateMode} />
            )}

            {view === 'generating' && (
              <GenerationView
                jobs={jobs}
                allTracks={batchTracks}
                totalCount={batchTotal}
                onCancel={handleCancelBatch}
                onDone={() => setView('library')}
              />
            )}

            {view === 'library' && (
              <Library
                tracks={tracks}
                playlists={playlists}
                currentTrackId={currentTrack?.id}
                onPlay={playTrack}
                onToggleFav={toggleFav}
                onDelete={deleteTrack}
                onDeleteMany={deleteTracks}
                onAddToPlaylist={addToPlaylist}
                onAddToQueue={addToQueue}
                onNewPlaylistWithTracks={handleNewPlaylistWithTracks}
              />
            )}

            {view === 'playlists' && (
              <PlaylistsPage
                playlists={playlists}
                tracks={tracks}
                onOpen={openPlaylist}
                onCreate={handleNewPlaylist}
                onDelete={deletePlaylist}
              />
            )}

            {view === 'playlist-detail' && activePlaylist && (
              <PlaylistDetailPage
                playlist={activePlaylist}
                tracks={tracks}
                currentTrackId={currentTrack?.id}
                onPlayPlaylist={playPlaylist}
                onPlayTrack={(t) => playTrack(t)}
                onRename={renamePlaylist}
                onDescribe={describePlaylist}
                onRemoveTrack={removeFromPlaylist}
                onReorder={reorderPlaylist}
                onDelete={deletePlaylist}
                onAddToQueue={addToQueue}
                onBack={() => setView('playlists')}
              />
            )}
          </>
        )}
      </main>

      {!noAside && (
        <Aside
          view={view}
          batchTracks={batchTracks}
          batchJobs={jobs}
          completed={isComplete}
          onPlay={playTrack}
          currentTrackId={currentTrack?.id}
          recentTracks={tracks.slice(0, 8)}
          onGoLibrary={() => setView('library')}
        />
      )}

      <Player
        track={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(p => !p)}
        playhead={playhead}
        onSeek={v => {
          setPlayhead(v);
          if (audioRef.current && currentTrack?.audioUrl) audioRef.current.currentTime = v;
        }}
        onPrev={handlePrev}
        onNext={handleNext}
        repeat={repeat}
        onRepeatToggle={() => setRepeat(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')}
        shuffle={shuffle}
        onShuffleToggle={() => setShuffle(s => !s)}
        volume={volume}
        onVolumeChange={setVolume}
        lyricsOpen={lyricsOpen}
        onToggleLyrics={() => setLyricsOpen(o => !o)}
      />

      <Toasts toasts={toasts} onDismiss={dismissToast} />

      <Tweaks
        open={tweaksOpen}
        onClose={() => setTweaksOpen(false)}
        accent={accent}
        setAccent={setAccent}
        fontPair={fontPair}
        setFontPair={setFontPair}
      />

      <PlaylistTitleModal
        open={plModalOpen}
        mode={plModalMode}
        initialTitle={plModalInitial}
        onCancel={() => { setPlModalOpen(false); setPlModalCallback(null); }}
        onSubmit={title => {
          setPlModalOpen(false);
          plModalCallback?.(title);
          setPlModalCallback(null);
        }}
      />

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="metadata" style={{ display: 'none' }} />
    </div>
  );
}

export default function Page() {
  return (
    <ConfirmProvider>
      <Studio />
    </ConfirmProvider>
  );
}
