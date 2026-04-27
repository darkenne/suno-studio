// lyricsOverlay.jsx — fullscreen-ish lyrics view over the main grid.
// Cover artwork blown up + blurred behind a glass pane; karaoke-style
// active-line highlight tracks the player's playhead.

function LyricsOverlay({ open, onClose, track, playhead, isPlaying, onSeek }) {
  const scrollerRef = React.useRef(null);
  const lineRefs = React.useRef({});

  const lyrics = track && track.lyrics;
  const hasLyrics = Array.isArray(lyrics) && lyrics.length > 0;
  const enabled = !!(open && track);

  // Compute active index — the last line whose `t` <= playhead.
  const activeIdx = React.useMemo(() => {
    if (!hasLyrics) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].t <= playhead) idx = i;
      else break;
    }
    return idx;
  }, [lyrics, playhead, hasLyrics]);

  // Auto-scroll active line into the center of the scroller.
  React.useEffect(() => {
    if (!enabled) return;
    if (activeIdx < 0) return;
    const el = lineRefs.current[activeIdx];
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    const targetTop = el.offsetTop - scroller.clientHeight / 2 + el.clientHeight / 2;
    scroller.scrollTo({ top: targetTop, behavior: "smooth" });
  }, [activeIdx, enabled]);

  // Esc to close
  React.useEffect(() => {
    if (!enabled) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, enabled]);

  if (!enabled) return null;

  const [c1, c2, c3] = track.palette || ["#d4e85c", "#1d2a14", "#6a7a3a"];

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const ss = String(Math.floor(s % 60)).padStart(2, "0");
    return `${m}:${ss}`;
  };

  return (
    <div className="lyr-view">
      {/* Backdrop: blurred, scaled cover art */}
      <div className="lyr-backdrop" aria-hidden="true">
        <div className="lyr-cover-bg">
          <Cover track={track} size={1200} />
        </div>
        <div className="lyr-backdrop-tint" style={{
          background: `radial-gradient(120% 80% at 50% 30%, ${hexA(c1, 0.10)}, transparent 60%), linear-gradient(180deg, rgba(8,10,14,0.55), rgba(8,10,14,0.78))`
        }} />
      </div>

      {/* Glass pane */}
      <div className="lyr-pane">
        <div className="lyr-head">
          <div className="lyr-head-l">
            <div className="lyr-cover-mini">
              <Cover track={track} size={44} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="lyr-title">{track.title}</div>
              <div className="lyr-sub mono">
                <span style={{ color: "var(--accent)" }}>● {isPlaying ? "PLAYING" : "PAUSED"}</span>
                <span className="dot-sep">·</span>
                <span>{track.tags.split(",")[0]}</span>
                <span className="dot-sep">·</span>
                <span>{track.model}</span>
                <span className="dot-sep">·</span>
                <span className="tnum">{fmt(playhead)} / {fmt(track.duration)}</span>
              </div>
            </div>
          </div>
          <div className="lyr-head-r">
            <button className="lyr-close" onClick={onClose} title="Close (Esc)">
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>

        <div className="lyr-body scroll" ref={scrollerRef}>
          {!hasLyrics && (
            <div className="lyr-empty">
              <div className="mono uc lyr-empty-eyebrow">No timed lyrics</div>
              <div className="lyr-empty-msg">
                {track.instrumental
                  ? "This track is instrumental — there's nothing to sing."
                  : "Lyrics weren't generated with timestamps for this take."}
              </div>
            </div>
          )}

          {hasLyrics && (
            <div className="lyr-lines">
              {/* top spacer so first line starts mid-pane */}
              <div className="lyr-spacer" />
              {lyrics.map((l, i) => {
                const isSection = /^\[.+\]$/.test(l.text.trim());
                const isBlank = l.text.trim() === "";
                const isActive = i === activeIdx;
                const isPast = i < activeIdx;
                const className =
                  "lyr-line" +
                  (isActive ? " active" : "") +
                  (isPast ? " past" : "") +
                  (isSection ? " section" : "") +
                  (isBlank ? " blank" : "");
                return (
                  <div
                    key={i}
                    ref={(el) => { lineRefs.current[i] = el; }}
                    className={className}
                    onClick={() => onSeek && onSeek(l.t)}
                    title={`Jump to ${fmt(l.t)}`}
                  >
                    <span className="lyr-line-time mono tnum">{fmt(l.t)}</span>
                    <span className="lyr-line-text">{l.text || "·"}</span>
                  </div>
                );
              })}
              <div className="lyr-spacer" />
            </div>
          )}
        </div>

        <div className="lyr-foot mono">
          <span className="lyr-foot-l">
            <span className="lyr-kbd">esc</span>
            <span style={{ marginLeft: 8, color: "var(--fg-3)" }}>close</span>
            <span style={{ margin: "0 10px", color: "var(--fg-3)" }}>·</span>
            <span style={{ color: "var(--fg-3)" }}>click any line to jump</span>
          </span>
          <span className="lyr-foot-r">
            <span style={{ color: "var(--fg-3)" }}>SYNCED</span>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--accent)", display: "inline-block", marginLeft: 8, boxShadow: "0 0 8px var(--accent)" }} />
          </span>
        </div>
      </div>
    </div>
  );
}

// hex (#rgb / #rrggbb) → rgba(.., a) string. Works with the palette colors
// we ship in mock data; falls through unchanged for non-hex inputs.
function hexA(hex, a) {
  if (!hex || typeof hex !== "string" || hex[0] !== "#") return hex;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split("").map(ch => ch + ch).join("");
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

window.LyricsOverlay = LyricsOverlay;
