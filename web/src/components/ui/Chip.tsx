'use client';
import type { ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  on?: boolean;
  onClick?: () => void;
}

export function Chip({ children, on, onClick }: ChipProps) {
  return (
    <button type="button" className={`chip${on ? ' on' : ''}`} onClick={onClick}>
      {children}
      {on && <span className="x">×</span>}
    </button>
  );
}
