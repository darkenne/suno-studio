// playlists.jsx — Playlists grid, detail view, modals, menus

// ---------- Seed ----------
function seedPlaylists(tracks) {
  const first = tracks.slice(0, 4).map((t, i) => ({ trackId: t.id, position: i, addedAt: t.createdAt }));
  const second = tracks.slice(4, 7).map((t, i) => ({ trackId: t.id, position: i, addedAt: t.createdAt }));
  return [
    { id: "pl_lofi",   title: "Lo-fi Collection",  description: "Late-night study rotation",      createdAt: new Date().toISOString(), tracks: first },
    { id: "pl_drive",  title: "Dawn Drive",        description: "",                                 createdAt: new Date().toISOString(), tracks: second },
  ];
}

// ---------- Menu primitive ----------
function Menu({ open, onClose, anchorRect, children, width = 220 }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (!open || !anchorRect) return null;
  const style = {
    position: "fixed",
    top: Math.min(anchorRect.bottom + 4, window.innerHeight - 280),
    left: Math.min(anchorRect.right - width, window.innerWidth - width - 8),
    width,
    zIndex: 500,
  };
  return (
    <div className="ui-menu" ref={ref} style={style} role="menu">
      {children}
    </div>
  );
}

function MenuItem({ children, onClick, danger, icon, sub }) {
  return (
    <button className={"ui-menu-item" + (danger ? " danger" : "")} role="menuitem" onClick={onClick}>
      {icon && <span className="ui-menu-ic">{icon}</span>}
      <span className="ui-menu-label">{children}</span>
      {sub != null && <span className="ui-menu-sub tnum">{sub}</span>}
    </button>
  );
}
function MenuSep() { return <div className="ui-menu-sep" />; }
function MenuHeading({ children }) { return <div className="ui-menu-head">{children}</div>; }

// ---------- Create / Rename modal ----------
function PlaylistTitleModal({ open, initialTitle, onCancel, onSubmit, mode = "create" }) {
  const [val, setVal] = React.useState("");
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      setVal(initialTitle || "Untitled");
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 20);
    }
  }, [open, initialTitle]);

  const submit = () => {
    const t = val.trim();
    if (!t) return;
    onSubmit(t.slice(0, 100));
  };

  return (
    <Dialog
      open={open}
      eyebrow={mode === "create" ? "New Playlist" : "Rename Playlist"}
      title={mode === "create" ? "Name your playlist" : "Rename playlist"}
      onClose={onCancel}
      width={440}
      footer={
        <>
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn primary" onClick={submit} disabled={!val.trim()}>
            {mode === "create" ? "Create" : "Rename"}
          </button>
        </>
      }
    >
      <div className="field" style={{ margin: 0 }}>
        <div className="label"><span>Title</span><span className="count tnum">{val.length}/100</span></div>
        <input
          ref={inputRef}
          className="input"
          maxLength={100}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="Untitled"
        />
      </div>
    </Dialog>
  );
}

