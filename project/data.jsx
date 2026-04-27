// data.jsx — mock tracks + prompt presets

const GENRES = ["pop", "lo-fi", "ambient", "folk", "synthwave", "indie", "dream-pop", "drill", "post-rock", "trap soul", "bossa nova", "dark jazz"];
const MOODS = ["nostalgic", "euphoric", "melancholic", "hypnotic", "dreamy", "gritty", "warm", "crystalline", "feverish", "sunlit", "after-hours"];
const INSTRUMENTS = ["warm pads", "tape saturation", "808s", "brushed drums", "nylon guitar", "Juno-60", "Rhodes", "analog drums", "vinyl crackle", "sub bass"];
const VOCALS = ["female vocal", "male vocal", "airy vocal", "baritone vocal", "falsetto", "spoken word"];

const MOCK_TRACKS = [
  {
    id: "t01", sunoId: "suno_9af23", taskId: "tk_4b91",
    title: "Lantern Fields at 3AM",
    prompt: "lo-fi, late-night drive, pressed tape cassette vibes",
    tags: "lo-fi, chillhop, warm pads, vinyl crackle",
    duration: 183, mode: "advanced", promptMode: "single", model: "V5",
    instrumental: false, isFavorite: true, vocalGender: "f",
    createdAt: "2026-04-19T22:14:00Z",
    palette: ["#d4e85c", "#1d2a14", "#6a7a3a"]
  },
  {
    id: "t02", sunoId: "suno_9af24", taskId: "tk_4b91",
    title: "Moths Around a Streetlamp",
    prompt: "lo-fi, late-night drive, pressed tape cassette vibes",
    tags: "lo-fi, chillhop, Rhodes, brushed drums",
    duration: 172, mode: "advanced", promptMode: "single", model: "V5",
    instrumental: false, isFavorite: false, vocalGender: "f",
    createdAt: "2026-04-19T22:14:00Z",
    palette: ["#e8a65c", "#2a1c14", "#7a5a3a"]
  },
  {
    id: "t03", sunoId: "suno_ab112", taskId: "tk_5c02",
    title: "Paper Kites Over Gowanus",
    prompt: "dream-pop, reverb-washed guitars, breathy female vocal, 4/4 shuffle",
    tags: "dream-pop, shoegaze, airy vocal, reverb",
    duration: 221, mode: "advanced", promptMode: "multi", model: "V5_5",
    instrumental: false, isFavorite: true, vocalGender: "f",
    createdAt: "2026-04-19T20:02:00Z",
    palette: ["#c7a8ff", "#1a1428", "#5a4890"]
  },
  {
    id: "t04", sunoId: "suno_ab113", taskId: "tk_5c02",
    title: "Slow Mercury",
    prompt: "dream-pop, reverb-washed guitars, breathy female vocal, 4/4 shuffle",
    tags: "dream-pop, shoegaze, airy vocal",
    duration: 205, mode: "advanced", promptMode: "multi", model: "V5_5",
    instrumental: false, isFavorite: false, vocalGender: "f",
    createdAt: "2026-04-19T20:02:00Z",
    palette: ["#a8c7ff", "#14142a", "#4858a0"]
  },
  {
    id: "t05", sunoId: "suno_cc901", taskId: "tk_6d11",
    title: "Coral Static",
    prompt: "ambient, drone, slow-moving overtones, no drums",
    tags: "ambient, drone, texture, cinematic",
    duration: 348, mode: "simple", promptMode: "single", model: "V5",
    instrumental: true, isFavorite: false, vocalGender: null,
    createdAt: "2026-04-19T18:45:00Z",
    palette: ["#ff7d66", "#281414", "#a04a3a"]
  },
  {
    id: "t06", sunoId: "suno_cc902", taskId: "tk_6d11",
    title: "Low Tide, Soft Weather",
    prompt: "ambient, drone, slow-moving overtones, no drums",
    tags: "ambient, drone, field recording",
    duration: 302, mode: "simple", promptMode: "single", model: "V5",
    instrumental: true, isFavorite: true, vocalGender: null,
    createdAt: "2026-04-19T18:45:00Z",
    palette: ["#66d4ff", "#142028", "#3a7090"]
  },
  {
    id: "t07", sunoId: "suno_de553", taskId: "tk_7e22",
    title: "Porchlight, Alabama",
    prompt: "indie folk, fingerpicked acoustic, male vocal, 6/8 sway",
    tags: "folk, acoustic, male vocal, storytelling",
    duration: 214, mode: "advanced", promptMode: "single", model: "V4_5PLUS",
    instrumental: false, isFavorite: false, vocalGender: "m",
    createdAt: "2026-04-19T16:12:00Z",
    palette: ["#e8c25c", "#2a2414", "#8a7a3a"]
  },
  {
    id: "t08", sunoId: "suno_de554", taskId: "tk_7e22",
    title: "The River Was Nothing Then",
    prompt: "indie folk, fingerpicked acoustic, male vocal, 6/8 sway",
    tags: "folk, acoustic, male vocal",
    duration: 198, mode: "advanced", promptMode: "single", model: "V4_5PLUS",
    instrumental: false, isFavorite: true, vocalGender: "m",
    createdAt: "2026-04-19T16:12:00Z",
    palette: ["#b8e85c", "#1a2814", "#5a8a3a"]
  },
  {
    id: "t09", sunoId: "suno_fa071", taskId: "tk_8f33",
    title: "Neon on the 405",
    prompt: "synthwave, driving arpeggios, 120bpm, Juno-60 lead",
    tags: "synthwave, retrowave, Juno-60, arpeggio",
    duration: 234, mode: "advanced", promptMode: "multi", model: "V5",
    instrumental: true, isFavorite: true, vocalGender: null,
    createdAt: "2026-04-19T14:30:00Z",
    palette: ["#ff5ce8", "#14142a", "#a03a90"]
  },
  {
    id: "t10", sunoId: "suno_fa072", taskId: "tk_8f33",
    title: "Venice Lights Out",
    prompt: "synthwave, driving arpeggios, 120bpm, Juno-60 lead",
    tags: "synthwave, retrowave, dark",
    duration: 246, mode: "advanced", promptMode: "multi", model: "V5",
    instrumental: true, isFavorite: false, vocalGender: null,
    createdAt: "2026-04-19T14:30:00Z",
    palette: ["#5ce8ff", "#141a28", "#3a90a0"]
  },
  {
    id: "t11", sunoId: "suno_ga441", taskId: "tk_9g44",
    title: "Paper Rings / Glass Teeth",
    prompt: "bedroom pop, lo-fi drums, whispered female vocal, doubled guitars",
    tags: "bedroom-pop, lo-fi, whispered vocal",
    duration: 167, mode: "simple", promptMode: "multi", model: "V5",
    instrumental: false, isFavorite: false, vocalGender: "f",
    createdAt: "2026-04-18T22:11:00Z",
    palette: ["#ff8fa8", "#281418", "#a03a58"]
  },
  {
    id: "t12", sunoId: "suno_ga442", taskId: "tk_9g44",
    title: "Telephone Wire Sonata",
    prompt: "post-rock, slow crescendo, tremolo guitars, no vocal",
    tags: "post-rock, instrumental, crescendo",
    duration: 412, mode: "advanced", promptMode: "multi", model: "V5_5",
    instrumental: true, isFavorite: true, vocalGender: null,
    createdAt: "2026-04-18T19:42:00Z",
    palette: ["#8fffa8", "#142818", "#3aa058"]
  },
  {
    id: "t13", sunoId: "suno_hb551", taskId: "tk_ah55",
    title: "Midnight Bossa, Quiet Room",
    prompt: "bossa nova, nylon guitar, brushed drums, Portuguese whisper",
    tags: "bossa nova, nylon guitar, intimate",
    duration: 188, mode: "advanced", promptMode: "single", model: "V5",
    instrumental: false, isFavorite: true, vocalGender: "f",
    createdAt: "2026-04-18T12:08:00Z",
    palette: ["#c2a87a", "#241c14", "#806040"]
  },
  {
    id: "t14", sunoId: "suno_ic661", taskId: "tk_bi66",
    title: "Sub Rosa (Demo)",
    prompt: "dark jazz, noir, muted trumpet, upright bass, after-hours bar",
    tags: "dark jazz, noir, trumpet, upright bass",
    duration: 276, mode: "advanced", promptMode: "single", model: "V5_5",
    instrumental: true, isFavorite: false, vocalGender: null,
    createdAt: "2026-04-17T23:19:00Z",
    palette: ["#a88ff5", "#1a1428", "#604aa0"]
  },
];

