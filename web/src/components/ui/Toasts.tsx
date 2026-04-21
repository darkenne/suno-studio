'use client';
import type { Toast } from '@/types';

export function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss?: (id: number) => void }) {
  return (
    <div className="toast-host">
      {toasts.map(t => (
        <div key={t.id} className={`toast${t.kind === 'err' ? ' err' : ''}`}>
          <span>{t.msg}</span>
          {t.action && (
            <button
              type="button"
              className="toast-act"
              onClick={() => { t.action!.fn(); onDismiss?.(t.id); }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
