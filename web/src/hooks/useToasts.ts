'use client';
import { useState, useCallback } from 'react';
import type { Toast, ToastAction } from '@/types';

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((msg: string, kind: Toast['kind'] = 'ok', action?: ToastAction, duration = 3200) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, kind, action }]);
    const timer = setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  return { toasts, push, dismiss };
}
