'use client';

interface SegOption<T extends string> {
  value: T;
  label: string;
}

interface SegProps<T extends string> {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  accent?: boolean;
}

export function Seg<T extends string>({ options, value, onChange, accent = false }: SegProps<T>) {
  return (
    <div className={`seg${accent ? ' accent' : ''}`}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={value === opt.value ? 'on' : ''}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
