// library.jsx — saved tracks list with search, filters, favorites

function Library({ tracks, onPlay, currentTrackId, onToggleFav, onDelete }) {
  const confirm = useConfirm();
  const [q, setQ] = React.useState("");
  const [mode, setMode] = React.useState("all");
  const [favOnly, setFavOnly] = React.useState(false);
  const [orderBy, setOrderBy] = React.useState("newest");

  const filtered = React.useMemo(() => {
    let list = [...tracks];
    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(qq) ||
        t.tags.toLowerCase().includes(qq) ||
        t.prompt.toLowerCase().includes(qq)
      );
    }
    if (mode !== "all") list = list.filter(t => t.mode === mode);
    if (favOnly) list = list.filter(t => t.isFavorite);
    list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return orderBy === "oldest" ? da - db : db - da;
    });
    return list;
  }, [tracks, q, mode, favOnly, orderBy]);

  const totalDur = filtered.reduce((s, t) => s + t.duration, 0);
  const favCount = tracks.filter(t => t.isFavorite).length;

  return (
    <div className="main scroll">
      <div className="section no-underline" style={{ paddingBottom: 16 }}>
        <div className="h-eyebrow" style={{ marginBottom: 10 }}>Library</div>
        <h1 className="h-display">Your saved tracks</h1>
      </div>

      <div className="section no-underline" style={{ paddingTop: 0, paddingBottom: 20 }}>
        <div className="stat-row">
          <div className="stat">
            <div className="k">Total Tracks</div>
            <div className="v tnum">{tracks.length}</div>
          </div>
          <div className="stat">
            <div className="k">Favorites</div>
            <div className="v tnum">{favCount}</div>
          </div>
          <div className="stat">
            <div className="k">Total Runtime</div>
            <div className="v tnum">{formatHMS(totalDur)}</div>
          </div>
          <div className="stat">
            <div className="k">Showing</div>
            <div className="v tnum">{filtered.length}<span className="unit">/ {tracks.length}</span></div>
          </div>
        </div>
      </div>

      <div className="lib-toolbar">
        <div className="search">
          <span className="ic" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4"/><path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </span>
          <input
            placeholder="title · tags · prompt"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Seg
          options={[
            { value: "all", label: "All" },
            { value: "advanced", label: "Advanced" },
            { value: "simple", label: "Simple" },
          ]}
          value={mode}
          onChange={setMode}
        />
        <button
          className={"btn sm" + (favOnly ? " primary" : "")}
          onClick={() => setFavOnly(v => !v)}
        >
          ★ Favorites Only
        </button>
        <div style={{ flex: 1 }} />
        <Seg
          options={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
          ]}
          value={orderBy}
          onChange={setOrderBy}
        />
      </div>

      <div className="track-header">
        <span>#</span>
        <span></span>
        <span>Title · Tags</span>
        <span>Mode / Prompt</span>
        <span>Model</span>
        <span style={{ textAlign: "right" }}>Duration</span>
        <span></span>
        <span></span>
      </div>

      <div className="track-list">
        {filtered.map((t, i) => (
          <div
            key={t.id}
            className={"track" + (t.id === currentTrackId ? " playing" : "")}
            onClick={() => onPlay(t)}
          >
            <div className="num tnum">{String(i + 1).padStart(2, "0")}</div>
            <div className="cover"><Cover track={t} size={44} /></div>
            <div className="title-block">
              <div className="title">{t.title}{t.id === currentTrackId && <span style={{ color: "var(--accent)", marginLeft: 8, fontSize: 10 }}>▶ NOW</span>}</div>
              <div className="sub">{t.tags}</div>
            </div>
            <div>
              <div className="mode-pill" style={{ display: "inline-block" }}>
                {t.mode} · {t.promptMode}
              </div>
              {t.instrumental && (
                <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  instrumental
                </div>
              )}
            </div>
            <div className="mono" style={{ fontSize: 11, color: "var(--fg-2)", letterSpacing: "0.04em" }}>{t.model}</div>
            <div className="dur tnum">{formatTime(t.duration)}</div>
            <button
              className={"fav" + (t.isFavorite ? " on" : "")}
              onClick={(e) => { e.stopPropagation(); onToggleFav(t.id); }}
              title={t.isFavorite ? "Unfavorite" : "Favorite"}
            >
              {t.isFavorite ? "★" : "☆"}
            </button>
            <button
              className="menu"
              onClick={async (e) => {
                e.stopPropagation();
                const ok = await confirm({
                  eyebrow: "Library",
                  title: `Delete "${t.title}"?`,
                  body: "This removes the track from your library. The generated audio cannot be recovered.",
                  confirmLabel: "Delete track",
                  tone: "danger",
                });
                if (ok) onDelete(t.id);
              }}
              title="Delete"
            >
              ⋯
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty">
            No tracks match these filters.<br/>
            Try clearing search or switching to ALL.
          </div>
        )}
      </div>
    </div>
  );
}

function formatHMS(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${sec}s`;
}

window.Library = Library;
