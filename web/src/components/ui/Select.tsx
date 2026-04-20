'use client';
import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  mono?: boolean;
  placeholder?: string;
}

export function Select({ value, onChange, options, mono = true, placeholder }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const onKey = (e: KeyboardEvent) => {
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setOpen(true);
      setFocus(Math.max(0, options.findIndex(o => o.value === value)));
      return;
    }
    if (!open) return;
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocus(f => Math.min(options.length - 1, f + 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocus(f => Math.max(0, f - 1)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (focus >= 0) { onChange(options[focus].value); setOpen(false); }
    }
  };

  return (
    <div
      ref={rootRef}
      className={`select-ui${open ? ' open' : ''}${mono ? ' mono-sel' : ''}`}
      tabIndex={0}
      onKeyDown={onKey}
    >
      <button type="button" className="select-trigger" onClick={() => setOpen(o => !o)}>
        <span className="select-val">{current ? current.label : (placeholder ?? 'Select…')}</span>
        <span className="select-caret" aria-hidden>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
              className={`select-opt${o.value === value ? ' sel' : ''}${i === focus ? ' foc' : ''}`}
              onMouseEnter={() => setFocus(i)}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              <span>{o.label}</span>
              {o.value === value && (
                <span className="select-check" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M2.5 6.2l2.5 2.5L9.5 3.7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
