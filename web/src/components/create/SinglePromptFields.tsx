'use client';
import type { AdvancedFormValues } from '@/types';

interface Props {
  values: AdvancedFormValues;
  set: (patch: Partial<AdvancedFormValues>) => void;
}

export function SinglePromptFields({ values, set }: Props) {
  const instrumental = values.vocalType === 'instrumental';
  return (
    <div className="section">
      <div className="section-head">
        <h2>Prompt</h2>
        <span className="muted">SINGLE</span>
      </div>
      <div className="flex flex-col gap-[18px]">
        <div className="field">
          <div className="label">
            <span>Title</span>
            <span className="count">{values.title.length}/100</span>
          </div>
          <input
            type="text" className="input"
            placeholder="e.g. Lantern Fields at 3AM"
            value={values.title} maxLength={100}
            onChange={e => set({ title: e.target.value })}
          />
        </div>

        <div className="field">
          <div className="label">
            <span>Style</span>
            <span className="count">{values.style.length}/1000</span>
          </div>
          <textarea
            className="textarea"
            placeholder="lo-fi, late-night drive, pressed tape cassette vibes, warm pads, Rhodes, vinyl crackle, 72 bpm"
            value={values.style} maxLength={1000}
            onChange={e => set({ style: e.target.value })}
          />
        </div>

        <div className="field">
          <div className="label">
            <span>
              Lyrics{' '}
              {instrumental && <span style={{ color: 'var(--fg-3)' }}>· disabled (instrumental)</span>}
            </span>
            <span className="count">{values.lyrics.length}/5000</span>
          </div>
          <textarea
            className="textarea lyrics"
            placeholder={instrumental
              ? 'Instrumental — no lyrics.'
              : '[Verse 1]\nSomething about moths around a streetlamp...\n\n[Chorus]\n...'}
            value={values.lyrics} maxLength={5000}
            disabled={instrumental}
            onChange={e => set({ lyrics: e.target.value })}
            style={{ opacity: instrumental ? 0.4 : 1 }}
          />
        </div>
      </div>
    </div>
  );
}
