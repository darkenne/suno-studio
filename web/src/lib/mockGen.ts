import type { Track, AdvancedFormValues } from '@/types';
import { submittedLyricsFromForm } from '@/lib/trackMeta';

const PALETTES: [string, string, string][] = [
  ['#d4e85c', '#1d2a14', '#6a7a3a'],
  ['#c7a8ff', '#1a1428', '#5a4890'],
  ['#ff8fa8', '#281418', '#a03a58'],
  ['#5ce8ff', '#141a28', '#3a90a0'],
  ['#e8c25c', '#2a2414', '#8a7a3a'],
  ['#ff5ce8', '#14142a', '#a03a90'],
];

const TITLES = [
  'Unfinished Summer', 'Half-Lit Rooms', 'Tremolo at Dawn',
  'Gutter Stars', 'Cathode Hymn', 'Quiet Receiver',
  'Paperbag Moon', 'Tin Cup Radio', 'Salt Lamp Waltz',
  'Overcast Parade', 'Morse, Slow', 'Wax and Static',
];

export function generateMockTracks(
  values: AdvancedFormValues,
  count: number,
  taskId: string,
  promptIndex: number,
): Track[] {
  const sourcePrompt =
    values.promptMode === 'multi'
      ? values.prompts[promptIndex % values.prompts.length] ?? values.prompts[0]
      : { title: values.title, style: values.style };

  const savedLyrics = submittedLyricsFromForm(values, promptIndex);

  return Array.from({ length: count }, (_, i) => {
    const pIdx = (promptIndex * 2 + i) % PALETTES.length;
    const tIdx = (promptIndex * 2 + i) % TITLES.length;
    return {
      id: `nt_${taskId}_${i}`,
      sunoId: `suno_${Math.random().toString(36).slice(2, 8)}`,
      taskId,
      title: TITLES[tIdx],
      prompt: sourcePrompt?.style ?? values.style ?? '',
      tags: (sourcePrompt?.style ?? values.style ?? 'generated').slice(0, 60),
      duration: 150 + Math.floor(Math.random() * 120),
      mode: 'advanced' as const,
      promptMode: values.promptMode,
      model: values.model,
      instrumental: values.vocalType === 'instrumental',
      isFavorite: false,
      vocalGender: values.vocalType === 'instrumental' ? null : values.vocalGender,
      createdAt: new Date().toISOString(),
      palette: PALETTES[pIdx],
      fresh: true,
      lyrics: values.vocalType === 'instrumental' ? undefined : savedLyrics,
    };
  });
}
