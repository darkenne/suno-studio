'use client';
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import type { ConfirmOptions } from '@/types';

type ConfirmFn = (opts: ConfirmOptions | string) => Promise<boolean>;

const ConfirmCtx = createContext<ConfirmFn | null>(null);

interface PendingConfirm {
  opts: ConfirmOptions;
  resolve: (v: boolean) => void;
}

function normalize(opts: ConfirmOptions | string): ConfirmOptions {
  return typeof opts === 'string' ? { title: opts } : opts;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>(
    opts =>
      new Promise(resolve => {
        setPending({ opts: normalize(opts), resolve });
      }),
    [],
  );

  const close = (result: boolean) => {
    pending?.resolve(result);
    setPending(null);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {pending && <ConfirmDialog opts={pending.opts} onClose={close} />}
    </ConfirmCtx.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const fn = useContext(ConfirmCtx);
  if (!fn) return opts => Promise.resolve(window.confirm(normalize(opts).title ?? 'Confirm?'));
  return fn;
}

function ConfirmDialog({
  opts,
  onClose,
}: {
  opts: ConfirmOptions;
  onClose: (v: boolean) => void;
}) {
  const isDanger = opts.tone === 'danger';
  return (
    <div
      className="dlg-backdrop"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose(false);
      }}
    >
      <div
        className="dlg-panel"
        style={{ maxWidth: opts.width ?? 440, width: '100%' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="dlg-head">
          <div>
            {opts.eyebrow && (
              <div className="h-eyebrow" style={{ marginBottom: 6 }}>
                {opts.eyebrow}
              </div>
            )}
            {opts.title && <h2 className="dlg-title">{opts.title}</h2>}
          </div>
          <button className="dlg-x" onClick={() => onClose(false)} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 2l10 10M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {opts.body && (
          <div className="dlg-body">
            <div className="dlg-text">{opts.body}</div>
          </div>
        )}
        <div className="dlg-foot">
          <button className="btn ghost" onClick={() => onClose(false)}>
            {opts.cancelLabel ?? 'Cancel'}
          </button>
          <button
            className={`btn ${isDanger ? 'danger' : 'primary'}`}
            onClick={() => onClose(true)}
            autoFocus
          >
            {opts.confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
