'use client';
import type { AccentKey, FontPair } from '@/types';
import { Select } from '@/components/ui/Select';
import s from './Shell.module.css';

const ACCENTS: { key: AccentKey; color: string }[] = [
  { key: 'lime',    color: 'oklch(0.88 0.22 130)' },
  { key: 'amber',   color: 'oklch(0.83 0.18 70)' },
  { key: 'cyan',    color: 'oklch(0.85 0.16 210)' },
  { key: 'magenta', color: 'oklch(0.78 0.25 340)' },
  { key: 'coral',   color: 'oklch(0.78 0.20 30)' },
];

const FONT_OPTIONS = [
  { value: 'mono-sans',   label: 'Inter Tight + JetBrains Mono' },
  { value: 'serif-mono',  label: 'Fraunces + JetBrains Mono' },
  { value: 'grotesk-mono',label: 'Space Grotesk + IBM Plex Mono' },
  { value: 'neue-mono',   label: 'Inter Tight + IBM Plex Mono' },
];

interface TweaksProps {
  open: boolean;
  onClose: () => void;
  accent: AccentKey;
  setAccent: (a: AccentKey) => void;
  fontPair: FontPair;
  setFontPair: (f: FontPair) => void;
}

export function Tweaks({ open, onClose, accent, setAccent, fontPair, setFontPair }: TweaksProps) {
  if (!open) return null;
  return (
    <div className={s.tweaks}>
      <div className="flex justify-between items-center">
        <h3 className={s.tweaksTitle}>Tweaks</h3>
        <button onClick={onClose} style={{ color: 'var(--fg-3)', fontSize: 14 }}>×</button>
      </div>
      <div>
        <div className="label" style={{ marginBottom: 8 }}><span>Accent</span></div>
        <div className={s.swatches}>
          {ACCENTS.map(a => (
            <button
              key={a.key}
              type="button"
              className={`${s.swatch}${accent === a.key ? ` ${s.on}` : ''}`}
              style={{ background: a.color }}
              onClick={() => setAccent(a.key)}
              title={a.key}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="label" style={{ marginBottom: 8 }}><span>Font Pairing</span></div>
        <Select
          value={fontPair}
          onChange={v => setFontPair(v as FontPair)}
          options={FONT_OPTIONS}
        />
      </div>
      <div className="hint" style={{ marginTop: 4 }}>Changes apply immediately.</div>
    </div>
  );
}
