// library.jsx — saved tracks list with search, filters, favorites, multi-select, playlist actions

function Library({ tracks, playlists, onPlay, currentTrackId, onToggleFav, onDelete, onAddToPlaylist, onAddToQueue, onNewPlaylistWithTracks }) {
  const confirm = useConfirm();
  const [q, setQ] = React.useState("");
  const [mode, setMode] = React.useState("all");
  const [favOnly, setFavOnly] = React.useState(false);
  const [orderBy, setOrderBy] = React.useState("newest");
  const [selected, setSelected] = React.useState(new Set());
  const [rowMenuFor, setRowMenuFor] = React.useState(null);
  const [rowMenuRect, setRowMenuRect] = React.useState(null);
  const [barMenuOpen, setBarMenuOpen] = React.useState(false);
  const [barMenuRect, setBarMenuRect] = React.useState(null);
  const [addPlaylistMenu, setAddPlaylistMenu] = React.useState(null); // for single row "Add to Playlist" submenu

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

  const toggleSelect = (id) => {
    setSelected(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const clearSelection = () => setSelected(new Set());

  const selectedArr = Array.from(selected);

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

      <div className="track-header lib-track-header">
        <span></span>
        <span>#</span>
        <span></span>
        <span>Title · Tags</span>
        <span>Mode · Prompt</span>
        <span>Model</span>
        <span style={{ textAlign: "right" }}>Duration</span>
        <span></span>
        <span></span>
      </div>

      <div className="track-list">
        {filtered.map((t, i) => (
          <div
            key={t.id}
            className={"track lib-track" + (t.id === currentTrackId ? " playing" : "") + (selected.has(t.id) ? " selected" : "")}
            onClick={() => onPlay(t)}
          >
            <label className="track-check" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selected.has(t.id)}
                onChange={() => toggleSelect(t.id)}
              />
              <span className="chk" aria-hidden>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </label>
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
              onClick={(e) => {
                e.stopPropagation();
                setRowMenuRect(e.currentTarget.getBoundingClientRect());
                setRowMenuFor(t.id);
              }}
              title="More"
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

      {/* Multi-select action bar */}
      {selected.size > 0 && (
        <div className="multi-bar">
          <div className="multi-bar-inner">
            <div className="mono uc" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.12em" }}>
              ● {selected.size} SELECTED
            </div>
            <div style={{ flex: 1 }} />
            <button
              className="btn sm primary"
              onClick={(e) => {
                setBarMenuRect(e.currentTarget.getBoundingClientRect());
                setBarMenuOpen(true);
              }}
            >+ Add to Playlist</button>
            <button className="btn sm ghost" onClick={clearSelection}>Clear</button>
          </div>
        </div>
      )}

      {/* Row menu */}
      <Menu open={!!rowMenuFor} anchorRect={rowMenuRect} onClose={() => { setRowMenuFor(null); setAddPlaylistMenu(null); }}>
        {!addPlaylistMenu ? (
          <>
            <MenuItem onClick={() => { onAddToQueue(rowMenuFor); setRowMenuFor(null); }}>Add to Queue</MenuItem>
            <MenuItem
              onClick={() => setAddPlaylistMenu(rowMenuFor)}
            >Add to Playlist →</MenuItem>
            <MenuSep />
            <MenuItem
              danger
              onClick={async () => {
                const id = rowMenuFor;
                const t = tracks.find(x => x.id === id);
                setRowMenuFor(null);
                if (!t) return;
                const ok = await confirm({
                  eyebrow: "Library",
                  title: `Delete "${t.title}"?`,
                  body: "This removes the track from your library. The generated audio cannot be recovered.",
                  confirmLabel: "Delete track",
                  tone: "danger",
                });
                if (ok) onDelete(id);
              }}
            >Delete Track</MenuItem>
          </>
        ) : (
          <>
            <MenuHeading>Add to Playlist</MenuHeading>
            {playlists.map(pl => (
              <MenuItem
                key={pl.id}
                sub={pl.tracks.length}
                onClick={() => { onAddToPlaylist(pl.id, [addPlaylistMenu]); setRowMenuFor(null); setAddPlaylistMenu(null); }}
              >{pl.title}</MenuItem>
            ))}
            <MenuSep />
            <MenuItem
              onClick={() => {
                onNewPlaylistWithTracks([addPlaylistMenu]);
                setRowMenuFor(null);
                setAddPlaylistMenu(null);
              }}
            >+ New Playlist</MenuItem>
          </>
        )}
      </Menu>

      {/* Bar menu */}
      <Menu open={barMenuOpen} anchorRect={barMenuRect} onClose={() => setBarMenuOpen(false)}>
        <MenuHeading>Add {selected.size} track{selected.size === 1 ? "" : "s"} to…</MenuHeading>
        {playlists.map(pl => (
          <MenuItem
            key={pl.id}
            sub={pl.tracks.length}
            onClick={() => { onAddToPlaylist(pl.id, selectedArr); setBarMenuOpen(false); clearSelection(); }}
          >{pl.title}</MenuItem>
        ))}
        <MenuSep />
        <MenuItem
          onClick={() => { onNewPlaylistWithTracks(selectedArr); setBarMenuOpen(false); clearSelection(); }}
        >+ New Playlist</MenuItem>
      </Menu>
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
