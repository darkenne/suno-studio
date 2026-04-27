'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { BatchJob, AdvancedFormValues, Track } from '@/types';
import { generateMockTracks } from '@/lib/mockGen';
import { submittedLyricsFromForm } from '@/lib/trackMeta';

interface BatchCallbacks {
  onNewTracks: (tracks: Track[]) => void;
  onToast: (msg: string, kind?: 'ok' | 'err') => void;
}

const PALETTES: [string, string, string][] = [
  ['#d4e85c', '#1d2a14', '#6a7a3a'],
  ['#c7a8ff', '#1a1428', '#5a4890'],
  ['#ff8fa8', '#281418', '#a03a58'],
  ['#5ce8ff', '#141a28', '#3a90a0'],
  ['#e8c25c', '#2a2414', '#8a7a3a'],
  ['#ff5ce8', '#14142a', '#a03a90'],
];

const SUNO_TERMINAL_FAIL = [
  'CREATE_TASK_FAILED',
  'GENERATE_AUDIO_FAILED',
  'CALLBACK_EXCEPTION',
  'SENSITIVE_WORD_ERROR',
];

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(id); reject(new DOMException('Aborted', 'AbortError')); });
  });
}

function buildSunoRequest(values: AdvancedFormValues, promptIndex: number, count: number) {
  const isAdvanced = values.origin !== 'simple';
  const isMulti    = values.promptMode === 'multi';
  const prompt     = isMulti
    ? values.prompts[promptIndex % values.prompts.length]
    : null;

  const base = {
    model:        values.model,
    instrumental: values.vocalType === 'instrumental',
    count,
    callBackUrl:  'https://example.com/noop',
  };

  if (isAdvanced) {
    const title  = (isMulti ? prompt?.title  : values.title)  ?? values.title;
    const style  = (isMulti ? prompt?.style  : values.style)  ?? values.style;
    const lyrics = (isMulti ? prompt?.lyrics : values.lyrics) ?? '';
    return {
      ...base,
      customMode:           true,
      title:                title.slice(0, 80),
      style:                style.slice(0, 200),
      ...(lyrics && !base.instrumental ? { prompt: lyrics } : {}),
      ...(values.negativeTags ? { negativeTags: values.negativeTags } : {}),
      ...(!base.instrumental ? { vocalGender: values.vocalGender === 'm' ? 'male' : 'female' } : {}),
      styleWeight:          Math.round(values.styleInfluence) / 100,
      weirdnessConstraint:  Math.round(values.weirdness) / 100,
    };
  }

  // simple mode
  const description = isMulti
    ? (prompt?.style ?? values.style)
    : values.style;
  return {
    ...base,
    customMode: false,
    prompt:     description.slice(0, 500),
  };
}

interface SunoRaw {
  id: string;
  title?: string;
  prompt?: string;
  tags?: string;
  audioUrl?: string;
  streamAudioUrl?: string;
  imageUrl?: string;
  modelName?: string;
  duration?: number;
  createTime?: string;
  lyrics?: string;
}

function mapRawToTrack(
  raw: SunoRaw,
  sunoTaskId: string,
  values: AdvancedFormValues,
  promptIndex: number,
  jobIdx: number,
): Track {
  const pIdx = (promptIndex * 2 + jobIdx) % PALETTES.length;
  const fromForm = submittedLyricsFromForm(values, promptIndex);
  const lyricsFromApi = raw.lyrics?.trim();
  return {
    id:             `sn_${raw.id}`,
    sunoId:         raw.id,
    taskId:         sunoTaskId,
    title:          raw.title ?? values.title ?? 'Untitled',
    prompt:         raw.prompt ?? values.style ?? '',
    tags:           (raw.tags ?? values.style ?? '').slice(0, 120),
    duration:       raw.duration ?? 0,
    mode:           values.origin === 'simple' ? 'simple' : 'advanced',
    promptMode:     values.promptMode,
    model:          raw.modelName ?? values.model,
    instrumental:   values.vocalType === 'instrumental',
    isFavorite:     false,
    vocalGender:    values.vocalType === 'instrumental' ? null : values.vocalGender,
    createdAt:      raw.createTime ?? new Date().toISOString(),
    palette:        PALETTES[pIdx],
    fresh:          true,
    audioUrl:       raw.audioUrl,
    streamAudioUrl: raw.streamAudioUrl,
    imageUrl:       raw.imageUrl,
    lyrics:         lyricsFromApi || fromForm || undefined,
  };
}

