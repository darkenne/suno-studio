// shell.jsx — top bar, nav, aside, player, tweaks

function TopBar({ view, batchJobs, batchTotal, savedCount }) {
  const running = batchJobs.filter(j => j.status !== "SUCCESS" && j.status !== "FAILED").length;
  const isGenerating = running > 0;

  return (
    <div className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div className="brand">
          <div className="brand-mark" />
          <span>REEL</span>
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
        <span><span className="dot" style={{ marginRight: 6 }} />CONNECTED</span>
        <span>CREDITS <span className="tnum" style={{ color: "var(--fg-1)", margin: "0 4px" }}>847</span> / 1000</span>
      </div>
    </div>
  );
}

function Nav({ view, onNav, onOpenPlaylist, onNewPlaylist, activePlaylistId, playlists, trackCount, favCount, runningCount }) {
  const [plExpanded, setPlExpanded] = React.useState(true);

  const item = (key, label, badge) => (
    <button className={"nav-item" + (view === key ? " active" : "")} onClick={() => onNav(key)}>
      <span>{label}</span>
      {badge != null && <span className="badge tnum">{badge}</span>}
    </button>
  );

  return (
    <nav className="nav">
      <button className={"nav-item nav-home" + (view === "home" ? " active" : "")} onClick={() => onNav("home")}>
        <span>Home</span>
      </button>

      {item("create", "Create", runningCount || null)}
      {item("library", "Library", trackCount)}

      <button
        className={"nav-item nav-accordion" + (view === "playlists" ? " active" : "")}
        onClick={() => { onNav("playlists"); setPlExpanded(true); }}
      >
        <span>Playlists</span>
        <span
          className={"nav-caret" + (plExpanded ? " open" : "")}
          onClick={(e) => { e.stopPropagation(); setPlExpanded(v => !v); }}
          role="button"
        >
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </button>
      {plExpanded && (
        <div className="nav-children">
          {playlists.map(pl => (
            <button
              key={pl.id}
              className={"nav-child" + (view === "playlist-detail" && activePlaylistId === pl.id ? " active" : "")}
              onClick={() => onOpenPlaylist(pl.id)}
            >
              <span className="nav-child-dot" />
              <span className="nav-child-label">{pl.title}</span>
              <span className="badge tnum">{pl.tracks.length}</span>
            </button>
          ))}
          <button className="nav-child add" onClick={onNewPlaylist}>
            <span className="nav-child-dot">+</span>
            <span className="nav-child-label">New Playlist</span>
          </button>
        </div>
      )}

      <div className="nav-foot">
        v0.4.2 · Suno V5.5<br/>
        Next.js 14 · SQLite<br/>
        <span style={{ color: "var(--accent)" }}>●</span> sunoapi.org
      </div>
    </nav>
  );
}

function Aside({ view, batchTracks, batchJobs, completed, onPlay, currentTrackId, recentTracks, onGoLibrary }) {
  const hasBatch = batchJobs.length > 0;
  const showBatch = view === "create";
  const pendingJobs = batchJobs.filter(j => j.status !== "SUCCESS" && j.status !== "FAILED");
  const liveActive = pendingJobs.length > 0;
  const savedFeed = batchTracks.slice().reverse();

  if (showBatch) {
    return (
      <div className="aside">
        <div className="aside-head">
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 6 }}>Live Results</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--fg-2)" }}>
              {batchTracks.length} ready{hasBatch ? ` · ${pendingJobs.length} creating` : ""}
            </div>
          </div>
          {liveActive && (
            <div className="mono uc live-pill" style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.14em" }}>
              <span className="live-dot" /> LIVE
            </div>
          )}
        </div>
        <div className="aside-body scroll">
          {!hasBatch && (
            <div className="empty aside-idle">
              <div className="mono uc" style={{ color: "var(--fg-3)", fontSize: 10, letterSpacing: "0.14em", marginBottom: 8 }}>No run yet</div>
              <div style={{ fontSize: 12, color: "var(--fg-2)" }}>
                Tracks you generate will appear here live as they're created.
              </div>
            </div>
          )}

          {/* Saved-toast feed (newest first) */}
          {savedFeed.length > 0 && (
            <div className="saved-feed">
              {savedFeed.map(t => (
                <div key={"feed_" + t.id} className="saved-feed-line mono">
                  <span style={{ color: "var(--accent)", marginRight: 6 }}>✓</span>
                  <span style={{ color: "var(--fg-1)" }}>"{t.title}"</span>
                  <span style={{ color: "var(--fg-3)" }}> saved to library</span>
                </div>
              ))}
            </div>
          )}

          {pendingJobs.map(j => {
            const isText = j.status === "TEXT";
            const isFirst = j.status === "FIRST";
            const isPending = j.status === "PENDING";
            const badge = isText ? "TEXT" : isFirst ? "FIRST" : isPending ? "PENDING" : j.status;
            const sub = isText
              ? "Writing lyrics"
              : isFirst
              ? "Creating audio"
              : isPending
              ? "Waiting"
              : j.statusMessage;
            return (
              <div key={j.taskId} className="result-card" style={{ borderColor: "var(--line)" }}>
                <div className="rc-cover" style={{ background: "var(--bg-3)", display: "grid", placeItems: "center" }}>
                  <Waveform state="pending" seed={hash(j.taskId)} bars={10} height={28} />
                </div>
                <div className="rc-body">
                  <div className="rc-title" style={{ color: "var(--fg-2)" }}>Creating...</div>
                  <div className="rc-sub">{j.taskId} · {sub}</div>
                </div>
                <div className={"mono live-badge " + (isText || isFirst || isPending ? "warn" : "")} style={{ fontSize: 10, letterSpacing: "0.14em" }}>
                  {badge}
                </div>
              </div>
            );
          })}
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
        <button
          className="home-see-all"
          onClick={onGoLibrary}
        >
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

function Player({ track, contextLabel, isPlaying, onPlayPause, playhead, onSeek, onPrev, onNext, shuffle, onToggleShuffle, lyricsOpen, onToggleLyrics }) {
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
          <div className="sub">
            {contextLabel
              ? <><span style={{ color: "var(--accent)" }}>♪ {contextLabel}</span><span style={{ margin: "0 6px", color: "var(--fg-3)" }}>·</span>{track.model}</>
              : <>{track.tags.split(",")[0]} · {track.model}</>}
          </div>
        </div>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button title="Shuffle" onClick={onToggleShuffle} style={{ color: shuffle ? "var(--accent)" : "var(--fg-3)", fontSize: 14 }}>⇄</button>
          <button title="Previous" onClick={onPrev} style={{ fontSize: 16 }}>⏮</button>
          <button className="play" onClick={onPlayPause} title={isPlaying ? "Pause" : "Play"}>
            <span style={{ fontSize: 11 }}>{isPlaying ? "❚❚" : "▶"}</span>
          </button>
          <button title="Next" onClick={onNext} style={{ fontSize: 16 }}>⏭</button>
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
        <button
          className={"mono lyr-toggle" + (lyricsOpen ? " on" : "")}
          onClick={onToggleLyrics}
          style={{ fontSize: 10, color: lyricsOpen ? "var(--accent)" : "var(--fg-3)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 8px" }}
          title="Toggle lyrics"
        >Lyrics</button>
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
