// home.jsx — dashboard page with Credits, Recent tracks, and Playlists

function Home({ tracks, playlists, credits, currentTrackId, onPlay, onGoLibrary, onGoPlaylists, onOpenPlaylist, onGoCreate, onNewPlaylist }) {
  const { used = 153, total = 1000, remaining = 847 } = credits || {};
  const pct = (used / total) * 100;

  const recent = tracks.slice().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const firstFour = playlists.slice(0, 4);

  const isEmpty = tracks.length === 0 && playlists.length === 0;

  return (
    <div className="main scroll">
      <div className="section no-underline" style={{ paddingBottom: 16 }}>
        <div className="h-eyebrow" style={{ marginBottom: 10 }}>Home</div>
        <h1 className="h-display">Hi, what are we making today?</h1>
      </div>

      {/* --- Onboarding empty state --- */}
      {isEmpty && (
        <div className="section">
          <div className="home-onboard">
            <div className="home-onboard-ic mono">◐</div>
            <div className="home-onboard-title">No tracks yet</div>
            <div className="home-onboard-sub">Head to Create to make your first piece of music.</div>
            <button className="btn primary" onClick={onGoCreate}>+ Start creating</button>
          </div>
        </div>
      )}

      {/* --- Credits --- */}
      <div className="section">
        <div className="home-sec-head">
          <div className="h-eyebrow">Credits</div>
        </div>

        <div className="credits-card">
          <div className="credits-main">
            <div className="credits-figure">
              <span className="credits-remaining tnum">{remaining.toLocaleString()}</span>
              <span className="credits-sep">/</span>
              <span className="credits-total tnum">{total.toLocaleString()}</span>
            </div>
            <div className="credits-pct mono">
              {pct.toFixed(1)}% used
            </div>
          </div>

          <div className="credits-bar">
            <div className="credits-bar-fill" style={{ width: `${pct}%` }} />
          </div>

          <div className="credits-legend">
            <div className="credits-legend-item">
              <span className="credits-legend-dot used" />
              <span className="mono uc">Used</span>
              <span className="tnum credits-legend-val">{used.toLocaleString()}</span>
            </div>
            <div className="credits-legend-item">
              <span className="credits-legend-dot remain" />
              <span className="mono uc">Remaining</span>
              <span className="tnum credits-legend-val">{remaining.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Recently Generated --- */}
      <div className="section">
        <div className="home-sec-head">
          <div className="h-eyebrow">Recently Generated</div>
          {recent.length > 0 && (
            <button className="home-see-all" onClick={onGoLibrary}>
              See all <span aria-hidden>→</span>
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty-title">No tracks yet</div>
            <div className="home-empty-sub">Start from Create to generate your first track.</div>
            <button className="btn" onClick={onGoCreate}>+ Go to Create</button>
          </div>
        ) : (
          <div className="track-list home-recent">
            <div className="track-header home-recent-header">
              <span>#</span>
              <span></span>
              <span>Title · Tags</span>
              <span>Model</span>
              <span>Mode · Prompt</span>
              <span style={{ textAlign: "right" }}>Duration</span>
              <span></span>
            </div>
            {recent.map((t, i) => (
              <div
                key={t.id}
                className={"track home-recent-row" + (t.id === currentTrackId ? " playing" : "")}
                onClick={() => onPlay(t)}
              >
                <div className="num tnum">{String(i + 1).padStart(2, "0")}</div>
                <div className="cover"><Cover track={t} size={44} /></div>
                <div className="title-block">
                  <div className="title">
                    {t.title}
                    {t.id === currentTrackId && (
                      <span style={{ color: "var(--accent)", marginLeft: 8, fontSize: 10 }}>▶ NOW</span>
                    )}
                  </div>
                  <div className="sub">{t.tags}</div>
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--fg-2)", letterSpacing: "0.04em" }}>{t.model}</div>
                <div>
                  <div className="mode-pill" style={{ display: "inline-block" }}>
                    {t.mode} · {t.promptMode}
                  </div>
                </div>
                <div className="dur tnum">{formatTime(t.duration)}</div>
                <button
                  className="play-ic"
                  title="Play"
                  onClick={(e) => { e.stopPropagation(); onPlay(t); }}
                >▶</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Playlists --- */}
      <div className="section" style={{ borderBottom: "none" }}>
        <div className="home-sec-head">
          <div className="h-eyebrow">Playlists</div>
          {playlists.length > 0 && (
            <button className="home-see-all" onClick={onGoPlaylists}>
              See all <span aria-hidden>→</span>
            </button>
          )}
        </div>

        {playlists.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty-title">No playlists yet</div>
            <div className="home-empty-sub">Organize your tracks into collections.</div>
            <button className="btn" onClick={onNewPlaylist}>+ Create Playlist</button>
          </div>
        ) : (
          <div className="home-pl-grid">
            {firstFour.map(pl => {
              const first = pl.tracks[0] ? tracks.find(t => t.id === pl.tracks[0].trackId) : null;
              return (
                <div
                  key={pl.id}
                  className="pl-card"
                  onClick={() => onOpenPlaylist(pl.id)}
                >
                  <div className="pl-cover">
                    {first
                      ? <Cover track={first} size={260} />
                      : <div className="pl-cover-empty mono">EMPTY</div>}
                  </div>
                  <div className="pl-meta">
                    <div className="pl-title">{pl.title}</div>
                    <div className="pl-sub mono">{pl.tracks.length} TRACK{pl.tracks.length === 1 ? "" : "S"}</div>
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

window.Home = Home;
