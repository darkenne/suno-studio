'use client';
import { useState } from 'react';
import type { AdvancedFormValues, CreateMode, PromptEntry } from '@/types';
import { Slider } from '@/components/ui/Slider';
import { Seg } from '@/components/ui/Seg';
import { Select } from '@/components/ui/Select';
import { Chip } from '@/components/ui/Chip';
import { SinglePromptFields } from './SinglePromptFields';
import { MultiPromptFields } from './MultiPromptFields';
import { INSPIRATION_TAGS, MODEL_OPTIONS } from '@/lib/data';

function defaultValues(): AdvancedFormValues {
  return {
    promptMode: 'single',
    title: '',
    style: '',
    lyrics: '',
    prompts: [
      { id: 'p1', title: '', style: '', lyrics: '' },
    ],
    vocalType: 'vocal',
    vocalGender: 'f',
    negativeTags: '',
    weirdness: 42,
    styleInfluence: 65,
    count: 6,
    model: 'V5_5',
    inspirationTags: [],
  };
}

interface CreatePanelProps {
  onStartBatch: (values: AdvancedFormValues) => void;
  onSwitchMode: (mode: CreateMode) => void;
}

export function CreatePanel({ onStartBatch, onSwitchMode }: CreatePanelProps) {
  const [values, setValues] = useState<AdvancedFormValues>(defaultValues);
  const set = (patch: Partial<AdvancedFormValues>) => setValues(v => ({ ...v, ...patch }));

  const isMulti = values.promptMode === 'multi';
  const validPrompts = values.prompts.filter(p => p.title.trim() || p.style.trim());
  const canSubmit = isMulti ? validPrompts.length > 0 : (values.title.trim() && values.style.trim());
  const apiCalls = Math.ceil(values.count / 2);
  const credits = apiCalls * 12;

  const addPrompt = () =>
    set({ prompts: [...values.prompts, { id: `p${Date.now()}`, title: '', style: '', lyrics: '' }] });

  const removePrompt = (id: string) =>
    set({ prompts: values.prompts.filter(p => p.id !== id) });

  const updatePrompt = (id: string, patch: Partial<PromptEntry>) =>
    set({ prompts: values.prompts.map(p => p.id === id ? { ...p, ...patch } : p) });

  const toggleTag = (tag: string) =>
    set({
      inspirationTags: values.inspirationTags.includes(tag)
        ? values.inspirationTags.filter(t => t !== tag)
        : [...values.inspirationTags, tag],
    });

  return (
    <div>
      {/* Header */}
      <div className="section" style={{ paddingBottom: 20 }}>
        <div className="flex justify-between items-end gap-6">
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 10 }}>Session · Advanced Mode</div>
            <h1 className="h-display">Make a new set of tracks</h1>
            <p className="hint" style={{ marginTop: 8, maxWidth: 560 }}>
              Set up your prompts, choose a model, and create as many tracks as you need.
            </p>
          </div>
          <div className="seg">
            <button type="button" onClick={() => onSwitchMode('simple')}>Simple</button>
            <button type="button" className="on">Advanced</button>
          </div>
        </div>
      </div>

      {/* Prompt mode */}
      <div className="section" style={{ paddingTop: 20, paddingBottom: 20 }}>
        <div className="flex gap-5 items-center justify-between">
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Prompt Mode</div>
            <div className="hint" style={{ maxWidth: 420 }}>
              {isMulti
                ? 'Each prompt gets its share of the total count, distributed evenly.'
                : 'All tracks generated from a single title / style / lyrics.'}
            </div>
          </div>
          <Seg
            options={[
              { value: 'single', label: 'Single Prompt' },
              { value: 'multi', label: 'Multi-Prompt' },
            ]}
            value={values.promptMode}
            onChange={v => set({ promptMode: v })}
          />
        </div>
      </div>

      {!isMulti && <SinglePromptFields values={values} set={set} />}
      {isMulti && (
        <MultiPromptFields
          prompts={values.prompts}
          onAdd={addPrompt}
          onRemove={removePrompt}
          onUpdate={updatePrompt}
          count={values.count}
          instrumental={values.vocalType === 'instrumental'}
        />
      )}

      {/* Constraints */}
      <div className="section">
        <div className="section-head">
          <h2>Generation Constraints</h2>
          <span className="muted">OPTIONAL · DEFAULTS TUNED FOR BALANCE</span>
        </div>

        <div className="field-row" style={{ marginBottom: 28 }}>
          <Slider label="Style Influence" value={values.styleInfluence} onChange={v => set({ styleInfluence: v })} hintLeft="Loose" hintRight="Strict" />
          <Slider label="Weirdness" value={values.weirdness} onChange={v => set({ weirdness: v })} hintLeft="Conventional" hintRight="Experimental" />
        </div>

        <div className="field-row" style={{ marginBottom: 24 }}>
          <div className="field">
            <div className="label"><span>Vocal Type</span></div>
            <Seg
              options={[{ value: 'vocal', label: 'With Vocals' }, { value: 'instrumental', label: 'Instrumental' }]}
              value={values.vocalType}
              onChange={v => set({ vocalType: v })}
            />
          </div>
          <div className="field">
            <div className="label"><span>Vocal Gender</span></div>
            <Seg
              options={[{ value: 'f', label: 'Female' }, { value: 'm', label: 'Male' }]}
              value={values.vocalGender}
              onChange={v => set({ vocalGender: v })}
            />
            {values.vocalType === 'instrumental' && (
              <div className="hint" style={{ marginTop: 2 }}>Ignored for instrumental tracks.</div>
            )}
          </div>
        </div>

        <div className="field">
          <div className="label">
            <span>Negative Tags</span>
            <span className="count">{values.negativeTags.length}/200</span>
          </div>
          <input
            type="text" className="input mono"
            placeholder="e.g. no screaming, no autotune, no dubstep drop"
            value={values.negativeTags} maxLength={200}
            onChange={e => set({ negativeTags: e.target.value })}
          />
        </div>
      </div>

      {/* Inspiration */}
      <div className="section">
        <div className="section-head">
          <h2>Inspiration Tags</h2>
          <span className="muted">{values.inspirationTags.length} SELECTED</span>
        </div>
        <div className="tag-wall">
          {INSPIRATION_TAGS.map(t => (
            <Chip key={t} on={values.inspirationTags.includes(t)} onClick={() => toggleTag(t)}>{t}</Chip>
          ))}
        </div>
      </div>

      {/* Run settings */}
      <div className="section no-underline">
        <div className="section-head">
          <h2>Run Settings</h2>
          <span className="muted">{apiCalls} REQUEST{apiCalls > 1 ? 'S' : ''} · {values.count} TRACK{values.count > 1 ? 'S' : ''}</span>
        </div>

        <div className="field-row" style={{ marginBottom: 20 }}>
          <div className="field">
            <div className="label"><span>Track Count</span><span className="count tnum">{values.count}</span></div>
            <div className="slider-wrap">
              <input
                type="range" className="slider"
                min="1" max="100" step="1" value={values.count}
                onChange={e => set({ count: parseInt(e.target.value, 10) })}
              />
              <div className="slider-foot">
                {['1', '25', '50', '75', '100'].map(v => <span key={v}>{v}</span>)}
              </div>
            </div>
          </div>
          <div className="field">
            <div className="label"><span>Model</span></div>
            <Select value={values.model} onChange={v => set({ model: v })} options={MODEL_OPTIONS} />
          </div>
        </div>

        {values.count > 10 && (
          <div className="flex flex-col gap-1.5 mb-3">
            <div className="warn-line"><span className="warn-dot" /> Large track counts may take a while to finish.</div>
            {values.count > 50 && (
              <div className="warn-line err"><span className="warn-dot" /> Some tracks may fail during large runs.</div>
            )}
          </div>
        )}

        <div className="flex gap-3 items-center justify-between mt-1.5">
          <div className="hint" style={{ maxWidth: 420 }}>
            Requests: <span className="mono tnum" style={{ color: 'var(--fg-1)' }}>{apiCalls}</span>
            <span style={{ margin: '0 10px', color: 'var(--fg-3)' }}>·</span>
            Est. credits: <span className="mono tnum" style={{ color: 'var(--accent)' }}>{credits}</span>
            <span style={{ margin: '0 10px', color: 'var(--fg-3)' }}>·</span>
            <span style={{ color: 'var(--fg-3)' }}>
              {values.count % 2 === 1 ? 'last request makes 1' : '2 tracks per request'}
            </span>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn ghost">Save Preset</button>
            <button type="button" className="btn primary" onClick={() => onStartBatch(values)} disabled={!canSubmit}>
              {`Create · ${values.count} tracks · ${credits} credits`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
