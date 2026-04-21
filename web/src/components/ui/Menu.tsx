'use client';
import { useEffect, useRef, type ReactNode } from 'react';

interface MenuProps {
  open: boolean;
  onClose: () => void;
  anchorRect: DOMRect | null;
  children: ReactNode;
  width?: number;
}

export function Menu({ open, onClose, anchorRect, children, width = 220 }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open || !anchorRect) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
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

export function MenuItem({
  children,
  onClick,
  danger = false,
  icon,
  sub,
}: {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  icon?: ReactNode;
  sub?: string | number;
}) {
  return (
    <button
      type="button"
      className={`ui-menu-item${danger ? ' danger' : ''}`}
      role="menuitem"
      onClick={onClick}
    >
      {icon && <span className="ui-menu-ic">{icon}</span>}
      <span className="ui-menu-label">{children}</span>
      {sub != null && <span className="ui-menu-sub tnum">{sub}</span>}
    </button>
  );
}

export function MenuSep() {
  return <div className="ui-menu-sep" />;
}

export function MenuHeading({ children }: { children: ReactNode }) {
  return <div className="ui-menu-head">{children}</div>;
}
