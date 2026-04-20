'use client';
import type { Toast } from '@/types';

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-host">
      {toasts.map(t => (
        <div key={t.id} className={`toast${t.kind === 'err' ? ' err' : ''}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
