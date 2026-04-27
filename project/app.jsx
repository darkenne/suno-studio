// app.jsx — main shell, routing between views, state

const { useState, useEffect, useRef, useMemo } = React;

// Briefly show scrollbars while any element is actively scrolling.
(function attachScrollIndicator() {
  if (window.__scrollIndicator) return;
  window.__scrollIndicator = true;
  const timers = new WeakMap();
  document.addEventListener("scroll", (e) => {
    const el = e.target;
    if (!el || !el.classList) return;
    el.classList.add("is-scrolling");
    const prev = timers.get(el);
    if (prev) clearTimeout(prev);
    timers.set(el, setTimeout(() => el.classList.remove("is-scrolling"), 900));
  }, true);
})();

function App() {
  // Core state
  const [view, setView] = useState("home"); // home | create | generating | library | playlists | playlist-detail
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [createMode, setCreateMode] = useState("simple"); // advanced | simple
  const [tracks, setTracks] = useState(window.MOCK_TRACKS);
  const [playlists, setPlaylists] = useState(() => window.seedPlaylists(window.MOCK_TRACKS));
  const [currentTrack, setCurrentTrack] = useState(window.MOCK_TRACKS[0]);
  const [activeContext, setActiveContext] = useState(null); // { kind: 'playlist'|'queue', id, order: [trackId], index, shuffle }
  const [queue, setQueue] = useState([]); // array of trackIds (temporary)
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);

  // Create-playlist modal state
  const [createModal, setCreateModal] = useState(null); // { trackIds?: string[], onCreated?: (pl) => void }

  // Pending undo for remove-from-playlist
  const undoTimersRef = useRef({});

  // Batch state
  const [batchJobs, setBatchJobs] = useState([]);
  const [batchTotal, setBatchTotal] = useState(0);
  const [batchTracks, setBatchTracks] = useState([]); // newly-rendered tracks
  const [toasts, setToasts] = useState([]);

  // Tweaks
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [accent, setAccent] = useState("lime");
  const [fontPair, setFontPair] = useState("mono-sans");

  // Fake playhead while playing
  useEffect(() => {
    if (!isPlaying || !currentTrack) return;
    const id = setInterval(() => {
      setPlayhead(p => {
        if (p >= currentTrack.duration) return 0;
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, currentTrack]);

  // Apply tweaks
  useEffect(() => {
    const root = document.documentElement;
    const accents = {
      lime:    { a: "oklch(0.88 0.22 130)", s: "oklch(0.88 0.22 130 / 0.14)", l: "oklch(0.88 0.22 130 / 0.45)" },
      amber:   { a: "oklch(0.83 0.18 70)",  s: "oklch(0.83 0.18 70 / 0.14)",  l: "oklch(0.83 0.18 70 / 0.45)" },
      cyan:    { a: "oklch(0.85 0.16 210)", s: "oklch(0.85 0.16 210 / 0.14)", l: "oklch(0.85 0.16 210 / 0.45)" },
      magenta: { a: "oklch(0.78 0.25 340)", s: "oklch(0.78 0.25 340 / 0.14)", l: "oklch(0.78 0.25 340 / 0.45)" },
      coral:   { a: "oklch(0.78 0.20 30)",  s: "oklch(0.78 0.20 30 / 0.14)",  l: "oklch(0.78 0.20 30 / 0.45)" },
    };
    const { a, s, l } = accents[accent] || accents.lime;
    root.style.setProperty("--accent", a);
    root.style.setProperty("--accent-soft", s);
    root.style.setProperty("--accent-line", l);

    const fonts = {
      "mono-sans": { sans: '"Inter Tight", system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' },
      "serif-mono": { sans: '"Fraunces", Georgia, serif', mono: '"JetBrains Mono", ui-monospace, monospace' },
      "grotesk-mono": { sans: '"Space Grotesk", system-ui, sans-serif', mono: '"IBM Plex Mono", ui-monospace, monospace' },
      "neue-mono": { sans: '"Inter Tight", system-ui, sans-serif', mono: '"IBM Plex Mono", ui-monospace, monospace' },
    };
    const f = fonts[fontPair] || fonts["mono-sans"];
    root.style.setProperty("--sans", f.sans);
    root.style.setProperty("--mono", f.mono);
  }, [accent, fontPair]);

  // Edit mode protocol
  useEffect(() => {
    const handler = (e) => {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  const pushToast = (msg, kind = "ok") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };

  // Batch simulation — mirrors useBatchGenerate polling
  const batchTimersRef = useRef([]);
  const clearBatchTimers = () => {
    batchTimersRef.current.forEach(t => clearTimeout(t));
    batchTimersRef.current = [];
  };

  const startBatch = (formValues) => {
    clearBatchTimers();

    const apiCalls = Math.ceil(formValues.count / 2);
    const jobs = [];
    for (let i = 0; i < apiCalls; i++) {
      const isLast = i === apiCalls - 1;
      const targetCount = (isLast && formValues.count % 2 === 1) ? 1 : 2;
      jobs.push({
        taskId: "tk_" + Math.random().toString(36).slice(2, 8),
        targetCount,
        status: "PENDING",
        statusMessage: "Queued",
        tracks: [],
        savedTracks: [],
        error: null,
        promptIndex: i,
        startedAt: Date.now(),
      });
    }

    setBatchJobs(jobs);
    setBatchTotal(formValues.count);
    setBatchTracks([]);
    setView("create");

    // Simulate progression for each job
    jobs.forEach((job, idx) => {
      const baseDelay = 600 + Math.random() * 1200;
      const textT = setTimeout(() => {
        setBatchJobs(js => js.map(j => j.taskId === job.taskId ? { ...j, status: "TEXT", statusMessage: "Writing lyrics" } : j));
      }, baseDelay + 1000);
      const firstT = setTimeout(() => {
        setBatchJobs(js => js.map(j => j.taskId === job.taskId ? { ...j, status: "FIRST", statusMessage: "Creating audio" } : j));
      }, baseDelay + 3000);
      const successT = setTimeout(() => {
        const failChance = Math.random() < 0.06 && idx > 0;
        if (failChance) {
          setBatchJobs(js => js.map(j => j.taskId === job.taskId ? { ...j, status: "FAILED", statusMessage: "Create failed" } : j));
          pushToast(`Request ${job.taskId.slice(-4)} failed — will retry on next run`, "err");
          return;
        }
        const newTracks = generateMockTracks(formValues, job.targetCount, job.taskId, idx);
        setBatchJobs(js => js.map(j => j.taskId === job.taskId ? { ...j, status: "SUCCESS", statusMessage: "Saved", savedTracks: newTracks } : j));
        setBatchTracks(prev => {
          const existing = new Set(prev.map(t => t.id));
          return [...prev, ...newTracks.filter(t => !existing.has(t.id))];
        });
        setTracks(prev => [...newTracks, ...prev]);
        newTracks.forEach(t => pushToast(`"${t.title}" saved to library`));
      }, baseDelay + 5500 + idx * 1200);
      batchTimersRef.current.push(textT, firstT, successT);
    });
  };

  const cancelBatch = () => {
    clearBatchTimers();
    setBatchJobs([]);
    setBatchTotal(0);
    setBatchTracks([]);
    pushToast("Run stopped", "err");
  };

  const clearBatch = () => {
    setBatchJobs([]);
    setBatchTotal(0);
    setBatchTracks([]);
  };

  useEffect(() => () => clearBatchTimers(), []);

  const playTrack = (t) => {
    setCurrentTrack(t);
    setPlayhead(0);
    setIsPlaying(true);
  };

  const toggleFav = (id) => {
    setTracks(ts => ts.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  const deleteTrack = (id) => {
    setTracks(ts => ts.filter(t => t.id !== id));
    setPlaylists(pls => pls.map(p => ({ ...p, tracks: p.tracks.filter(pt => pt.trackId !== id) })));
    pushToast("Track removed");
  };

  // ---- Playlists ----
  const openPlaylist = (id) => { setActivePlaylistId(id); setView("playlist-detail"); };

  const createPlaylist = (title, trackIds = []) => {
    const id = "pl_" + Math.random().toString(36).slice(2, 8);
    const pl = {
      id, title, description: "",
      createdAt: new Date().toISOString(),
      tracks: trackIds.map((tid, i) => ({ trackId: tid, position: i, addedAt: new Date().toISOString() })),
    };
    setPlaylists(pls => [...pls, pl]);
    return pl;
  };

  const addTracksToPlaylist = (playlistId, trackIds) => {
    let added = 0, skipped = 0;
    setPlaylists(pls => pls.map(p => {
      if (p.id !== playlistId) return p;
      const existing = new Set(p.tracks.map(pt => pt.trackId));
      const next = [...p.tracks];
      trackIds.forEach(tid => {
        if (existing.has(tid)) { skipped++; return; }
        next.push({ trackId: tid, position: next.length, addedAt: new Date().toISOString() });
        added++;
      });
      return { ...p, tracks: next };
    }));
    const pl = playlists.find(p => p.id === playlistId);
    const name = pl ? pl.title : "playlist";

    if (added > 0) {
      const id = Date.now() + Math.random();
      const msg = skipped > 0
        ? `${added} added to "${name}" · ${skipped} already there`
        : `${added} track${added === 1 ? "" : "s"} added to "${name}"`;
      setToasts(t => [...t, {
        id, msg, kind: "ok",
        action: {
          label: "View",
          fn: () => {
            openPlaylist(playlistId);
            setToasts(ts => ts.filter(x => x.id !== id));
          },
        },
      }]);
      setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 5000);
    } else if (skipped > 0) {
      pushToast(`All ${skipped} track${skipped === 1 ? "" : "s"} already in "${name}"`, "err");
    }
  };

  const removeTrackFromPlaylist = (playlistId, trackId) => {
    const pl = playlists.find(p => p.id === playlistId);
    const removed = pl?.tracks.find(pt => pt.trackId === trackId);
    if (!removed) return;
    setPlaylists(pls => pls.map(p => p.id !== playlistId ? p : {
      ...p,
      tracks: p.tracks.filter(pt => pt.trackId !== trackId).map((pt, i) => ({ ...pt, position: i })),
    }));
    const undoId = Date.now() + Math.random();
    setToasts(t => [...t, {
      id: undoId, msg: "Removed from playlist", kind: "ok",
      action: {
        label: "Undo",
        fn: () => {
          setPlaylists(pls => pls.map(p => p.id !== playlistId ? p : {
            ...p,
            tracks: [...p.tracks.slice(0, removed.position), removed, ...p.tracks.slice(removed.position)]
              .map((pt, i) => ({ ...pt, position: i })),
          }));
          setToasts(ts => ts.filter(x => x.id !== undoId));
        },
      },
    }]);
    const h = setTimeout(() => setToasts(ts => ts.filter(x => x.id !== undoId)), 5000);
    undoTimersRef.current[undoId] = h;
  };

  const renamePlaylist = (id, title) => setPlaylists(pls => pls.map(p => p.id === id ? { ...p, title } : p));
  const describePlaylist = (id, description) => setPlaylists(pls => pls.map(p => p.id === id ? { ...p, description } : p));

  const reorderPlaylist = (id, trackIdOrder) => {
    setPlaylists(pls => pls.map(p => {
      if (p.id !== id) return p;
      const map = new Map(p.tracks.map(pt => [pt.trackId, pt]));
      const next = trackIdOrder.map((tid, i) => ({ ...(map.get(tid) || { trackId: tid, addedAt: new Date().toISOString() }), position: i }));
      return { ...p, tracks: next };
    }));
  };

  const deletePlaylist = (id) => {
    setPlaylists(pls => pls.filter(p => p.id !== id));
    if (activePlaylistId === id) { setActivePlaylistId(null); setView("playlists"); }
    pushToast("Playlist deleted");
  };

  const addToQueue = (trackId) => {
    setQueue(q => [...q, trackId]);
    pushToast("Added to queue");
  };

  // ---- Playback context / playlist play ----
  const playPlaylist = (playlistId, shuffle) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl || pl.tracks.length === 0) return;
    const order = pl.tracks.slice().sort((a, b) => a.position - b.position).map(pt => pt.trackId);
    const shuffled = shuffle ? order.slice().sort(() => Math.random() - 0.5) : order;
    setActiveContext({ kind: "playlist", id: playlistId, order: shuffled, index: 0, shuffle });
    const firstId = shuffled[0];
    const t = tracks.find(x => x.id === firstId);
    if (t) { setCurrentTrack(t); setPlayhead(0); setIsPlaying(true); }
  };

  const playTrackInPlaylist = (track, playlistId) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) { playTrack(track); return; }
    const order = pl.tracks.slice().sort((a, b) => a.position - b.position).map(pt => pt.trackId);
    const idx = order.indexOf(track.id);
    setActiveContext({ kind: "playlist", id: playlistId, order, index: Math.max(0, idx), shuffle: false });
    setCurrentTrack(track);
    setPlayhead(0);
    setIsPlaying(true);
  };

  // Auto-advance when a track ends in a playlist context
  useEffect(() => {
    if (!currentTrack) return;
    if (playhead < currentTrack.duration) return;
    if (!activeContext || activeContext.kind !== "playlist") return;
    const nextIdx = activeContext.index + 1;
    if (nextIdx >= activeContext.order.length) { setIsPlaying(false); return; }
    const nextId = activeContext.order[nextIdx];
    const nextTrack = tracks.find(t => t.id === nextId);
    if (nextTrack) {
      setActiveContext(ac => ({ ...ac, index: nextIdx }));
      setCurrentTrack(nextTrack);
      setPlayhead(0);
    }
  }, [playhead, currentTrack, activeContext, tracks]);

  const activePlaylist = activeContext?.kind === "playlist" ? playlists.find(p => p.id === activeContext.id) : null;

  const completedBatch = batchJobs.length > 0 && batchJobs.every(j => j.status === "SUCCESS" || j.status === "FAILED");

  const hideAside = view === "playlists" || view === "playlist-detail" || view === "library";

  return (
    <div className={"app" + (hideAside ? " no-aside" : "")}>
      <TopBar view={view} batchJobs={batchJobs} batchTotal={batchTotal} savedCount={batchTracks.length} />

      <Nav
        view={view}
        onNav={(v) => { setView(v); setLyricsOpen(false); if (v !== "playlist-detail") setActivePlaylistId(null); }}
        onOpenPlaylist={(id) => { setLyricsOpen(false); openPlaylist(id); }}
        onNewPlaylist={() => setCreateModal({})}
        activePlaylistId={activePlaylistId}
        playlists={playlists}
        trackCount={tracks.length}
        favCount={tracks.filter(t => t.isFavorite).length}
        runningCount={batchJobs.filter(j => j.status !== "SUCCESS" && j.status !== "FAILED").length}
      />

      {lyricsOpen ? (
        <LyricsOverlay
          open={lyricsOpen}
          onClose={() => setLyricsOpen(false)}
          track={currentTrack}
          playhead={playhead}
          isPlaying={isPlaying}
          onSeek={(t) => { setPlayhead(t); setIsPlaying(true); }}
        />
      ) : (
        <React.Fragment>
      {view === "home" && (
        <Home
          tracks={tracks}
          playlists={playlists}
          credits={{ used: 153, total: 1000, remaining: 847 }}
          currentTrackId={currentTrack?.id}
          onPlay={playTrack}
          onGoLibrary={() => setView("library")}
          onGoPlaylists={() => setView("playlists")}
          onOpenPlaylist={openPlaylist}
          onGoCreate={() => setView("create")}
          onNewPlaylist={() => setCreateModal({})}
        />
      )}
      {view === "create" && batchJobs.length === 0 && createMode === "advanced" && (
        <CreatePanel onStartBatch={startBatch} onSwitchMode={setCreateMode} />
      )}
      {view === "create" && batchJobs.length === 0 && createMode === "simple" && (
        <SimplePanel onStartBatch={startBatch} onSwitchMode={setCreateMode} />
      )}
      {view === "create" && batchJobs.length > 0 && (
        <GenerationView
          jobs={batchJobs}
          allTracks={batchTracks}
          totalCount={batchTotal}
          onCancel={cancelBatch}
          onDone={() => { clearBatch(); setView("library"); }}
        />
      )}
      {view === "library" && (
        <Library
          tracks={tracks}
          playlists={playlists}
          currentTrackId={currentTrack?.id}
          onPlay={playTrack}
          onToggleFav={toggleFav}
          onDelete={deleteTrack}
          onAddToPlaylist={addTracksToPlaylist}
          onAddToQueue={addToQueue}
          onNewPlaylistWithTracks={(trackIds) => setCreateModal({ trackIds })}
        />
      )}
      {view === "playlists" && (
        <PlaylistsPage
          playlists={playlists}
          tracks={tracks}
          onOpen={openPlaylist}
          onCreate={() => setCreateModal({})}
          onDelete={deletePlaylist}
        />
      )}
      {view === "playlist-detail" && activePlaylistId && (() => {
        const pl = playlists.find(p => p.id === activePlaylistId);
        if (!pl) { return <PlaylistsPage playlists={playlists} tracks={tracks} onOpen={openPlaylist} onCreate={() => setCreateModal({})} onDelete={deletePlaylist} />; }
        return (
          <PlaylistDetailPage
            playlist={pl}
            tracks={tracks}
            currentTrackId={currentTrack?.id}
            onPlayPlaylist={playPlaylist}
            onPlayTrack={playTrackInPlaylist}
            onRename={renamePlaylist}
            onDescribe={describePlaylist}
            onRemoveTrack={removeTrackFromPlaylist}
            onReorder={reorderPlaylist}
            onDelete={deletePlaylist}
            onAddToQueue={addToQueue}
            onBack={() => { setActivePlaylistId(null); setView("playlists"); }}
          />
        );
      })()}
        </React.Fragment>
      )}

      {!hideAside && (
        <Aside
          view={view}
          batchTracks={batchTracks}
          batchJobs={batchJobs}
          completed={completedBatch}
          onPlay={playTrack}
          currentTrackId={currentTrack?.id}
          recentTracks={tracks.slice(0, 8)}
          onGoLibrary={() => setView("library")}
        />
      )}

      <Player
        track={currentTrack}
        contextLabel={activePlaylist ? activePlaylist.title : null}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(p => !p)}
        playhead={playhead}
        onSeek={setPlayhead}
        onPrev={() => {
          if (!activeContext || activeContext.kind !== "playlist") return;
          const idx = Math.max(0, activeContext.index - 1);
          const id = activeContext.order[idx];
          const t = tracks.find(x => x.id === id);
          if (t) { setActiveContext(ac => ({ ...ac, index: idx })); setCurrentTrack(t); setPlayhead(0); }
        }}
        onNext={() => {
          if (!activeContext || activeContext.kind !== "playlist") return;
          const idx = Math.min(activeContext.order.length - 1, activeContext.index + 1);
          const id = activeContext.order[idx];
          const t = tracks.find(x => x.id === id);
          if (t) { setActiveContext(ac => ({ ...ac, index: idx })); setCurrentTrack(t); setPlayhead(0); }
        }}
        shuffle={!!activeContext?.shuffle}
        lyricsOpen={lyricsOpen}
        onToggleLyrics={() => setLyricsOpen(o => !o)}
        onToggleShuffle={() => {
          if (!activeContext) return;
          setActiveContext(ac => {
            const newShuffle = !ac.shuffle;
            const base = playlists.find(p => p.id === ac.id);
            if (!base) return ac;
            const ordered = base.tracks.slice().sort((a, b) => a.position - b.position).map(pt => pt.trackId);
            const next = newShuffle ? ordered.slice().sort(() => Math.random() - 0.5) : ordered;
            return { ...ac, order: next, index: Math.max(0, next.indexOf(currentTrack?.id)), shuffle: newShuffle };
          });
        }}
      />
      <Toasts toasts={toasts} />

      <PlaylistTitleModal
        open={!!createModal}
        initialTitle="Untitled"
        mode="create"
        onCancel={() => setCreateModal(null)}
        onSubmit={(title) => {
          const trackIds = createModal?.trackIds || [];
          const pl = createPlaylist(title, trackIds);
          setCreateModal(null);
          if (trackIds.length > 0) {
            pushToast(`"${pl.title}" created · ${trackIds.length} track${trackIds.length === 1 ? "" : "s"} added`);
          } else {
            pushToast(`"${pl.title}" created`);
            openPlaylist(pl.id);
          }
        }}
      />

      <Tweaks
        open={tweaksOpen}
        onClose={() => setTweaksOpen(false)}
        accent={accent}
        setAccent={setAccent}
        fontPair={fontPair}
        setFontPair={setFontPair}
      />
    </div>
  );
}

function generateMockTracks(values, count, taskId, promptIndex) {
  const palettes = [
    ["#d4e85c", "#1d2a14", "#6a7a3a"],
    ["#c7a8ff", "#1a1428", "#5a4890"],
    ["#ff8fa8", "#281418", "#a03a58"],
    ["#5ce8ff", "#141a28", "#3a90a0"],
    ["#e8c25c", "#2a2414", "#8a7a3a"],
    ["#ff5ce8", "#14142a", "#a03a90"],
  ];
  const titles = [
    "Unfinished Summer", "Half-Lit Rooms", "Tremolo at Dawn",
    "Gutter Stars", "Cathode Hymn", "Quiet Receiver",
    "Paperbag Moon", "Tin Cup Radio", "Salt Lamp Waltz",
    "Overcast Parade", "Morse, Slow", "Wax and Static"
  ];
  const sourcePrompt = values.promptMode === "multi"
    ? (values.prompts[promptIndex % values.prompts.length] || values.prompts[0])
    : { title: values.title, style: values.style };

  const out = [];
  for (let i = 0; i < count; i++) {
    const pIdx = (promptIndex * 2 + i) % palettes.length;
    const tIdx = (promptIndex * 2 + i) % titles.length;
    out.push({
      id: `nt_${taskId}_${i}`,
      sunoId: `suno_${Math.random().toString(36).slice(2, 8)}`,
      taskId,
      title: titles[tIdx] + (values.promptMode === "multi" ? "" : ""),
      prompt: sourcePrompt.style || values.style || values.description || "",
      tags: (sourcePrompt.style || values.style || "generated").slice(0, 60),
      duration: 150 + Math.floor(Math.random() * 120),
      mode: "advanced",
      promptMode: values.promptMode,
      model: values.model,
      instrumental: values.vocalType === "instrumental",
      isFavorite: false,
      vocalGender: values.vocalGender,
      createdAt: new Date().toISOString(),
      palette: palettes[pIdx],
      fresh: true,
    });
  }
  return out;
}

window.App = App;
