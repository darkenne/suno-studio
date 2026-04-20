import type { Track, ModelOption } from '@/types';

export const GENRES = [
  'pop', 'lo-fi', 'ambient', 'folk', 'synthwave', 'indie',
  'dream-pop', 'drill', 'post-rock', 'trap soul', 'bossa nova', 'dark jazz',
];

export const MOODS = [
  'nostalgic', 'euphoric', 'melancholic', 'hypnotic', 'dreamy',
  'gritty', 'warm', 'crystalline', 'feverish', 'sunlit', 'after-hours',
];

export const INSTRUMENTS = [
  'warm pads', 'tape saturation', '808s', 'brushed drums', 'nylon guitar',
  'Juno-60', 'Rhodes', 'analog drums', 'vinyl crackle', 'sub bass',
];

export const VOCALS = [
  'female vocal', 'male vocal', 'airy vocal', 'baritone vocal', 'falsetto', 'spoken word',
];

export const INSPIRATION_TAGS = [
  'lo-fi', 'dream-pop', 'ambient', 'synthwave', 'indie folk', 'bedroom pop',
  'post-rock', 'dark jazz', 'bossa nova', 'trap soul', 'drill',
  'warm pads', 'tape saturation', '808s', 'vinyl crackle', 'nylon guitar',
  'Juno-60', 'Rhodes', 'reverb-washed', 'breathy vocal', '4/4 shuffle',
  '120bpm', 'slow crescendo', 'field recording', 'no drums',
];

export const MODEL_OPTIONS: ModelOption[] = [
  { value: 'V5_5', label: 'V5.5 — latest, longest context' },
  { value: 'V5', label: 'V5 — fast, high fidelity' },
  { value: 'V4_5PLUS', label: 'V4.5+ — vocal-focused' },
  { value: 'V4_5ALL', label: 'V4.5 — compatibility' },
  { value: 'V4_5', label: 'V4.5 — legacy' },
  { value: 'V4', label: 'V4 — legacy, cheapest' },
];

export const SIMPLE_MODELS: ModelOption[] = [
  { value: 'V4_5ALL', label: 'V4.5 ALL · Default' },
  { value: 'V4_5', label: 'V4.5' },
  { value: 'V4_5PLUS', label: 'V4.5 PLUS' },
  { value: 'V5', label: 'V5' },
  { value: 'V4', label: 'V4' },
];

export const SIMPLE_INSPIRATION = [
  'Danceable beat', 'Ambient trance', 'Heartfelt delivery', 'Feel-good',
  'Emotional', 'Energetic', 'Dreamy', 'Calm', 'Upbeat', 'Warm',
];

export const SIMPLE_EXAMPLES = [
  'Lo-fi hip-hop for a pre-dawn drive',
  'Jazz piano for a rainy afternoon cafe',
  'Intense orchestral score for a boss battle',
  'Upbeat pop for a summer beach day',
  'Ambient soundscape for meditation',
];