const INSPIRATION_TAGS = [
  "lo-fi", "dream-pop", "ambient", "synthwave", "indie folk", "bedroom pop",
  "post-rock", "dark jazz", "bossa nova", "trap soul", "drill",
  "warm pads", "tape saturation", "808s", "vinyl crackle", "nylon guitar",
  "Juno-60", "Rhodes", "reverb-washed", "breathy vocal", "4/4 shuffle",
  "120bpm", "slow crescendo", "field recording", "no drums",
];

const MODEL_OPTIONS = [
  { value: "V5_5", label: "V5.5 — latest, longest context" },
  { value: "V5", label: "V5 — fast, high fidelity" },
  { value: "V4_5PLUS", label: "V4.5+ — vocal-focused" },
  { value: "V4_5ALL", label: "V4.5 — compatibility" },
  { value: "V4_5", label: "V4.5 — legacy" },
  { value: "V4", label: "V4 — legacy, cheapest" },
];

// Synced lyrics — array of { t: secondsFromStart, text }
// Attach to a few tracks so the LyricsOverlay has content to highlight.
const LYRICS_LANTERN = [
  { t: 0,    text: "[Verse 1]" },
  { t: 4,    text: "Tape hiss, headlights, low" },
  { t: 9,    text: "we drift the tunnel slow" },
  { t: 14,   text: "lantern fields at three" },
  { t: 19,   text: "mile markers blurring by" },
  { t: 24,   text: "" },
  { t: 26,   text: "[Pre]" },
  { t: 28,   text: "you said, don't fall asleep" },
  { t: 33,   text: "the radio's on repeat" },
  { t: 38,   text: "" },
  { t: 40,   text: "[Chorus]" },
  { t: 42,   text: "and it's cold, and it's quiet," },
  { t: 47,   text: "and the windshield's wet with light" },
  { t: 52,   text: "we are nowhere, we are night" },
  { t: 57,   text: "lantern fields at three a.m." },
  { t: 63,   text: "" },
  { t: 65,   text: "[Verse 2]" },
  { t: 68,   text: "your hand on the dashboard glow" },
  { t: 73,   text: "exit signs we don't know" },
  { t: 78,   text: "tape rewinds, side B" },
  { t: 83,   text: "an old song, half asleep" },
  { t: 88,   text: "" },
  { t: 90,   text: "[Bridge]" },
  { t: 92,   text: "the dotted line keeps going" },
  { t: 97,   text: "wherever you are going" },
  { t: 102,  text: "I'll be one mile behind" },
  { t: 107,  text: "with the tape hiss, with the night" },
  { t: 113,  text: "" },
  { t: 115,  text: "[Chorus]" },
  { t: 117,  text: "and it's cold, and it's quiet," },
  { t: 122,  text: "and the windshield's wet with light" },
  { t: 127,  text: "we are nowhere, we are night" },
  { t: 132,  text: "lantern fields at three a.m." },
  { t: 138,  text: "" },
  { t: 140,  text: "[Outro]" },
  { t: 142,  text: "lantern fields, lantern fields" },
  { t: 147,  text: "lantern fields at three" },
  { t: 156,  text: "...three a.m." },
];

