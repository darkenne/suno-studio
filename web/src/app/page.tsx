'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AccentKey, AdvancedFormValues, CreateMode, FontPair, RepeatMode, Track, View } from '@/types';
import { MOCK_TRACKS } from '@/lib/data';
import { ConfirmProvider } from '@/hooks/useConfirm';
import { useBatch } from '@/hooks/useBatch';
import { useToasts } from '@/hooks/useToasts';
import { TopBar } from '@/components/shell/TopBar';
import { Nav } from '@/components/shell/Nav';
import { Aside } from '@/components/shell/Aside';
import { Player } from '@/components/shell/Player';
import { Tweaks } from '@/components/shell/Tweaks';
import { CreatePanel } from '@/components/create/CreatePanel';
import { SimplePanel } from '@/components/create/SimplePanel';
import { GenerationView } from '@/components/generation/GenerationView';
import { Library } from '@/components/library/Library';
import { Toasts } from '@/components/ui/Toasts';
import s from '@/components/shell/Shell.module.css';

const STORAGE_KEY = 'suno_tracks';

function Studio() {
  const [view, setView]             = useState<View>('create');
  const [createMode, setCreateMode] = useState<CreateMode>('simple');
  const [tracks, setTracks]         = useState<Track[]>(MOCK_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(MOCK_TRACKS[0] ?? null);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [playhead, setPlayhead]     = useState(0);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [accent, setAccent]         = useState<AccentKey>('lime');
  const [fontPair, setFontPair]     = useState<FontPair>('mono-sans');
  const [repeat, setRepeat]         = useState<RepeatMode>('off');
  const [shuffle, setShuffle]       = useState(false);
  const [volume, setVolume]         = useState(0.8);
  const [hydrated, setHydrated]     = useState(false);

  const { toasts, push: pushToast } = useToasts();
  const { jobs, batchTotal, batchTracks, isComplete, startBatch, cancelBatch } = useBatch();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load persisted tracks from localStorage after mount (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Track[];
        if (parsed.length > 0) {
          setTracks(parsed);
          setCurrentTrack(parsed[0] ?? null);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist tracks — only after localStorage has been loaded (prevents overwriting on first render)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    } catch {}
  }, [tracks, hydrated]);

  // Sync audio src when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = currentTrack?.audioUrl ?? currentTrack?.streamAudioUrl ?? '';
    if (audio.src !== url) {
      audio.src = url;
      audio.load();
    }
  }, [currentTrack]);

  // Sync play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Apply volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Stable ref so the ended listener always calls the latest handleNext
  const handleNextRef = useRef<() => void>(() => {});

  // Sync playhead from audio + ended → advance to next track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setPlayhead(audio.currentTime);
    const onEnded = () => handleNextRef.current();
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Simulated playhead tick — only used for mock tracks without audioUrl
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

  // Apply design-system tweaks
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
      'mono-sans':    ['"Inter Tight", system-ui, sans-serif', '"JetBrains Mono", ui-monospace, monospace'],
      'serif-mono':   ['"Fraunces", Georgia, serif',           '"JetBrains Mono", ui-monospace, monospace'],
      'grotesk-mono': ['"Space Grotesk", system-ui, sans-serif','IBM Plex Mono", ui-monospace, monospace'],
      'neue-mono':    ['"Inter Tight", system-ui, sans-serif', '"IBM Plex Mono", ui-monospace, monospace'],
    };
    const [sans, mono] = fonts[fontPair];
    root.style.setProperty('--sans', sans);
    root.style.setProperty('--mono', mono);
  }, [fontPair]);

  // Show scrollbars briefly while scrolling
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

  const playTrack = useCallback((t: Track) => {
    setCurrentTrack(t);
    setPlayhead(0);
    setIsPlaying(true);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, []);

  const handleNext = useCallback(() => {
    if (!tracks.length) return;
    if (repeat === 'one' && currentTrack) {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
      setPlayhead(0);
      return;
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
    if (next) playTrack(next);
    else { setIsPlaying(false); setPlayhead(0); }
  }, [tracks, currentTrack, repeat, shuffle, playTrack]);

  const handlePrev = useCallback(() => {
    // If more than 3 seconds in, restart current track
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
    if (prev) playTrack(prev);
    else { setPlayhead(0); if (audioRef.current) audioRef.current.currentTime = 0; }
  }, [tracks, currentTrack, repeat, shuffle, playhead, playTrack]);

  // Keep ended handler ref up to date
  useEffect(() => { handleNextRef.current = handleNext; }, [handleNext]);

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

  const toggleFav = (id: string) => {
    setTracks(ts => ts.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  const deleteTrack = (id: string) => {
    setTracks(ts => ts.filter(t => t.id !== id));
    pushToast('Track removed');
  };

  const runningCount = jobs.filter(j => j.status !== 'SUCCESS' && j.status !== 'FAILED').length;

  return (
    <div className={s.app}>
      <TopBar batchJobs={jobs} batchTotal={batchTotal} savedCount={batchTracks.length} />

      <Nav
        view={view}
        onNav={setView}
        trackCount={tracks.length}
        favCount={tracks.filter(t => t.isFavorite).length}
        runningCount={runningCount}
      />

      <main className={`${s.main} scroll`}>
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
            currentTrackId={currentTrack?.id}
            onPlay={playTrack}
            onToggleFav={toggleFav}
            onDelete={deleteTrack}
          />
        )}
      </main>

      <Aside
        view={view}
        batchTracks={batchTracks}
        batchJobs={jobs}
        completed={isComplete}
        onPlay={playTrack}
        currentTrackId={currentTrack?.id}
        recentTracks={tracks.slice(0, 8)}
      />

      <Player
        track={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(p => !p)}
        playhead={playhead}
        onSeek={v => {
          setPlayhead(v);
          if (audioRef.current && currentTrack?.audioUrl) {
            audioRef.current.currentTime = v;
          }
        }}
        onPrev={handlePrev}
        onNext={handleNext}
        repeat={repeat}
        onRepeatToggle={() => setRepeat(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')}
        shuffle={shuffle}
        onShuffleToggle={() => setShuffle(s => !s)}
        volume={volume}
        onVolumeChange={setVolume}
      />

      <Toasts toasts={toasts} />

      <Tweaks
        open={tweaksOpen}
        onClose={() => setTweaksOpen(false)}
        accent={accent}
        setAccent={setAccent}
        fontPair={fontPair}
        setFontPair={setFontPair}
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
