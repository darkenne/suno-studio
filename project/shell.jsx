// shell.jsx — top bar, nav, aside, player, tweaks

function TopBar({ view, batchJobs, batchTotal, savedCount }) {
  const running = batchJobs.filter(j => j.status !== "SUCCESS" && j.status !== "FAILED").length;
  const isGenerating = running > 0;

  return (
    <div className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div className="brand">
          <div className="brand-mark" />
          <span>SUNO<span style={{ color: "var(--fg-3)", margin: "0 4px" }}>/</span>STUDIO</span>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--fg-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Workspace · <span style={{ color: "var(--fg-1)" }}>Untitled Session</span>
        </div>
      </div>

      <div className="top-status">
        {isGenerating ? (
          <span><span className="dot" />CREATING · {savedCount}/{batchTotal}</span>
        ) : (
          <span><span className="dot" style={{ background: "var(--fg-2)", boxShadow: "none" }} />READY</span>
        )}
        <span>SUNO<span className="dot" style={{ marginLeft: 8, marginRight: 6 }} />CONNECTED</span>
        <span>QUOTA <span className="tnum" style={{ color: "var(--fg-1)", margin: "0 4px" }}>847</span> / 1000</span>
      </div>
    </div>
  );
}

function Nav({ view, onNav, trackCount, favCount, runningCount }) {
  const item = (key, label, badge) => (
    <button className={"nav-item" + (view === key ? " active" : "")} onClick={() => onNav(key)}>
      <span>{label}</span>
      {badge != null && <span className="badge tnum">{badge}</span>}
    </button>
  );

  return (
    <nav className="nav">
      <div className="nav-sec">Workspace</div>
      {item("create", "Create", null)}
      {item("generating", "Generating", runningCount || null)}
      {item("library", "Library", trackCount)}

      <div className="nav-sec">Collections</div>
      <button className="nav-item"><span>Favorites</span><span className="badge tnum">{favCount}</span></button>
      <button className="nav-item"><span>Recent</span><span className="badge">24h</span></button>
      <button className="nav-item"><span>Instrumentals</span></button>

      <div className="nav-sec">Presets</div>
      <button className="nav-item"><span>Lo-fi Study</span></button>
      <button className="nav-item"><span>Dream-pop</span></button>
      <button className="nav-item"><span>Ambient Drone</span></button>
      <button className="nav-item"><span>+ New Preset</span></button>

      <div className="nav-foot">
        v0.4.2 · Suno V5.5<br/>
        Next.js 14 · SQLite<br/>
        <span style={{ color: "var(--accent)" }}>●</span> sunoapi.org
      </div>
    </nav>
  );
}

