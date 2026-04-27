// createPanel.jsx — Advanced mode create form with multi-prompt support

function CreatePanel({ onStartBatch, onSwitchMode, initialValues }) {
  const [values, setValues] = React.useState(initialValues || defaultAdvancedValues());
  const set = (patch) => setValues(v => ({ ...v, ...patch }));

  const promptMode = values.promptMode;
  const isMulti = promptMode === "multi";
  const validPrompts = values.prompts.filter(p => p.title.trim() || p.style.trim());

  const canSubmit = isMulti
    ? validPrompts.length > 0
    : (values.title.trim() && values.style.trim());

  const apiCalls = Math.ceil(values.count / 2);
  const credits = values.count * 5;

  const submit = () => {
    if (!canSubmit) return;
    onStartBatch({ ...values });
  };

  const addPrompt = () => {
    set({
      prompts: [
        ...values.prompts,
        { id: `p${Date.now()}`, title: "", style: "", lyrics: "" }
      ]
    });
  };

  const removePrompt = (id) => {
    set({ prompts: values.prompts.filter(p => p.id !== id) });
  };

  const updatePrompt = (id, patch) => {
    set({
      prompts: values.prompts.map(p => p.id === id ? { ...p, ...patch } : p)
    });
  };

  const toggleTag = (tag) => {
    set({
      inspirationTags: values.inspirationTags.includes(tag)
        ? values.inspirationTags.filter(t => t !== tag)
        : [...values.inspirationTags, tag]
    });
  };

  return (
    <div className="main scroll">
      {/* Header */}
      <div className="section" style={{ paddingBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 10 }}>Session · Advanced Mode</div>
            <h1 className="h-display">Make a new set of tracks</h1>
            <p className="hint" style={{ marginTop: 8, maxWidth: 560 }}>
              Set up your prompts, choose a model, and create as many tracks as you need.
            </p>
          </div>
          <div className="seg">
            <button onClick={() => onSwitchMode && onSwitchMode("simple")}>Simple</button>
            <button className="on">Advanced</button>
          </div>
        </div>
      </div>

      {/* Prompt mode toggle */}
      <div className="section" style={{ paddingTop: 20, paddingBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Prompt Mode</div>
            <div className="hint" style={{ maxWidth: 420 }}>
              {isMulti
                ? "Each prompt gets its share of the total count, distributed evenly."
                : "All tracks generated from a single title / style / lyrics."}
            </div>
          </div>
          <Seg
            options={[
              { value: "single", label: "Single Prompt" },
              { value: "multi", label: "Multi-Prompt" },
            ]}
            value={promptMode}
            onChange={(v) => set({ promptMode: v })}
          />
        </div>
      </div>

      {/* Prompt body */}
      {!isMulti && <SinglePromptFields values={values} set={set} />}
      {isMulti && (
        <MultiPromptFields
          prompts={values.prompts}
          onAdd={addPrompt}
          onRemove={removePrompt}
          onUpdate={updatePrompt}
          count={values.count}
          instrumental={values.vocalType === "instrumental"}
        />
      )}

      {/* Constraints */}
      <div className="section">
        <div className="section-head">
          <h2>Generation Constraints</h2>
          <span className="muted">OPTIONAL · DEFAULTS TUNED FOR BALANCE</span>
        </div>

        <div className="field-row" style={{ marginBottom: 28 }}>
          <Slider
            label="Style Influence"
            value={values.styleInfluence}
            onChange={(v) => set({ styleInfluence: v })}
            hintLeft="Loose"
            hintRight="Strict"
          />
          <Slider
            label="Weirdness"
            value={values.weirdness}
            onChange={(v) => set({ weirdness: v })}
            hintLeft="Conventional"
            hintRight="Experimental"
          />
        </div>

        <div className="field-row" style={{ marginBottom: 24 }}>
          <div className="field">
            <div className="label"><span>Vocal Type</span></div>
            <Seg
              options={[
                { value: "vocal", label: "Vocal" },
                { value: "instrumental", label: "Instrumental" },
              ]}
              value={values.vocalType}
              onChange={(v) => set({ vocalType: v })}
            />
          </div>
          <div className="field">
            <div className="label"><span>Vocal Gender</span></div>
            <Seg
              options={[
                { value: "f", label: "Female" },
                { value: "m", label: "Male" },
              ]}
              value={values.vocalGender}
              onChange={(v) => set({ vocalGender: v })}
            />
            {values.vocalType === "instrumental" && (
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
            type="text"
            className="input mono"
            placeholder="e.g. no screaming, no autotune, no dubstep drop"
            value={values.negativeTags}
            maxLength={200}
            onChange={(e) => set({ negativeTags: e.target.value })}
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
          {window.INSPIRATION_TAGS.map(t => (
            <Chip key={t} on={values.inspirationTags.includes(t)} onClick={() => toggleTag(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      {/* Runtime */}
      <div className="section">
        <div className="section-head">
          <h2>Run Settings</h2>
          <span className="muted">{apiCalls} REQUEST{apiCalls > 1 ? "S" : ""} · {values.count} TRACK{values.count > 1 ? "S" : ""}</span>
        </div>

        <div className="field-row" style={{ marginBottom: 20 }}>
          <div className="field">
            <div className="label"><span>Track Count</span><span className="count tnum">{values.count}</span></div>
            <div className="slider-wrap">
              <input
                type="range" className="slider"
                min="1" max="100" step="1"
                value={values.count}
                onChange={(e) => set({ count: parseInt(e.target.value, 10) })}
              />
              <div className="slider-foot">
                <span>1</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
          </div>
          <div className="field">
            <div className="label"><span>Model</span></div>
            <Select
              value={values.model}
              onChange={(v) => set({ model: v })}
              options={window.MODEL_OPTIONS}
            />
          </div>
        </div>

        {(values.count > 10 || values.count > 50) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {values.count > 10 && (
              <div className="warn-line">
                <span className="warn-dot" /> Large track counts may take a while to finish.
              </div>
            )}
            {values.count > 50 && (
              <div className="warn-line err">
                <span className="warn-dot" /> Some tracks may fail during large runs.
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <div className="hint" style={{ maxWidth: 420 }}>
            Requests: <span className="mono tnum" style={{ color: "var(--fg-1)" }}>{apiCalls}</span>
            <span style={{ margin: "0 10px", color: "var(--fg-3)" }}>·</span>
            Est. credits: <span className="mono tnum" style={{ color: "var(--accent)" }}>{credits}</span>
            <span style={{ margin: "0 10px", color: "var(--fg-3)" }}>·</span>
            <span style={{ color: "var(--fg-3)" }}>
              {values.count % 2 === 1 ? "last request makes 1" : "2 tracks per request"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn ghost">Save Preset</button>
            <button className="btn primary" onClick={submit} disabled={!canSubmit}>
              {`Create · ${values.count} tracks · ${credits} credits`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SinglePromptFields({ values, set }) {
  const instrumental = values.vocalType === "instrumental";
  return (
    <div className="section">
      <div className="section-head">
        <h2>Prompt</h2>
        <span className="muted">SINGLE</span>
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        <div className="field">
          <div className="label">
            <span>Title</span>
            <span className="count">{values.title.length}/100</span>
          </div>
          <input
            type="text" className="input"
            placeholder="e.g. Lantern Fields at 3AM"
            value={values.title}
            maxLength={100}
            onChange={(e) => set({ title: e.target.value })}
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
            value={values.style}
            maxLength={1000}
            onChange={(e) => set({ style: e.target.value })}
          />
        </div>

        <div className="field">
          <div className="label">
            <span>Lyrics {instrumental && <span style={{ color: "var(--fg-3)" }}>· disabled (instrumental)</span>}</span>
            <span className="count">{values.lyrics.length}/5000</span>
          </div>
          <textarea
            className="textarea lyrics"
            placeholder={instrumental ? "Instrumental — no lyrics." : "[Verse 1]\nSomething about moths around a streetlamp...\n\n[Chorus]\n..."}
            value={values.lyrics}
            maxLength={5000}
            disabled={instrumental}
            onChange={(e) => set({ lyrics: e.target.value })}
            style={{ opacity: instrumental ? 0.4 : 1 }}
          />
        </div>
      </div>
    </div>
  );
}

function MultiPromptFields({ prompts, onAdd, onRemove, onUpdate, count, instrumental }) {
  const perPrompt = prompts.length > 0 ? Math.floor(count / prompts.length) : 0;
  const remainder = prompts.length > 0 ? count % prompts.length : 0;
  const distribution = prompts.map((_, i) => perPrompt + (i < remainder ? 1 : 0));

  return (
    <div className="section">
      <div className="section-head">
        <h2>Prompts</h2>
        <span className="muted">
          {prompts.length} PROMPT{prompts.length !== 1 ? "S" : ""} · DISTRIBUTED [{distribution.join(", ")}]
        </span>
      </div>

      <div>
        {prompts.map((p, i) => (
          <div className="prompt-row" key={p.id}>
            <div className="idx mono">
              #{String(i + 1).padStart(2, "0")}
              <div style={{ marginTop: 4, color: "var(--accent)" }}>
                {distribution[i]}×
              </div>
            </div>
            <div>
              <input
                type="text" className="input"
                placeholder={`Title for prompt ${i + 1}`}
                value={p.title}
                maxLength={100}
                onChange={(e) => onUpdate(p.id, { title: e.target.value })}
              />
              <div className="prompt-subrow">
                <textarea
                  className="textarea"
                  placeholder="Style..."
                  value={p.style}
                  maxLength={1000}
                  onChange={(e) => onUpdate(p.id, { style: e.target.value })}
                  style={{ minHeight: 64 }}
                />
                <textarea
                  className="textarea lyrics"
                  placeholder={instrumental ? "Instrumental" : "Lyrics (optional)"}
                  value={p.lyrics || ""}
                  maxLength={5000}
                  disabled={instrumental}
                  onChange={(e) => onUpdate(p.id, { lyrics: e.target.value })}
                  style={{ minHeight: 64, opacity: instrumental ? 0.4 : 1 }}
                />
              </div>
            </div>
            <button className="del" onClick={() => onRemove(p.id)} title="Remove">×</button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="btn sm" onClick={onAdd}>+ Add Prompt</button>
      </div>
    </div>
  );
}

function defaultAdvancedValues() {
  return {
    promptMode: "single",
    title: "",
    style: "",
    lyrics: "",
    prompts: [
      { id: "p1", title: "", style: "", lyrics: "" },
      { id: "p2", title: "", style: "", lyrics: "" },
      { id: "p3", title: "", style: "", lyrics: "" },
    ],
    vocalType: "vocal",
    vocalGender: "f",
    negativeTags: "",
    weirdness: 42,
    styleInfluence: 65,
    count: 6,
    model: "V5_5",
    inspirationTags: [],
  };
}

window.CreatePanel = CreatePanel;
window.defaultAdvancedValues = defaultAdvancedValues;
