'use client';
import type { View } from '@/types';
import s from './Shell.module.css';

interface NavProps {
  view: View;
  onNav: (v: View) => void;
  trackCount: number;
  favCount: number;
  runningCount: number;
}

export function Nav({ view, onNav, trackCount, favCount, runningCount }: NavProps) {
  const item = (key: View, label: string, badge?: number | string | null) => (
    <button
      key={key}
      className={`${s.navItem}${view === key ? ` ${s.active}` : ''}`}
      onClick={() => onNav(key)}
    >
      <span>{label}</span>
      {badge != null && <span className={s.badge}>{badge}</span>}
    </button>
  );

  return (
    <nav className={`${s.nav} scroll`}>
      <div className={s.navSec}>Workspace</div>
      {item('create', 'Create')}
      {item('generating', 'Generating', runningCount || null)}
      {item('library', 'Library', trackCount)}

      <div className={s.navSec}>Collections</div>
      <button className={s.navItem}>
        <span>Favorites</span>
        <span className={s.badge}>{favCount}</span>
      </button>
      <button className={s.navItem}>
        <span>Recent</span>
        <span className={s.badge}>24h</span>
      </button>
      <button className={s.navItem}><span>Instrumentals</span></button>

      <div className={s.navSec}>Presets</div>
      <button className={s.navItem}><span>Lo-fi Study</span></button>
      <button className={s.navItem}><span>Dream-pop</span></button>
      <button className={s.navItem}><span>Ambient Drone</span></button>
      <button className={s.navItem}><span>+ New Preset</span></button>

      <div className={s.navFoot}>
        v0.4.2 · Suno V5.5<br />
        Next.js 14 · SQLite<br />
        <span style={{ color: 'var(--accent)' }}>●</span> sunoapi.org
      </div>
    </nav>
  );
}
