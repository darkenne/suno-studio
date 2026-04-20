// dialog.jsx — themed Dialog primitive + useConfirm hook (promise-based)

function Dialog({ open, title, eyebrow, children, onClose, width = 460, closeOnBackdrop = true, footer }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="dlg-backdrop"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="dlg-panel" style={{ maxWidth: width, width: "100%" }} role="dialog" aria-modal="true">
        <div className="dlg-head">
          <div>
            {eyebrow && <div className="h-eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
            {title && <h2 className="dlg-title">{title}</h2>}
          </div>
          {onClose && (
            <button className="dlg-x" onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {children != null && <div className="dlg-body">{children}</div>}

        {footer && <div className="dlg-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ---- Confirm via context ----

const ConfirmCtx = React.createContext(null);

function ConfirmProvider({ children }) {
  const [state, setState] = React.useState(null); // { opts, resolve }

  const confirm = React.useCallback((opts) => {
    return new Promise((resolve) => {
      setState({ opts: normalizeConfirmOpts(opts), resolve });
    });
  }, []);

  const close = (result) => {
    if (!state) return;
    state.resolve(result);
    setState(null);
  };

  const o = state?.opts;

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <Dialog
        open={!!state}
        eyebrow={o?.eyebrow}
        title={o?.title}
        onClose={() => close(false)}
        width={o?.width || 440}
        footer={
          <>
            <button className="btn ghost" onClick={() => close(false)}>
              {o?.cancelLabel || "Cancel"}
            </button>
            <button
              className={"btn " + (o?.tone === "danger" ? "danger" : "primary")}
              onClick={() => close(true)}
              autoFocus
            >
              {o?.confirmLabel || "Confirm"}
            </button>
          </>
        }
      >
        {o?.body && <div className="dlg-text">{o.body}</div>}
      </Dialog>
    </ConfirmCtx.Provider>
  );
}

function normalizeConfirmOpts(opts) {
  if (typeof opts === "string") return { title: opts };
  return opts || {};
}

function useConfirm() {
  const confirm = React.useContext(ConfirmCtx);
  if (!confirm) {
    // fall back to native so callers still work outside the provider
    return (opts) => Promise.resolve(window.confirm(normalizeConfirmOpts(opts).title || "Confirm?"));
  }
  return confirm;
}

Object.assign(window, { Dialog, ConfirmProvider, useConfirm });