const LYRICS_PAPER_KITES = [
  { t: 0,   text: "[Verse]" },
  { t: 5,   text: "paper kites over Gowanus" },
  { t: 11,  text: "wires on the rooftop hum" },
  { t: 17,  text: "you said summer wouldn't end" },
  { t: 23,  text: "it ended anyway, my friend" },
  { t: 30,  text: "" },
  { t: 32,  text: "[Chorus]" },
  { t: 34,  text: "and the light goes / the light goes" },
  { t: 41,  text: "all gold, all gold, all slow" },
  { t: 49,  text: "and we're cheap film, cheap film" },
  { t: 56,  text: "burning out in the window" },
  { t: 64,  text: "" },
  { t: 70,  text: "[Verse]" },
  { t: 73,  text: "third floor, the fan won't sleep" },
  { t: 79,  text: "the wallpaper sighs, repeats" },
  { t: 85,  text: "you traced rivers on my wrist" },
  { t: 91,  text: "named them after streets we'd missed" },
  { t: 100, text: "" },
  { t: 105, text: "[Chorus]" },
  { t: 107, text: "and the light goes / the light goes" },
  { t: 114, text: "all gold, all gold, all slow" },
  { t: 122, text: "and we're cheap film, cheap film" },
  { t: 129, text: "burning out in the window" },
  { t: 138, text: "" },
  { t: 145, text: "[Bridge]" },
  { t: 148, text: "if a kite is just a string" },
  { t: 154, text: "and a hand that won't let go" },
  { t: 161, text: "then I'm holding, I'm holding" },
  { t: 168, text: "I'm holding, even slow" },
  { t: 180, text: "" },
  { t: 188, text: "[Outro]" },
  { t: 192, text: "the light goes" },
  { t: 200, text: "the light goes" },
  { t: 210, text: "the light goes" },
];

