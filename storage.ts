import type { Attempt, Passage, ProgressState } from '../types';
import { SEED_PASSAGES } from '../data/seedPassages';

const STATE_KEY = 'syllabustype.progress.v1';
const PASSAGES_KEY = 'syllabustype.passages.v1';

const EMPTY_STATE: ProgressState = { attempts: [], revisitQueue: [] };

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as ProgressState;
    return {
      attempts: parsed.attempts ?? [],
      revisitQueue: parsed.revisitQueue ?? [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

export function loadPassages(): Passage[] {
  try {
    const raw = localStorage.getItem(PASSAGES_KEY);
    if (!raw) {
      // seed on first run
      localStorage.setItem(PASSAGES_KEY, JSON.stringify(SEED_PASSAGES));
      return SEED_PASSAGES;
    }
    return JSON.parse(raw) as Passage[];
  } catch {
    return SEED_PASSAGES;
  }
}

export function savePassages(passages: Passage[]): void {
  try {
    localStorage.setItem(PASSAGES_KEY, JSON.stringify(passages));
  } catch {
    /* ignore */
  }
}

export function addAttempt(attempt: Attempt): void {
  const state = loadProgress();
  state.attempts = [...state.attempts, attempt];
  // auto-add to revisit queue below 90%
  if (attempt.accuracy < 90 && !state.revisitQueue.includes(attempt.passageId)) {
    state.revisitQueue.push(attempt.passageId);
  }
  saveProgress(state);
}

export function removeFromRevisit(passageId: string): void {
  const state = loadProgress();
  state.revisitQueue = state.revisitQueue.filter((p) => p !== passageId);
  saveProgress(state);
}

export function addToRevisit(passageId: string): void {
  const state = loadProgress();
  if (!state.revisitQueue.includes(passageId)) {
    state.revisitQueue.push(passageId);
    saveProgress(state);
  }
}

export function getStreak(): number {
  const { attempts } = loadProgress();
  if (attempts.length === 0) return 0;
  const days = new Set(
    attempts.map((a) => new Date(a.timestamp).toISOString().slice(0, 10)),
  );
  // consecutive days ending today or yesterday
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      // allow yesterday-started streak if no attempt today
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function getSessionsToday(): number {
  const today = new Date().toISOString().slice(0, 10);
  return loadProgress().attempts.filter(
    (a) => new Date(a.timestamp).toISOString().slice(0, 10) === today,
  ).length;
}

export function getAverageWpm(): number {
  const { attempts } = loadProgress();
  if (attempts.length === 0) return 0;
  return Math.round(
    attempts.reduce((s, a) => s + a.wpm, 0) / attempts.length,
  );
}

export function getAverageAccuracy(): number {
  const { attempts } = loadProgress();
  if (attempts.length === 0) return 0;
  return Math.round(
    attempts.reduce((s, a) => s + a.accuracy, 0) / attempts.length,
  );
}
