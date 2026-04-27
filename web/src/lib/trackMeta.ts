import type { AdvancedFormValues } from '@/types';

/** Lyrics text from the create form (custom / advanced mode only). */
export function submittedLyricsFromForm(
  values: AdvancedFormValues,
  promptIndex: number,
): string | undefined {
  if (values.vocalType === 'instrumental' || values.origin === 'simple') return undefined;
  const isMulti = values.promptMode === 'multi';
  const p = isMulti ? values.prompts[promptIndex % values.prompts.length] : null;
  const text = (isMulti ? p?.lyrics : values.lyrics) ?? '';
  const t = text.trim();
  return t || undefined;
}