const LYRICS_PORCHLIGHT = [
  { t: 0,   text: "[Verse 1]" },
  { t: 4,   text: "porchlight burning, Alabama" },
  { t: 11,  text: "moths against the screen" },
  { t: 18,  text: "my mother singing softly" },
  { t: 25,  text: "a song she'd never been" },
  { t: 33,  text: "" },
  { t: 36,  text: "[Chorus]" },
  { t: 39,  text: "carry me home, carry me home" },
  { t: 46,  text: "down the long red road" },
  { t: 53,  text: "porchlight burning, porchlight burning" },
  { t: 61,  text: "wherever you go" },
  { t: 70,  text: "" },
  { t: 75,  text: "[Verse 2]" },
  { t: 78,  text: "father with his hat off" },
  { t: 85,  text: "kitchen radio low" },
  { t: 92,  text: "we counted summer fireflies" },
  { t: 99,  text: "and let the river go" },
  { t: 108, text: "" },
  { t: 113, text: "[Chorus]" },
  { t: 115, text: "carry me home, carry me home" },
  { t: 122, text: "down the long red road" },
  { t: 129, text: "porchlight burning, porchlight burning" },
  { t: 137, text: "wherever you go" },
  { t: 148, text: "" },
  { t: 155, text: "[Outro]" },
  { t: 158, text: "porchlight, porchlight" },
  { t: 167, text: "Alabama, Alabama" },
  { t: 178, text: "carry me home" },
];

const LYRICS_PAPER_RINGS = [
  { t: 0,   text: "[Verse]" },
  { t: 4,   text: "paper rings on the dresser" },
  { t: 9,   text: "glass teeth on the floor" },
  { t: 14,  text: "you said you'd be here, sweeter" },
  { t: 19,  text: "the second time, the more" },
  { t: 25,  text: "" },
  { t: 28,  text: "[Chorus]" },
  { t: 30,  text: "but the morning came in cheap" },
  { t: 35,  text: "and the morning kept on cheap" },
  { t: 41,  text: "paper rings, paper rings" },
  { t: 47,  text: "I am too tired to keep" },
  { t: 55,  text: "" },
  { t: 60,  text: "[Verse]" },
  { t: 63,  text: "found a tooth in the carpet" },
  { t: 68,  text: "found your handwriting in pen" },
  { t: 73,  text: "you wrote 'sorry' like a question" },
  { t: 78,  text: "and erased it again" },
  { t: 86,  text: "" },
  { t: 92,  text: "[Outro]" },
  { t: 96,  text: "paper rings / glass teeth" },
  { t: 105, text: "paper rings / glass teeth" },
  { t: 115, text: "paper rings" },
];

// Attach lyrics to specific tracks
const LYRICS_BY_ID = {
  t01: LYRICS_LANTERN,
  t03: LYRICS_PAPER_KITES,
  t07: LYRICS_PORCHLIGHT,
  t11: LYRICS_PAPER_RINGS,
};
MOCK_TRACKS.forEach(t => {
  if (LYRICS_BY_ID[t.id]) t.lyrics = LYRICS_BY_ID[t.id];
});

window.MOCK_TRACKS = MOCK_TRACKS;
window.INSPIRATION_TAGS = INSPIRATION_TAGS;
window.MODEL_OPTIONS = MODEL_OPTIONS;
window.GENRES = GENRES;
window.MOODS = MOODS;
window.INSTRUMENTS = INSTRUMENTS;
window.VOCALS = VOCALS;
