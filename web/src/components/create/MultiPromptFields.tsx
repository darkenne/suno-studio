'use client';
import type { PromptEntry } from '@/types';

interface Props {
  prompts: PromptEntry[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<PromptEntry>) => void;
  count: number;
  instrumental: boolean;
}

export function MultiPromptFields({ prompts, onAdd, onRemove, onUpdate, count, instrumental }: Props) {
  const perPrompt = prompts.length > 0 ? Math.floor(count / prompts.length) : 0;
  const remainder = prompts.length > 0 ? count % prompts.length : 0;
  const distribution = prompts.map((_, i) => perPrompt + (i < remainder ? 1 : 0));

  return (
    <div className="section">
      <div className="section-head">
        <h2>Prompts</h2>
        <span className="muted">
          {prompts.length} PROMPT{prompts.length !== 1 ? 'S' : ''} · DISTRIBUTED [{distribution.join(', ')}]
        </span>
      </div>

      <div>
        {prompts.map((p, i) => (
          <div className="prompt-row" key={p.id}>
            <div className="idx mono">
              #{String(i + 1).padStart(2, '0')}
              <div style={{ marginTop: 4, color: 'var(--accent)' }}>{distribution[i]}×</div>
            </div>
            <div>
              <input
                type="text" className="input"
                placeholder={`Title for prompt ${i + 1}`}
                value={p.title} maxLength={100}
                onChange={e => onUpdate(p.id, { title: e.target.value })}
              />
              <div className="prompt-subrow">
                <textarea
                  className="textarea"
                  placeholder="Style..."
                  value={p.style} maxLength={1000}
                  onChange={e => onUpdate(p.id, { style: e.target.value })}
                  style={{ minHeight: 64 }}
                />
                <textarea
                  className="textarea lyrics"
                  placeholder={instrumental ? 'Instrumental' : 'Lyrics (optional)'}
                  value={p.lyrics ?? ''}
                  maxLength={5000}
                  disabled={instrumental}
                  onChange={e => onUpdate(p.id, { lyrics: e.target.value })}
                  style={{ minHeight: 64, opacity: instrumental ? 0.4 : 1 }}
                />
              </div>
            </div>
            <button className="del" onClick={() => onRemove(p.id)} title="Remove">×</button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button type="button" className="btn sm" onClick={onAdd}>+ Add Prompt</button>
      </div>
    </div>
  );
}
