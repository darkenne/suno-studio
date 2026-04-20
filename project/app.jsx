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
  const [view, setView] = useState("create"); // create | generating | library
  const [createMode, setCreateMode] = useState("simple"); // advanced | simple
  const [tracks, setTracks] = useState(window.MOCK_TRACKS);
  const [currentTrack, setCurrentTrack] = useState(window.MOCK_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);

  // Batch state
  const [batchJobs, setBatchJobs] = useState([]);
  const [batchTotal, setBatchTotal] = useState(0);
  const [batchTracks, setBatchTracks] = useState([]); // newly-rendered tracks
  const [toasts, setToasts] = useState([]);

  // Tweaks
  const [tweaksOpen, setTweaksOpen] = useState(false);
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
    setView("generating");

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
    setBatchJobs(jobs => jobs.map(j => j.status === "SUCCESS" || j.status === "FAILED" ? j : { ...j, status: "FAILED", statusMessage: "Canceled" }));
    pushToast("Run stopped", "err");
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
    pushToast("Track removed");
  };

  const completedBatch = batchJobs.length > 0 && batchJobs.every(j => j.status === "SUCCESS" || j.status === "FAILED");

  return (
    <div className="app">
      <TopBar view={view} batchJobs={batchJobs} batchTotal={batchTotal} savedCount={batchTracks.length} />

      <Nav
        view={view}
        onNav={setView}
        trackCount={tracks.length}
        favCount={tracks.filter(t => t.isFavorite).length}
        runningCount={batchJobs.filter(j => j.status !== "SUCCESS" && j.status !== "FAILED").length}
      />

      {view === "create" && createMode === "advanced" && (
        <CreatePanel onStartBatch={startBatch} onSwitchMode={setCreateMode} />
      )}
      {view === "create" && createMode === "simple" && (
        <SimplePanel onStartBatch={startBatch} onSwitchMode={setCreateMode} />
      )}
      {view === "generating" && (
        <GenerationView
          jobs={batchJobs}
          allTracks={batchTracks}
          totalCount={batchTotal}
          onCancel={cancelBatch}
          onDone={() => setView("library")}
        />
      )}
      {view === "library" && (
        <Library
          tracks={tracks}
          currentTrackId={currentTrack?.id}
          onPlay={playTrack}
          onToggleFav={toggleFav}
          onDelete={deleteTrack}
        />
      )}

      <Aside
        view={view}
        batchTracks={batchTracks}
        batchJobs={batchJobs}
        completed={completedBatch}
        onPlay={playTrack}
        currentTrackId={currentTrack?.id}
        recentTracks={tracks.slice(0, 8)}
      />

      <Player
        track={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(p => !p)}
        playhead={playhead}
        onSeek={setPlayhead}
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
