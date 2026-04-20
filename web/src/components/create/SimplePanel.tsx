'use client';
import { useState } from 'react';
import type { AdvancedFormValues, CreateMode, SimplePromptEntry } from '@/types';
import { Seg } from '@/components/ui/Seg';
import { Select } from '@/components/ui/Select';
import { Chip } from '@/components/ui/Chip';
import { SIMPLE_EXAMPLES, SIMPLE_INSPIRATION, SIMPLE_MODELS } from '@/lib/data';

interface SimplePanelProps {
  onStartBatch: (values: AdvancedFormValues) => void;
  onSwitchMode: (mode: CreateMode) => void;
}

export function SimplePanel({ onStartBatch, onSwitchMode }: SimplePanelProps) {
  const [promptMode, setPromptMode] = useState<'single' | 'multi'>('single');
  const [description, setDescription] = useState('');
  const [prompts, setPrompts] = useState<SimplePromptEntry[]>([
    { id: 'sp1', text: '' },
    { id: 'sp2', text: '' },
  ]);
  const [vocalType, setVocalType] = useState<'vocal' | 'instrumental'>('vocal');
  const [tags, setTags] = useState<string[]>([]);
  const [count, setCount] = useState(4);
  const [model, setModel] = useState('V4_5ALL');

  const apiCalls = Math.ceil(count / 2);
  const credits = apiCalls * 12;
  const isMulti = promptMode === 'multi';
  const nonEmptyPrompts = prompts.filter(p => p.text.trim());
  const canSubmit = isMulti ? nonEmptyPrompts.length > 0 : description.trim().length > 0;

  const pickRandom = () => {
    setDescription(SIMPLE_EXAMPLES[Math.floor(Math.random() * SIMPLE_EXAMPLES.length)]);
  };

  const addPrompt = () => {
    if (prompts.length >= 10) return;
    setPrompts(ps => [...ps, { id: `sp${Date.now()}`, text: '' }]);
  };
  const removePrompt = (id: string) => {
    if (prompts.length <= 1) return;
    setPrompts(ps => ps.filter(p => p.id !== id));
  };
  const updatePrompt = (id: string, text: string) => {
    setPrompts(ps => ps.map(p => p.id === id ? { ...p, text } : p));
  };
  const toggleTag = (t: string) => {
    setTags(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t]);
  };

  const submit = () => {
    if (!canSubmit) return;
    const styleSuffix = tags.length ? '. ' + tags.join(', ') : '';
    const values: AdvancedFormValues = {
      promptMode,
      title: (description.slice(0, 40) || 'Simple Prompt').trim(),
      style: (description + styleSuffix).trim(),
      lyrics: '',
      prompts: nonEmptyPrompts.map((p, i) => ({
        id: p.id,
        title: (p.text.slice(0, 40) || `Prompt ${i + 1}`).trim(),
        style: (p.text + styleSuffix).trim(),
        lyrics: '',
      })),
      vocalType,
      vocalGender: 'f',
      negativeTags: '',
      weirdness: 50,
      styleInfluence: 50,
      count,
      model,
      inspirationTags: tags,
      origin: 'simple',
    };
    onStartBatch(values);
  };

  return (
    <div>
      {/* Header */}
      <div className="section" style={{ paddingBottom: 20 }}>
        <div className="flex justify-between items-end gap-6">
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 10 }}>Session · Simple Mode</div>
            <h1 className="h-display">Make a new set of tracks</h1>
            <p className="hint" style={{ marginTop: 8, maxWidth: 560 }}>
              Set up your prompts, choose a model, and create as many tracks as you need.
            </p>
          </div>
          <div className="seg">
            <button type="button" className="on">Simple</button>
            <button type="button" onClick={() => onSwitchMode('advanced')}>Advanced</button>
          </div>
        </div>
      </div>

      {/* Prompt mode toggle */}
      <div className="section" style={{ paddingTop: 20, paddingBottom: 20 }}>
        <div className="flex gap-5 items-center justify-between">
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Prompt Mode</div>
            <div className="hint" style={{ maxWidth: 420 }}>
              {isMulti
                ? 'Enter multiple prompts — the total track count is split across them.'
                : 'Generate every track from a single one-line description.'}
            </div>
          </div>
          <Seg
            options={[{ value: 'single', label: 'Single Prompt' }, { value: 'multi', label: 'Multi-Prompt' }]}
            value={promptMode}
            onChange={setPromptMode}
          />
        </div>
      </div>

      {/* Prompt body */}
      {!isMulti ? (
        <div className="section">
          <div className="section-head">
            <h2>Prompt</h2>
            <span className="muted">SINGLE</span>
          </div>
          <div className="field">
            <div className="label">
              <span>One-line description</span>
              <span className="count tnum">{description.length}/500</span>
            </div>
            <textarea
              className="textarea"
              placeholder="e.g. Lo-fi hip-hop for a pre-dawn drive"
              value={description} maxLength={500}
              onChange={e => setDescription(e.target.value)}
            />
            <div style={{ marginTop: 10 }}>
              <button type="button" className="btn sm" onClick={pickRandom}>⚂ Insert random example</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="section">
          <div className="section-head">
            <h2>Prompts</h2>
            <span className="muted">
              {prompts.length} × {prompts.length > 0 ? Math.floor(count / prompts.length) : 0} each = {count} tracks total
            </span>
          </div>
          <div>
            {prompts.map((p, i) => (
              <div className="prompt-row" key={p.id}>
                <div className="idx mono">#{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <textarea
                    className="textarea"
                    placeholder={`Prompt ${i + 1}`}
                    value={p.text} maxLength={500}
                    onChange={e => updatePrompt(p.id, e.target.value)}
                    style={{ minHeight: 60 }}
                  />
                </div>
                <button
                  type="button"
                  className="del"
                  onClick={() => removePrompt(p.id)}
                  disabled={prompts.length <= 1}
                  style={{ opacity: prompts.length <= 1 ? 0.3 : 1 }}
                >×</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
            <button type="button" className="btn sm" onClick={addPrompt} disabled={prompts.length >= 10}>+ Add prompt</button>
            <span className="hint">Max 10</span>
          </div>
        </div>
      )}

      {/* Constraints */}
      <div className="section">
        <div className="section-head"><h2>Generation Constraints</h2></div>
        <div className="field">
          <div className="label"><span>Vocal Type</span></div>
          <Seg
            options={[{ value: 'vocal', label: 'Vocal' }, { value: 'instrumental', label: 'Instrumental' }]}
            value={vocalType}
            onChange={setVocalType}
          />
        </div>
      </div>

      {/* Inspiration */}
      <div className="section">
        <div className="section-head">
          <h2>Inspiration Tags</h2>
          <span className="muted">{tags.length} SELECTED</span>
        </div>
        <div className="tag-wall">
          {SIMPLE_INSPIRATION.map(t => (
            <Chip key={t} on={tags.includes(t)} onClick={() => toggleTag(t)}>{t}</Chip>
          ))}
        </div>
      </div>

      {/* Run settings */}
      <div className="section">
        <div className="section-head">
          <h2>Run Settings</h2>
          <span className="muted">{apiCalls} REQUEST{apiCalls > 1 ? 'S' : ''} · {count} TRACK{count > 1 ? 'S' : ''}</span>
        </div>

        <div className="field-row" style={{ marginBottom: 20 }}>
          <div className="field">
            <div className="label"><span>Track Count</span><span className="count tnum">{count}</span></div>
            <div className="slider-wrap">
              <input
                type="range" className="slider"
                min="1" max="100" step="1" value={count}
                onChange={e => setCount(parseInt(e.target.value, 10))}
              />
              <div className="slider-foot">
                {['1', '25', '50', '75', '100'].map(v => <span key={v}>{v}</span>)}
              </div>
            </div>
          </div>
          <div className="field">
            <div className="label"><span>Model</span></div>
            <Select value={model} onChange={setModel} options={SIMPLE_MODELS} />
          </div>
        </div>

        {count > 10 && (
          <div className="flex flex-col gap-1.5 mb-3">
            <div className="warn-line"><span className="warn-dot" /> Large track counts may take a while to finish.</div>
            {count > 50 && (
              <div className="warn-line err"><span className="warn-dot" /> Some tracks may fail during large runs.</div>
            )}
          </div>
        )}

        <div className="flex gap-3 items-center justify-between mt-1.5">
          <div className="hint" style={{ maxWidth: 420 }}>
            Requests: <span className="mono tnum" style={{ color: 'var(--fg-1)' }}>{apiCalls}</span>
            <span style={{ margin: '0 10px', color: 'var(--fg-3)' }}>·</span>
            Est. credits: <span className="mono tnum" style={{ color: 'var(--accent)' }}>{credits}</span>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn ghost">Save Preset</button>
            <button type="button" className="btn primary" onClick={submit} disabled={!canSubmit}>
              {`Create · ${count} tracks · ${credits} credits`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