// ---------- Playlists grid page ----------
function PlaylistsPage({ playlists, tracks, onOpen, onCreate, onDelete }) {
  const confirm = useConfirm();
  const [menuFor, setMenuFor] = React.useState(null);
  const [menuRect, setMenuRect] = React.useState(null);

  const trackOf = (id) => tracks.find(t => t.id === id);

  return (
    <div className="main scroll">
      <div className="section no-underline" style={{ paddingBottom: 16 }}>
        <div className="h-eyebrow" style={{ marginBottom: 10 }}>Playlists</div>
        <h1 className="h-display">Your collections</h1>
      </div>

      <div className="section">
        <div className="pl-grid">
          <button className="pl-card new" onClick={onCreate}>
            <div className="pl-cover-new">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 6v16M6 14h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
            <div className="pl-meta">
              <div className="pl-title">Create Playlist</div>
              <div className="pl-sub mono">+ NEW</div>
            </div>
          </button>

          {playlists.map(pl => {
            const first = pl.tracks[0] ? trackOf(pl.tracks[0].trackId) : null;
            return (
              <div
                key={pl.id}
                className="pl-card"
                onClick={() => onOpen(pl.id)}
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
      </div>

      <Menu open={!!menuFor} anchorRect={menuRect} onClose={() => setMenuFor(null)}>
        <MenuItem
          danger
          onClick={async () => {
            const pl = playlists.find(p => p.id === menuFor);
            setMenuFor(null);
            if (!pl) return;
            const ok = await confirm({
              eyebrow: "Playlist",
              title: `Delete "${pl.title}"?`,
              body: "The playlist is removed. Tracks inside it remain in your library.",
              confirmLabel: "Delete",
              tone: "danger",
            });
            if (ok) onDelete(pl.id);
          }}
        >Delete</MenuItem>
      </Menu>
    </div>
  );
}

// ---------- Playlist detail page ----------
function PlaylistDetailPage({ playlist, tracks, currentTrackId, onPlayPlaylist, onPlayTrack, onRename, onDescribe, onRemoveTrack, onReorder, onDelete, onAddToQueue, onBack }) {
  const confirm = useConfirm();
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [editingDesc, setEditingDesc] = React.useState(false);
  const [titleVal, setTitleVal] = React.useState(playlist.title);
  const [descVal, setDescVal] = React.useState(playlist.description);
  const [menuTrack, setMenuTrack] = React.useState(null);
  const [menuRect, setMenuRect] = React.useState(null);
  const [headMenuOpen, setHeadMenuOpen] = React.useState(false);
  const [headMenuRect, setHeadMenuRect] = React.useState(null);
  const [dragId, setDragId] = React.useState(null);
  const [overId, setOverId] = React.useState(null);

  React.useEffect(() => { setTitleVal(playlist.title); setDescVal(playlist.description); }, [playlist.id]);

  const list = playlist.tracks
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(pt => tracks.find(t => t.id === pt.trackId))
    .filter(Boolean);

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

  const onRowDragStart = (id) => setDragId(id);
  const onRowDragOver = (e, id) => { e.preventDefault(); setOverId(id); };
  const onRowDrop = (e) => {
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

  return (
    <div className="main scroll">
      <div className="section no-underline" style={{ paddingBottom: 20 }}>
        <button
          className="btn sm ghost"
          onClick={onBack}
          style={{ marginBottom: 16 }}
        >← All playlists</button>

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
                onChange={(e) => setTitleVal(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") { setTitleVal(playlist.title); setEditingTitle(false); }
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
                onChange={(e) => setDescVal(e.target.value)}
                onBlur={saveDesc}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveDesc();
                  if (e.key === "Escape") { setDescVal(playlist.description); setEditingDesc(false); }
                }}
              />
            ) : (
              <div
                className={"pl-desc-edit" + (!playlist.description ? " placeholder" : "")}
                onClick={() => setEditingDesc(true)}
                title="Click to edit"
              >
                {playlist.description || "Add playlist description"}
              </div>
            )}

            <div className="pl-stat mono">
              {list.length} SONG{list.length === 1 ? "" : "S"}
              <span style={{ margin: "0 10px", color: "var(--fg-3)" }}>·</span>
              {formatHMS2(list.reduce((s, t) => s + t.duration, 0))}
            </div>

            <div className="pl-actions">
              <button
                className="btn primary"
                onClick={() => onPlayPlaylist(playlist.id, false)}
                disabled={list.length === 0}
              >▶ Play</button>
              <button
                className="btn"
                onClick={() => onPlayPlaylist(playlist.id, true)}
                disabled={list.length === 0}
              >⇄ Shuffle</button>
              <button
                className="btn ghost icon"
                onClick={(e) => {
                  setHeadMenuRect(e.currentTarget.getBoundingClientRect());
                  setHeadMenuOpen(true);
                }}
                title="More"
              >⋯</button>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="home-recent">
          <div className="track-header pl-track-header">
            <span></span>
            <span>#</span>
            <span></span>
            <span>Title · Tags</span>
            <span>Mode · Prompt</span>
            <span>Model</span>
            <span style={{ textAlign: "right" }}>Duration</span>
            <span></span>
          </div>

          <div className="track-list" onDragOver={(e) => e.preventDefault()} onDrop={onRowDrop}>
            {list.map((t, i) => (
              <div
                key={t.id}
                className={
                  "track pl-track" +
                  (t.id === currentTrackId ? " playing" : "") +
                  (dragId === t.id ? " dragging" : "") +
                  (overId === t.id && dragId !== t.id ? " dragover" : "")
                }
                draggable
                onDragStart={() => onRowDragStart(t.id)}
                onDragEnd={() => { setDragId(null); setOverId(null); }}
                onDragOver={(e) => onRowDragOver(e, t.id)}
                onClick={() => onPlayTrack(t, playlist.id)}
              >
                <div className="drag-handle" title="Drag to reorder">⠿</div>
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
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--fg-2)", letterSpacing: "0.04em" }}>{t.model}</div>
                <div className="dur tnum">{formatTime(t.duration)}</div>
                <button
                  className="menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuRect(e.currentTarget.getBoundingClientRect());
                    setMenuTrack(t.id);
                  }}
                  title="More"
                >⋯</button>
              </div>
            ))}
            {list.length === 0 && (
              <div className="empty">
                No tracks yet.<br/>
                Add from the Library via the ··· menu or multi-select.
              </div>
            )}
          </div>
        </div>
      </div>

      <Menu open={!!menuTrack} anchorRect={menuRect} onClose={() => setMenuTrack(null)}>
        <MenuItem onClick={() => { onAddToQueue(menuTrack); setMenuTrack(null); }}>
          Add to Queue
        </MenuItem>
        <MenuSep />
        <MenuItem
          danger
          onClick={() => {
            onRemoveTrack(playlist.id, menuTrack);
            setMenuTrack(null);
          }}
        >Remove from Playlist</MenuItem>
      </Menu>

      <Menu open={headMenuOpen} anchorRect={headMenuRect} onClose={() => setHeadMenuOpen(false)} width={200}>
        <MenuItem
          onClick={() => { setHeadMenuOpen(false); setEditingTitle(true); }}
        >Rename</MenuItem>
        <MenuSep />
        <MenuItem
          danger
          onClick={async () => {
            setHeadMenuOpen(false);
            const ok = await confirm({
              eyebrow: "Playlist",
              title: `Delete "${playlist.title}"?`,
              body: "The playlist is removed. Tracks inside it remain in your library.",
              confirmLabel: "Delete",
              tone: "danger",
            });
            if (ok) onDelete(playlist.id);
          }}
        >Delete Playlist</MenuItem>
      </Menu>
    </div>
  );
}

function formatHMS2(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}H ${m}M`;
  return `${m}M ${sec}S`;
}

Object.assign(window, {
  seedPlaylists, PlaylistsPage, PlaylistDetailPage, PlaylistTitleModal,
  Menu, MenuItem, MenuSep, MenuHeading,
});
