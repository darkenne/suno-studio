'use client';
import { useMemo } from 'react';
import { rng } from '@/lib/utils';

type WaveState = 'idle' | 'pending' | 'active';

interface WaveformProps {
  state?: WaveState;
  seed?: number;
  bars?: number;
  height?: number;
}

export function Waveform({ state = 'idle', seed = 1, bars = 48, height = 36 }: WaveformProps) {
  const values = useMemo(() => {
    const rand = rng(seed);
    return Array.from({ length: bars }, (_, i) => {
      const base = 0.2 + rand() * 0.8;
      const env = Math.sin((i / bars) * Math.PI) * 0.6 + 0.4;
      return base * env;
    });
  }, [seed, bars]);

  return (
    <div className={`wave ${state}`} style={{ height }}>
      {values.map((v, i) => (
        <div
          key={i}
          className="b"
          style={{
            height: `${Math.max(6, v * 100)}%`,
            animationDelay: state === 'pending' ? `${(i % 7) * 120}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}
