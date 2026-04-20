// covers.jsx — deterministic generative cover art per track
// Pattern picked from track.id hash; colors from track.palette.

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function Cover({ track, size = 44, animated = false }) {
  const seed = React.useMemo(() => hashStr(track.id || track.sunoId || "x"), [track.id, track.sunoId]);
  const variant = seed % 7;
  const [c1, c2, c3] = track.palette || ["#d4e85c", "#1d2a14", "#6a7a3a"];
  const r = rng(seed);
  const id = `cov-${track.id}`;

  const common = { width: size, height: size, viewBox: "0 0 100 100", style: { display: "block" } };

  switch (variant) {
    case 0: {
      // concentric arcs
      return (
        <svg {...common}>
          <rect width="100" height="100" fill={c2} />
          {[42, 32, 22, 12].map((rr, i) => (
            <circle key={i} cx="30" cy="70" r={rr} fill="none" stroke={i % 2 ? c1 : c3} strokeWidth="2.5" />
          ))}
        </svg>
      );
    }
    case 1: {
      // stacked horizontal bars
      const bars = Array.from({ length: 7 }, () => r());
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
      // grid of dots
      return (
        <svg {...common}>
          <rect width="100" height="100" fill={c2} />
          {Array.from({ length: 36 }).map((_, i) => {
            const col = i % 6, row = Math.floor(i / 6);
            const rr = r() * 4 + 1;
            return <circle key={i} cx={10 + col * 16} cy={10 + row * 16} r={rr} fill={row % 2 ? c1 : c3} />;
          })}
        </svg>
      );
    }
    case 3: {
      // diagonal gradient stripes
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
      // sunset / horizon
      return (
        <svg {...common}>
          <rect width="100" height="50" fill={c2} />
          <rect y="50" width="100" height="50" fill={c3} />
          <circle cx="50" cy="50" r="22" fill={c1} />
          <rect y="72" width="100" height="1.5" fill={c1} opacity="0.7" />
          <rect y="80" width="100" height="1.5" fill={c1} opacity="0.5" />
          <rect y="88" width="100" height="1.5" fill={c1} opacity="0.3" />
        </svg>
      );
    }
    case 5: {
      // mountain triangles
      return (
        <svg {...common}>
          <rect width="100" height="100" fill={c2} />
          <polygon points="0,100 30,40 55,100" fill={c3} />
          <polygon points="35,100 65,25 100,100" fill={c1} />
          <circle cx="78" cy="22" r="6" fill={c3} />
        </svg>
      );
    }
    case 6:
    default: {
      // waveform bars
      const bars = Array.from({ length: 14 }, () => r());
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

window.Cover = Cover;
