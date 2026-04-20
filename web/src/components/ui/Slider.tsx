'use client';

interface SliderProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  unit?: string;
  hintLeft?: string;
  hintRight?: string;
}

export function Slider({
  value, onChange, min = 0, max = 100, step = 1,
  label, unit = '%', hintLeft, hintRight,
}: SliderProps) {
  return (
    <div className="field">
      <div className="label">
        <span>{label}</span>
        <span className="slider-value tnum">{value}{unit}</span>
      </div>
      <div className="slider-wrap">
        <div className="slider-track-wrap">
          <div className="slider-ticks">
            {Array.from({ length: 10 }).map((_, i) => <div className="t" key={i} />)}
          </div>
          <input
            type="range"
            className="slider"
            value={value}
            min={min} max={max} step={step}
            onChange={e => onChange(parseInt(e.target.value, 10))}
          />
        </div>
        <div className="slider-foot">
          <span>{hintLeft}</span>
          <span>{hintRight}</span>
        </div>
      </div>
    </div>
  );
}
