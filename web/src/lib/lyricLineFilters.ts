/**
 * Strips display-only / alignment-artifact lines (lone middle dot, period, or dot-only from API).
 * Does not treat true blank lines (spacing) as junk — use trim() === '' outside this.
 */
export function isJunkLyricText(text: string): boolean {
  const s = text.trim();
  if (s === '') return false;
  if (s === '·' || s === '.') return true;
  if (s.length <= 2 && /^[·.．]+$/.test(s)) return true;
  return false;
}
