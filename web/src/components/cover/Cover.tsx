'use client';
import { useMemo, useState } from 'react';
import { hashStr, rng } from '@/lib/utils';
import type { Track } from '@/types';

interface CoverProps {
  track: Track;
  size?: number;
}

export function Cover({ track, size = 44 }: CoverProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const seed = useMemo(() => hashStr(track.id || track.sunoId || 'x'), [track.id, track.sunoId]);
  const variant = seed % 7;

  if (track.imageUrl && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={track.imageUrl}
        alt={track.title}
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
        style={{ display: 'block', width: size, height: size, objectFit: 'cover' }}
      />
    );
  }
  const [c1, c2, c3] = track.palette;
  const rand = rng(seed);
  const id = `cov-${track.id}`;
  const common = { width: size, height: size, viewBox: '0 0 100 100', style: { display: 'block' as const } };

  switch (variant) {
    case 0: {
      return (
        <svg {...common}>
          <rect width="100" height="100" fill={c2} />
          {[42, 32, 22, 12].map((r, i) => (
            <circle key={i} cx="30" cy="70" r={r} fill="none" stroke={i % 2 ? c1 : c3} strokeWidth="2.5" />
          ))}
        </svg>
      );
    }
    case 1: {
      const bars = Array.from({ length: 7 }, () => rand());
      return (
        <svg {...common}>
          <rect width="100" height="100" fill={c2} />
          {bars.map((b, i) => (
            <rect key={i} x={8} y={10 + i * 11} width={10 + b * 80} height={6} fill={i % 3 === 0 ? c1 : c3} />
          ))}
        </svg>
      );
    }
    case 2: {
      return (
        <svg {...common}>
          <rect width="100" height="100" fill={c2} />
          {Array.from({ length: 36 }).map((_, i) => {
            const col = i % 6, row = Math.floor(i / 6);
            const r = rand() * 4 + 1;
            return <circle key={i} cx={10 + col * 16} cy={10 + row * 16} r={r} fill={row % 2 ? c1 : c3} />;
          })}
        </svg>
      );
    }
    case 3: {
      return (
        <svg {...common}>
          <defs>
            <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <rect width="14" height="14" fill={c2} />
              <rect x="0" width="6" height="14" fill={c3} />
              <rect x="6" width="2" height="14" fill={c1} />
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#${id})`} />
        </svg>
      );
    }
    case 4: {
      return (
        <svg {...common}>
          <rect width="100" height="50" fill={c2} />
          <rect y="50" width="100" height="50" fill={c3} />
          <circle cx="50" cy="50" r="22" fill={c1} />
          {[72, 80, 88].map((y, i) => (
            <rect key={i} y={y} width="100" height="1.5" fill={c1} opacity={0.7 - i * 0.2} />
          ))}
        </svg>
      );
    }
    case 5: {
      return (
        <svg {...common}>
          <rect width="100" height="100" fill={c2} />
          <polygon points="0,100 30,40 55,100" fill={c3} />
          <polygon points="35,100 65,25 100,100" fill={c1} />
          <circle cx="78" cy="22" r="6" fill={c3} />
        </svg>
      );
    }
    default: {
      const bars = Array.from({ length: 14 }, () => rand());
      return (
        <svg {...common}>
          <rect width="100" height="100" fill={c2} />
          {bars.map((b, i) => {
            const h = 16 + b * 68;
            return <rect key={i} x={6 + i * 6.4} y={50 - h / 2} width={4} height={h} fill={i % 3 === 0 ? c1 : c3} rx="1" />;
          })}
        </svg>
      );
    }
  }
}
