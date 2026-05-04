'use client';
import { useState } from 'react';
import { ChevronDown, Radio } from 'lucide-react';
import type { Playlist, View } from '@/types';
import s from './Shell.module.css';

interface NavProps {
  view: View;
  onNav: (v: View) => void;
  onOpenPlaylist: (id: string) => void;
  onNewPlaylist: () => void;
  activePlaylistId: string | null;
  playlists: Playlist[];
  trackCount: number;
  favCount: number;
  runningCount: number;
}

export function Nav({
  view, onNav, onOpenPlaylist, onNewPlaylist, activePlaylistId, playlists,
  trackCount, favCount, runningCount,
}: NavProps) {
  const [plExpanded, setPlExpanded] = useState(true);

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
      {/* Home */}
      <button
        className={`${s.navItem}${view === 'home' ? ` ${s.active}` : ''}`}
        style={{ fontWeight: 500, letterSpacing: '0.02em' }}
        onClick={() => onNav('home')}
      >
        <span>Home</span>
      </button>

      {item('create', 'Create', runningCount || null)}
      {item('library', 'Library', trackCount)}

      {/* Playlists accordion */}
      <button
        className={`${s.navItem} ${s.navAccordion}${view === 'playlists' || view === 'playlist-detail' ? ` ${s.active}` : ''}`}
        onClick={() => { onNav('playlists'); setPlExpanded(true); }}
      >
        <span>Playlists</span>
        <span
          className={`${s.navCaret}${plExpanded ? ` ${s.open}` : ''}`}
          onClick={(e) => { e.stopPropagation(); setPlExpanded(v => !v); }}
          role="button"
          aria-label="Toggle playlists"
        >
          <ChevronDown size={14} />
        </span>
      </button>

      {plExpanded && (
        <div className="nav-children">
          {playlists.map(pl => (
            <button
              key={pl.id}
              className={`nav-child${view === 'playlist-detail' && activePlaylistId === pl.id ? ' active' : ''}`}
              onClick={() => onOpenPlaylist(pl.id)}
            >
              <span className="nav-child-dot" />
              <span className="nav-child-label">{pl.title}</span>
              <span className={s.badge}>{pl.tracks.length}</span>
            </button>
          ))}
          <button className="nav-child add" onClick={onNewPlaylist}>
            <span className="nav-child-dot" />
            <span className="nav-child-label">New Playlist</span>
          </button>
        </div>
      )}

      <div className={s.navFoot}>
        v0.4.2 · Suno V5.5<br />
        Next.js 14 · SQLite<br />
        <span style={{ color: 'var(--accent)', display: 'inline-flex', verticalAlign: 'middle' }}><Radio size={10} /></span> sunoapi.org
      </div>
    </nav>
  );
}