function Aside({ view, batchTracks, batchJobs, completed, onPlay, currentTrackId, recentTracks }) {
  const showBatch = view === "generating" && (batchTracks.length > 0 || batchJobs.some(j => j.status !== "SUCCESS" && j.status !== "FAILED"));
  const pendingJobs = batchJobs.filter(j => j.status !== "SUCCESS" && j.status !== "FAILED");

  if (showBatch) {
    return (
      <div className="aside">
        <div className="aside-head">
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 6 }}>Live Results</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--fg-2)" }}>
              {batchTracks.length} ready · {pendingJobs.length} creating
            </div>
          </div>
          <div className="mono uc" style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.14em" }}>
            {completed ? "DONE" : "LIVE"}
          </div>
        </div>
        <div className="aside-body scroll">
          {pendingJobs.map(j => (
            <div key={j.taskId} className="result-card" style={{ borderColor: "var(--line)" }}>
              <div className="rc-cover" style={{ background: "var(--bg-3)", display: "grid", placeItems: "center" }}>
                <Waveform state="pending" seed={hash(j.taskId)} bars={10} height={28} />
              </div>
              <div className="rc-body">
                <div className="rc-title" style={{ color: "var(--fg-2)" }}>Creating...</div>
                <div className="rc-sub">{j.taskId} · {j.statusMessage}</div>
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--warn)", letterSpacing: "0.08em" }}>
                {j.status}
              </div>
            </div>
          ))}
          {batchTracks.map(t => (
            <div
              key={t.id}
              className={"result-card" + (t.fresh ? " fresh" : "")}
              onClick={() => onPlay(t)}
              style={{ cursor: "pointer" }}
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
    <div className="aside">
      <div className="aside-head">
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 6 }}>Recent</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--fg-2)" }}>
            Last 24 hours
          </div>
        </div>
        <button className="mono" style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          See all →
        </button>
      </div>
      <div className="aside-body scroll">
        {recentTracks.map(t => (
          <div
            key={t.id}
            className="result-card"
            onClick={() => onPlay(t)}
            style={{ cursor: "pointer", borderColor: t.id === currentTrackId ? "var(--accent-line)" : "var(--line)" }}
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

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function Player({ track, isPlaying, onPlayPause, playhead, onSeek }) {
  if (!track) {
    return <div className="player"><div /><div className="empty">No track loaded</div><div /></div>;
  }
  const pct = (playhead / track.duration) * 100;
  const onBarClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    onSeek(Math.max(0, Math.min(track.duration, x * track.duration)));
  };

  return (
    <div className="player">
      <div className="player-track-info">
        <div className="cover" style={{ width: 44, height: 44, borderRadius: 2, overflow: "hidden" }}>
          <Cover track={track} size={44} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="title">{track.title}</div>
          <div className="sub">{track.tags.split(",")[0]} · {track.model}</div>
        </div>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button title="Shuffle" style={{ color: "var(--fg-3)", fontSize: 14 }}>⇄</button>
          <button title="Previous" style={{ fontSize: 16 }}>⏮</button>
          <button className="play" onClick={onPlayPause} title={isPlaying ? "Pause" : "Play"}>
            <span style={{ fontSize: 11 }}>{isPlaying ? "❚❚" : "▶"}</span>
          </button>
          <button title="Next" style={{ fontSize: 16 }}>⏭</button>
          <button title="Repeat" style={{ color: "var(--fg-3)", fontSize: 14 }}>↻</button>
        </div>
        <div className="player-bar-wrap">
          <span className="tnum">{formatTime(playhead)}</span>
          <div className="player-bar" onClick={onBarClick} style={{ cursor: "pointer" }}>
            <div className="fill" style={{ width: `${pct}%` }} />
            <div className="head" style={{ left: `${pct}%` }} />
          </div>
          <span className="tnum" style={{ color: "var(--fg-3)" }}>{formatTime(track.duration)}</span>
        </div>
      </div>

      <div className="player-right">
        <button className="mono" style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Lyrics</button>
        <button className="mono" style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Stems</button>
        <button className="mono" style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>↓ WAV</button>
        <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>VOL</div>
        <div style={{ width: 72, height: 3, background: "var(--bg-3)", position: "relative" }}>
          <div style={{ position: "absolute", inset: "0 30% 0 0", background: "var(--fg-2)" }} />
        </div>
      </div>
    </div>
  );
}

function Tweaks({ open, onClose, accent, setAccent, fontPair, setFontPair }) {
  const swatches = [
    { key: "lime",    color: "oklch(0.88 0.22 130)" },
    { key: "amber",   color: "oklch(0.83 0.18 70)" },
    { key: "cyan",    color: "oklch(0.85 0.16 210)" },
    { key: "magenta", color: "oklch(0.78 0.25 340)" },
    { key: "coral",   color: "oklch(0.78 0.20 30)" },
  ];

  const persist = (patch) => {
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: patch }, "*");
  };

  return (
    <div className={"tweaks" + (open ? " on" : "")}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Tweaks</h3>
        <button onClick={onClose} style={{ color: "var(--fg-3)", fontSize: 14 }}>×</button>
      </div>
      <div>
        <div className="label" style={{ marginBottom: 8 }}><span>Accent</span></div>
        <div className="swatches">
          {swatches.map(s => (
            <button
              key={s.key}
              className={"swatch" + (accent === s.key ? " on" : "")}
              style={{ background: s.color }}
              onClick={() => { setAccent(s.key); persist({ accent: s.key }); }}
              title={s.key}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="label" style={{ marginBottom: 8 }}><span>Font Pairing</span></div>
        <Select
          value={fontPair}
          onChange={(v) => { setFontPair(v); persist({ fontPair: v }); }}
          options={[
            { value: "mono-sans", label: "Inter Tight + JetBrains Mono" },
            { value: "serif-mono", label: "Fraunces + JetBrains Mono" },
            { value: "grotesk-mono", label: "Space Grotesk + IBM Plex Mono" },
            { value: "neue-mono", label: "Inter Tight + IBM Plex Mono" },
          ]}
        />
      </div>
      <div className="hint" style={{ marginTop: 4 }}>
        Changes persist on reload.
      </div>
    </div>
  );
}

Object.assign(window, { TopBar, Nav, Aside, Player, Tweaks });
