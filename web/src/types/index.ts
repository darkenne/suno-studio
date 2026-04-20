export type VocalGender = 'f' | 'm';
export type RepeatMode = 'off' | 'all' | 'one';
export type VocalType = 'vocal' | 'instrumental';
export type JobStatus = 'PENDING' | 'TEXT' | 'FIRST' | 'SUCCESS' | 'FAILED';
export type PromptMode = 'single' | 'multi';
export type CreateMode = 'simple' | 'advanced';
export type View = 'create' | 'generating' | 'library';
export type AccentKey = 'lime' | 'amber' | 'cyan' | 'magenta' | 'coral';
export type FontPair = 'mono-sans' | 'serif-mono' | 'grotesk-mono' | 'neue-mono';

export interface Track {
  id: string;
  sunoId: string;
  taskId: string;
  title: string;
  prompt: string;
  tags: string;
  duration: number;
  mode: 'advanced' | 'simple';
  promptMode: PromptMode;
  model: string;
  instrumental: boolean;
  isFavorite: boolean;
  vocalGender: VocalGender | null;
  createdAt: string;
  palette: [string, string, string];
  fresh?: boolean;
  audioUrl?: string;
  streamAudioUrl?: string;
  imageUrl?: string;
}

export interface BatchJob {
  taskId: string;
  sunoTaskId?: string;
  targetCount: number;
  status: JobStatus;
  statusMessage: string;
  savedTracks: Track[];
  error: string | null;
  promptIndex: number;
  startedAt: number;
}

export interface PromptEntry {
  id: string;
  title: string;
  style: string;
  lyrics: string;
}

export interface SimplePromptEntry {
  id: string;
  text: string;
}

export interface AdvancedFormValues {
  promptMode: PromptMode;
  title: string;
  style: string;
  lyrics: string;
  prompts: PromptEntry[];
  vocalType: VocalType;
  vocalGender: VocalGender;
  negativeTags: string;
  weirdness: number;
  styleInfluence: number;
  count: number;
  model: string;
  inspirationTags: string[];
  origin?: 'simple';
}

export interface ModelOption {
  value: string;
  label: string;
}

export interface Toast {
  id: number;
  msg: string;
  kind: 'ok' | 'err';
}

export interface ConfirmOptions {
  title?: string;
  eyebrow?: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  width?: number;
}
