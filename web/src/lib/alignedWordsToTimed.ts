import type { TimedLyricLine } from '@/types';
import { isJunkLyricText } from '@/lib/lyricLineFilters';

/** One entry from get-timestamped-lyrics `alignedWords` */
export type AlignedWord = {
  word: string;
  startS: number;
  endS: number;
  success?: boolean;
  palign?: number;
};

/**
 * Converts word-level alignment from Suno into line-based { t, text } for LyricsOverlay.
 * Words on the same line are joined with spaces; newline inside `word` starts a new line.
 */
export function alignedWordsToTimedLines(words: AlignedWord[]): TimedLyricLine[] {
  if (!words?.length) return [];
  const lines: TimedLyricLine[] = [];
  let lineBuf = '';
  let lineT = words[0].startS;
  let firstTokenOnLine = true;

  for (const w of words) {
    if (w.success === false) continue;
    // Some API payloads use literal \N, /N, or \ N instead of a real newline char.
    const wordNorm = w.word
      .replace(/\r\n/g, '\n')
      .replace(/\\N|\/N/g, '\n')
      .replace(/\\\s*N/g, '\n');
    const parts = wordNorm.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        const piece = lineBuf.trim();
        if (piece) lines.push({ t: lineT, text: piece });
        lineBuf = '';
        firstTokenOnLine = true;
      }
      const p = parts[i];
      if (!p) continue;
      if (firstTokenOnLine) {
        lineT = w.startS;
        firstTokenOnLine = false;
      }
      lineBuf += (lineBuf ? ' ' : '') + p;
    }
  }
  if (lineBuf.trim()) {
    lines.push({ t: lineT, text: lineBuf.trim() });
  }
  return lines.filter(l => !isJunkLyricText(l.text));
}
