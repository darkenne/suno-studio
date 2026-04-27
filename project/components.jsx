// components.jsx — shared UI primitives

function Slider({ value, onChange, min = 0, max = 100, step = 1, label, unit = "%", hintLeft, hintRight }) {
  return (
    <div className="field">
      <div className="label">
        <span>{label}</span>
        <span className="slider-value tnum">{value}{unit}</span>
      </div>
      <div className="slider-wrap">
        <div className="slider-track-wrap">
          <div className="slider-ticks">
            {Array.from({ length: 10 }).map((_, i) => <div className="t" key={i} />)}
          </div>
          <input
            type="range"
            className="slider"
            value={value}
            min={min} max={max} step={step}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
          />
        </div>
        <div className="slider-foot">
          <span>{hintLeft}</span>
          <span>{hintRight}</span>
        </div>
      </div>
    </div>
  );
}

function Seg({ options, value, onChange, accent = false }) {
  return (
    <div className={"seg" + (accent ? " accent" : "")}>
      {options.map(opt => (
        <button
          key={opt.value}
          className={value === opt.value ? "on" : ""}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Select({ value, onChange, options, mono = true, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const [focus, setFocus] = React.useState(-1);
  const rootRef = React.useRef(null);
  const current = options.find(o => o.value === value);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const onKey = (e) => {
    if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setOpen(true);
      setFocus(Math.max(0, options.findIndex(o => o.value === value)));
      return;
    }
    if (!open) return;
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setFocus(f => Math.min(options.length - 1, f + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setFocus(f => Math.max(0, f - 1)); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (focus >= 0) { onChange(options[focus].value); setOpen(false); }
    }
  };

  return (
    <div className={"select-ui" + (open ? " open" : "") + (mono ? " mono" : "")} ref={rootRef} tabIndex={0} onKeyDown={onKey}>
      <button
        type="button"
        className="select-trigger"
        onClick={() => setOpen(o => !o)}
      >
        <span className="select-val">{current ? current.label : (placeholder || "Select…")}</span>
        <span className={"select-caret" + (open ? " up" : "")} aria-hidden>
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </button>
      {open && (
        <div className="select-menu scroll" role="listbox">
          {options.map((o, i) => (
            <button
              type="button"
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={"select-opt" + (o.value === value ? " sel" : "") + (i === focus ? " foc" : "")}
              onMouseEnter={() => setFocus(i)}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              <span>{o.label}</span>
              {o.value === value && (
                <span className="select-check" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.5 2.5L9.5 3.7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ children, on, onClick }) {
  return (
    <button className={"chip" + (on ? " on" : "")} onClick={onClick}>
      {children}
      {on && <span className="x">×</span>}
    </button>
  );
}

function Waveform({ state = "idle", seed = 1, bars = 48, height = 36 }) {
  // state: "idle" | "pending" | "active"
  const values = React.useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: bars }, (_, i) => {
      const base = 0.2 + r() * 0.8;
      const env = Math.sin((i / bars) * Math.PI) * 0.6 + 0.4;
      return base * env;
    });
  }, [seed, bars]);

  return (
    <div className={"wave " + state} style={{ height }}>
      {values.map((v, i) => (
        <div
          key={i}
          className="b"
          style={{
            height: `${Math.max(6, v * 100)}%`,
            animationDelay: state === "pending" ? `${(i % 7) * 120}ms` : undefined
          }}
        />
      ))}
    </div>
  );
}

function rng(seed) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function Toasts({ toasts }) {
  return (
    <div className="toast-host">
      {toasts.map(t => (
        <div key={t.id} className={"toast" + (t.kind === "err" ? " err" : "")}>
          <span>{t.msg}</span>
          {t.action && (
            <button className="toast-act" onClick={t.action.fn}>{t.action.label}</button>
          )}
        </div>
      ))}
    </div>
  );
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function relTime(iso) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

Object.assign(window, { Slider, Seg, Select, Chip, Waveform, Toasts, formatTime, relTime });
