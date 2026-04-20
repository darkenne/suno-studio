// simplePanel.jsx — Simple mode: quick-prompt create, routes through the same batch flow as Advanced

const SIMPLE_EXAMPLES = [
  "Lo-fi hip-hop for a pre-dawn drive",
  "Jazz piano for a rainy afternoon cafe",
  "Intense orchestral score for a boss battle",
  "Upbeat pop for a summer beach day",
  "Ambient soundscape for meditation",
];

const SIMPLE_INSPIRATION = [
  "Danceable beat", "Ambient trance", "Heartfelt delivery", "Feel-good",
  "Emotional", "Energetic", "Dreamy", "Calm", "Upbeat", "Warm",
];

const SIMPLE_MODELS = [
  { value: "V4_5ALL",  label: "V4.5 ALL · Default" },
  { value: "V4_5",     label: "V4.5" },
  { value: "V4_5PLUS", label: "V4.5 PLUS" },
  { value: "V5",       label: "V5" },
  { value: "V4",       label: "V4" },
];

function SimplePanel({ onStartBatch, onSwitchMode }) {
  const [promptMode, setPromptMode] = React.useState("single");
  const [description, setDescription] = React.useState("");
  const [prompts, setPrompts] = React.useState([
    { id: "sp1", text: "" },
    { id: "sp2", text: "" },
  ]);
  const [vocalType, setVocalType] = React.useState("vocal");
  const [tags, setTags] = React.useState([]);
  const [count, setCount] = React.useState(4);
  const [model, setModel] = React.useState("V4_5ALL");

  const apiCalls = Math.ceil(count / 2);
  const credits = count * 5;
  const isMulti = promptMode === "multi";

  const nonEmptyPrompts = prompts.filter(p => p.text.trim());
  const canSubmit = isMulti
    ? nonEmptyPrompts.length > 0
    : description.trim().length > 0;

  const pickRandomExample = () => {
    const picked = SIMPLE_EXAMPLES[Math.floor(Math.random() * SIMPLE_EXAMPLES.length)];
    setDescription(picked);
  };

  const addPrompt = () => {
    if (prompts.length >= 10) return;
    setPrompts(ps => [...ps, { id: `sp${Date.now()}`, text: "" }]);
  };
  const removePrompt = (id) => {
    if (prompts.length <= 1) return;
    setPrompts(ps => ps.filter(p => p.id !== id));
  };
  const updatePrompt = (id, text) => {
    setPrompts(ps => ps.map(p => p.id === id ? { ...p, text } : p));
  };

  const toggleTag = (t) => {
    setTags(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t]);
  };

  // Normalize Simple form into the shape the shared batch runner expects.
  const submit = () => {
    if (!canSubmit) return;
    const styleSuffix = tags.length ? ". " + tags.join(", ") : "";

    const values = {
      promptMode,
      // Single-mode fields
      title: (description.slice(0, 40) || "Simple Prompt").trim(),
      style: (description + styleSuffix).trim(),
      lyrics: "",
      // Multi-mode fields
      prompts: nonEmptyPrompts.map((p, i) => ({
        id: p.id,
        title: (p.text.slice(0, 40) || `Prompt ${i + 1}`).trim(),
        style: (p.text + styleSuffix).trim(),
        lyrics: "",
      })),
      // Shared constraints (defaults for any Advanced-only fields)
      vocalType,
      vocalGender: "f",
      negativeTags: "",
      weirdness: 50,
      styleInfluence: 50,
      count,
      model,
      inspirationTags: tags,
      // Provenance flag
      origin: "simple",
    };
    onStartBatch(values);
  };

  return (
    <div className="main scroll">
      {/* Header */}
      <div className="section" style={{ paddingBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 10 }}>Session · Simple Mode</div>
            <h1 className="h-display">Make a new set of tracks</h1>
            <p className="hint" style={{ marginTop: 8, maxWidth: 560 }}>
              Set up your prompts, choose a model, and create as many tracks as you need.
            </p>
          </div>
          <div className="seg">
            <button className="on">Simple</button>
            <button onClick={() => onSwitchMode && onSwitchMode("advanced")}>Advanced</button>
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
                ? "Enter multiple prompts — the total track count is split across them."
                : "Generate every track from a single one-line description."}
            </div>
          </div>
          <Seg
            options={[
              { value: "single", label: "Single Prompt" },
              { value: "multi", label: "Multi-Prompt" },
            ]}
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
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div style={{ marginTop: 10 }}>
              <button className="btn sm" onClick={pickRandomExample}>
                ⚂ Insert random example
              </button>
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
                <div className="idx mono">
                  #{String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <textarea
                    className="textarea"
                    placeholder={`Prompt ${i + 1}`}
                    value={p.text}
                    maxLength={500}
                    onChange={(e) => updatePrompt(p.id, e.target.value)}
                    style={{ minHeight: 60 }}
                  />
                </div>
                <button
                  className="del"
                  onClick={() => removePrompt(p.id)}
                  disabled={prompts.length <= 1}
                  title={prompts.length <= 1 ? "At least one prompt required" : "Remove"}
                  style={{ opacity: prompts.length <= 1 ? 0.3 : 1 }}
                >×</button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn sm" onClick={addPrompt} disabled={prompts.length >= 10}>
              + Add prompt
            </button>
            <span className="hint">Max 10</span>
          </div>
        </div>
      )}

      {/* Generation Constraints */}
      <div className="section">
        <div className="section-head">
          <h2>Generation Constraints</h2>
        </div>
        <div className="field">
          <div className="label"><span>Vocal Type</span></div>
          <Seg
            options={[
              { value: "vocal", label: "Vocal" },
              { value: "instrumental", label: "Instrumental" },
            ]}
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
            <Chip key={t} on={tags.includes(t)} onClick={() => toggleTag(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      {/* Run Settings — unified with Advanced */}
      <div className="section">
        <div className="section-head">
          <h2>Run Settings</h2>
          <span className="muted">{apiCalls} REQUEST{apiCalls > 1 ? "S" : ""} · {count} TRACK{count > 1 ? "S" : ""}</span>
        </div>

        <div className="field-row" style={{ marginBottom: 20 }}>
          <div className="field">
            <div className="label"><span>Track Count</span><span className="count tnum">{count}</span></div>
            <div className="slider-wrap">
              <input
                type="range" className="slider"
                min="1" max="100" step="1"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
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
              value={model}
              onChange={setModel}
              options={SIMPLE_MODELS}
            />
          </div>
        </div>

        {(count > 10 || count > 50) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {count > 10 && (
              <div className="warn-line">
                <span className="warn-dot" /> Large track counts may take a while to finish.
              </div>
            )}
            {count > 50 && (
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
              {count % 2 === 1 ? "last request makes 1" : "2 tracks per request"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn ghost">Save Preset</button>
            <button className="btn primary" onClick={submit} disabled={!canSubmit}>
              {`Create · ${count} tracks · ${credits} credits`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.SimplePanel = SimplePanel;