export const MOCK_TRACKS: Track[] = [
  {
    id: 't01', sunoId: 'suno_9af23', taskId: 'tk_4b91',
    title: 'Lantern Fields at 3AM',
    prompt: 'lo-fi, late-night drive, pressed tape cassette vibes',
    tags: 'lo-fi, chillhop, warm pads, vinyl crackle',
    duration: 183, mode: 'advanced', promptMode: 'single', model: 'V5',
    instrumental: false, isFavorite: true, vocalGender: 'f',
    createdAt: '2026-04-19T22:14:00Z',
    palette: ['#d4e85c', '#1d2a14', '#6a7a3a'],
  },
  {
    id: 't02', sunoId: 'suno_9af24', taskId: 'tk_4b91',
    title: 'Moths Around a Streetlamp',
    prompt: 'lo-fi, late-night drive, pressed tape cassette vibes',
    tags: 'lo-fi, chillhop, Rhodes, brushed drums',
    duration: 172, mode: 'advanced', promptMode: 'single', model: 'V5',
    instrumental: false, isFavorite: false, vocalGender: 'f',
    createdAt: '2026-04-19T22:14:00Z',
    palette: ['#e8a65c', '#2a1c14', '#7a5a3a'],
  },
  {
    id: 't03', sunoId: 'suno_ab112', taskId: 'tk_5c02',
    title: 'Paper Kites Over Gowanus',
    prompt: 'dream-pop, reverb-washed guitars, breathy female vocal, 4/4 shuffle',
    tags: 'dream-pop, shoegaze, airy vocal, reverb',
    duration: 221, mode: 'advanced', promptMode: 'multi', model: 'V5_5',
    instrumental: false, isFavorite: true, vocalGender: 'f',
    createdAt: '2026-04-19T20:02:00Z',
    palette: ['#c7a8ff', '#1a1428', '#5a4890'],
  },
  {
    id: 't04', sunoId: 'suno_ab113', taskId: 'tk_5c02',
    title: 'Slow Mercury',
    prompt: 'dream-pop, reverb-washed guitars, breathy female vocal, 4/4 shuffle',
    tags: 'dream-pop, shoegaze, airy vocal',
    duration: 205, mode: 'advanced', promptMode: 'multi', model: 'V5_5',
    instrumental: false, isFavorite: false, vocalGender: 'f',
    createdAt: '2026-04-19T20:02:00Z',
    palette: ['#a8c7ff', '#14142a', '#4858a0'],
  },
  {
    id: 't05', sunoId: 'suno_cc901', taskId: 'tk_6d11',
    title: 'Coral Static',
    prompt: 'ambient, drone, slow-moving overtones, no drums',
    tags: 'ambient, drone, texture, cinematic',
    duration: 348, mode: 'simple', promptMode: 'single', model: 'V5',
    instrumental: true, isFavorite: false, vocalGender: null,
    createdAt: '2026-04-19T18:45:00Z',
    palette: ['#ff7d66', '#281414', '#a04a3a'],
  },
  {
    id: 't06', sunoId: 'suno_cc902', taskId: 'tk_6d11',
    title: 'Low Tide, Soft Weather',
    prompt: 'ambient, drone, slow-moving overtones, no drums',
    tags: 'ambient, drone, field recording',
    duration: 302, mode: 'simple', promptMode: 'single', model: 'V5',
    instrumental: true, isFavorite: true, vocalGender: null,
    createdAt: '2026-04-19T18:45:00Z',
    palette: ['#66d4ff', '#142028', '#3a7090'],
  },
  {
    id: 't07', sunoId: 'suno_de553', taskId: 'tk_7e22',
    title: 'Porchlight, Alabama',
    prompt: 'indie folk, fingerpicked acoustic, male vocal, 6/8 sway',
    tags: 'folk, acoustic, male vocal, storytelling',
    duration: 214, mode: 'advanced', promptMode: 'single', model: 'V4_5PLUS',
    instrumental: false, isFavorite: false, vocalGender: 'm',
    createdAt: '2026-04-19T16:12:00Z',
    palette: ['#e8c25c', '#2a2414', '#8a7a3a'],
  },
  {
    id: 't08', sunoId: 'suno_de554', taskId: 'tk_7e22',
    title: 'The River Was Nothing Then',
    prompt: 'indie folk, fingerpicked acoustic, male vocal, 6/8 sway',
    tags: 'folk, acoustic, male vocal',
    duration: 198, mode: 'advanced', promptMode: 'single', model: 'V4_5PLUS',
    instrumental: false, isFavorite: true, vocalGender: 'm',
    createdAt: '2026-04-19T16:12:00Z',
    palette: ['#b8e85c', '#1a2814', '#5a8a3a'],
  },
  {
    id: 't09', sunoId: 'suno_fa071', taskId: 'tk_8f33',
    title: 'Neon on the 405',
    prompt: 'synthwave, driving arpeggios, 120bpm, Juno-60 lead',
    tags: 'synthwave, retrowave, Juno-60, arpeggio',
    duration: 234, mode: 'advanced', promptMode: 'multi', model: 'V5',
    instrumental: true, isFavorite: true, vocalGender: null,
    createdAt: '2026-04-19T14:30:00Z',
    palette: ['#ff5ce8', '#14142a', '#a03a90'],
  },
  {
    id: 't10', sunoId: 'suno_fa072', taskId: 'tk_8f33',
    title: 'Venice Lights Out',
    prompt: 'synthwave, driving arpeggios, 120bpm, Juno-60 lead',
    tags: 'synthwave, retrowave, dark',
    duration: 246, mode: 'advanced', promptMode: 'multi', model: 'V5',
    instrumental: true, isFavorite: false, vocalGender: null,
    createdAt: '2026-04-19T14:30:00Z',
    palette: ['#5ce8ff', '#141a28', '#3a90a0'],
  },
  {
    id: 't11', sunoId: 'suno_ga441', taskId: 'tk_9g44',
    title: 'Paper Rings / Glass Teeth',
    prompt: 'bedroom pop, lo-fi drums, whispered female vocal, doubled guitars',
    tags: 'bedroom-pop, lo-fi, whispered vocal',
    duration: 167, mode: 'simple', promptMode: 'multi', model: 'V5',
    instrumental: false, isFavorite: false, vocalGender: 'f',
    createdAt: '2026-04-18T22:11:00Z',
    palette: ['#ff8fa8', '#281418', '#a03a58'],
  },
  {
    id: 't12', sunoId: 'suno_ga442', taskId: 'tk_9g44',
    title: 'Telephone Wire Sonata',
    prompt: 'post-rock, slow crescendo, tremolo guitars, no vocal',
    tags: 'post-rock, instrumental, crescendo',
    duration: 412, mode: 'advanced', promptMode: 'multi', model: 'V5_5',
    instrumental: true, isFavorite: true, vocalGender: null,
    createdAt: '2026-04-18T19:42:00Z',
    palette: ['#8fffa8', '#142818', '#3aa058'],
  },
  {
    id: 't13', sunoId: 'suno_hb551', taskId: 'tk_ah55',
    title: 'Midnight Bossa, Quiet Room',
    prompt: 'bossa nova, nylon guitar, brushed drums, Portuguese whisper',
    tags: 'bossa nova, nylon guitar, intimate',
    duration: 188, mode: 'advanced', promptMode: 'single', model: 'V5',
    instrumental: false, isFavorite: true, vocalGender: 'f',
    createdAt: '2026-04-18T12:08:00Z',
    palette: ['#c2a87a', '#241c14', '#806040'],
  },
  {
    id: 't14', sunoId: 'suno_ic661', taskId: 'tk_bi66',
    title: 'Sub Rosa (Demo)',
    prompt: 'dark jazz, noir, muted trumpet, upright bass, after-hours bar',
    tags: 'dark jazz, noir, trumpet, upright bass',
    duration: 276, mode: 'advanced', promptMode: 'single', model: 'V5_5',
    instrumental: true, isFavorite: false, vocalGender: null,
    createdAt: '2026-04-17T23:19:00Z',
    palette: ['#a88ff5', '#1a1428', '#604aa0'],
  },
];