export function useBatch() {
  const [jobs, setJobs]               = useState<BatchJob[]>([]);
  const [batchTotal, setBatchTotal]   = useState(0);
  const [batchTracks, setBatchTracks] = useState<Track[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const patchJob = useCallback(
    (taskId: string, patch: Partial<BatchJob>) =>
      setJobs(js => js.map(j => j.taskId === taskId ? { ...j, ...patch } : j)),
    [],
  );

  const startBatch = useCallback(
    (formValues: AdvancedFormValues, { onNewTracks, onToast }: BatchCallbacks) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const apiCalls = Math.ceil(formValues.count / 2);
      const newJobs: BatchJob[] = Array.from({ length: apiCalls }, (_, i) => {
        const isLast = i === apiCalls - 1;
        return {
          taskId:       'tk_' + Math.random().toString(36).slice(2, 8),
          targetCount:  isLast && formValues.count % 2 === 1 ? 1 : 2,
          status:       'PENDING' as const,
          statusMessage: 'Queued',
          savedTracks:  [],
          error:        null,
          promptIndex:  i,
          startedAt:    Date.now(),
        };
      });

      setJobs(newJobs);
      setBatchTotal(formValues.count);
      setBatchTracks([]);

      newJobs.forEach((job, idx) => {
        runJob(job, idx, formValues, ac.signal, { onNewTracks, onToast });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  async function runJob(
    job: BatchJob,
    idx: number,
    values: AdvancedFormValues,
    signal: AbortSignal,
    { onNewTracks, onToast }: BatchCallbacks,
  ) {
    try {
      // Fire the generate request
      const body = buildSunoRequest(values, job.promptIndex, job.targetCount);
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      });
      const genData = await genRes.json();

      // No API key → fall back to mock
      if (genRes.status === 503 && genData.error === 'SUNO_API_KEY not configured') {
        onToast('SUNO_API_KEY not set — using demo mode', 'err');
        await runMockJob(job, idx, values, signal, { onNewTracks, onToast });
        return;
      }

      if (!genRes.ok || (genData?.code !== undefined && genData.code !== 200)) {
        throw new Error(genData?.msg ?? genData?.message ?? `HTTP ${genRes.status}`);
      }

      const sunoTaskId: string = genData?.data?.taskId;
      if (!sunoTaskId) throw new Error('No taskId in response');

      patchJob(job.taskId, { sunoTaskId, status: 'PENDING', statusMessage: 'Queued' });

      // Poll loop — max 10 min (200 × 3s)
      for (let poll = 0; poll < 200; poll++) {
        await sleep(3000, signal);
        const pollRes = await fetch(`/api/generate/status?taskId=${encodeURIComponent(sunoTaskId)}`, { signal });
        const pollData = await pollRes.json();
        const apiStatus: string = pollData?.data?.status ?? '';

        if (apiStatus === 'TEXT_SUCCESS') {
          patchJob(job.taskId, { status: 'TEXT', statusMessage: 'Writing lyrics' });
        } else if (apiStatus === 'FIRST_SUCCESS') {
          patchJob(job.taskId, { status: 'FIRST', statusMessage: 'Creating audio' });
        } else if (apiStatus === 'SUCCESS') {
          const rawList: SunoRaw[] = pollData?.data?.response?.sunoData ?? [];
          const newTracks = rawList.map((r, ri) =>
            mapRawToTrack(r, sunoTaskId, values, job.promptIndex, idx * 2 + ri),
          );
          patchJob(job.taskId, {
            status: 'SUCCESS',
            statusMessage: 'Saved',
            savedTracks: newTracks,
          });
          setBatchTracks(prev => {
            const existing = new Set(prev.map(t => t.id));
            return [...prev, ...newTracks.filter(t => !existing.has(t.id))];
          });
          onNewTracks(newTracks);
          newTracks.forEach(t => onToast(`"${t.title}" saved to library`));
          return;
        } else if (SUNO_TERMINAL_FAIL.includes(apiStatus)) {
          throw new Error(pollData?.data?.errorMessage ?? apiStatus);
        }
      }
      throw new Error('Timed out waiting for Suno');
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : String(err);
      patchJob(job.taskId, { status: 'FAILED', statusMessage: 'Failed', error: msg });
      onToast(`Request #${String(idx + 1).padStart(2, '0')} failed: ${msg}`, 'err');
    }
  }

  async function runMockJob(
    job: BatchJob,
    idx: number,
    values: AdvancedFormValues,
    signal: AbortSignal,
    { onNewTracks, onToast }: BatchCallbacks,
  ) {
    const base = 600 + Math.random() * 1200;
    await sleep(base + 1000, signal);
    patchJob(job.taskId, { status: 'TEXT', statusMessage: 'Writing lyrics' });
    await sleep(2000, signal);
    patchJob(job.taskId, { status: 'FIRST', statusMessage: 'Creating audio' });
    await sleep(2500 + idx * 1200, signal);

    if (Math.random() < 0.06 && idx > 0) {
      patchJob(job.taskId, { status: 'FAILED', statusMessage: 'Create failed' });
      onToast(`Request #${String(idx + 1).padStart(2, '0')} failed`, 'err');
      return;
    }

    const newTracks = generateMockTracks(values, job.targetCount, job.taskId, idx);
    patchJob(job.taskId, { status: 'SUCCESS', statusMessage: 'Saved', savedTracks: newTracks });
    setBatchTracks(prev => {
      const existing = new Set(prev.map(t => t.id));
      return [...prev, ...newTracks.filter(t => !existing.has(t.id))];
    });
    onNewTracks(newTracks);
    newTracks.forEach(t => onToast(`"${t.title}" saved to library`));
  }

  const cancelBatch = useCallback(({ onToast }: Pick<BatchCallbacks, 'onToast'>) => {
    abortRef.current?.abort();
    setJobs(js =>
      js.map(j =>
        j.status === 'SUCCESS' || j.status === 'FAILED'
          ? j
          : { ...j, status: 'FAILED' as const, statusMessage: 'Canceled' },
      ),
    );
    onToast('Run stopped', 'err');
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  const isComplete =
    jobs.length > 0 && jobs.every(j => j.status === 'SUCCESS' || j.status === 'FAILED');

  return { jobs, batchTotal, batchTracks, isComplete, startBatch, cancelBatch };
}
