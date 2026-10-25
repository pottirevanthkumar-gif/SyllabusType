import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Attempt, Passage, ProgressState } from '../types';
import { loadPassages, loadProgress, savePassages, saveProgress } from '../lib/storage';
import { SEED_PASSAGES } from '../data/seedPassages';

interface AppContextValue {
  passages: Passage[];
  setPassages: (p: Passage[]) => void;
  approvedPassages: Passage[];
  progress: ProgressState;
  recordAttempt: (a: Omit<Attempt, 'id' | 'timestamp'>) => Attempt;
  addPassage: (p: Omit<Passage, 'id' | 'status'>) => Passage;
  updatePassage: (id: string, patch: Partial<Passage>) => void;
  toggleRevisit: (id: string, inQueue: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [passages, setPassagesState] = useState<Passage[]>(() => loadPassages());
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  useEffect(() => savePassages(passages), [passages]);
  useEffect(() => saveProgress(progress), [progress]);

  const value = useMemo<AppContextValue>(() => {
    const approvedPassages = passages.filter((p) => p.status === 'Approved');
    return {
      passages,
      setPassages: setPassagesState,
      approvedPassages,
      progress,
      recordAttempt: (a) => {
        const attempt: Attempt = {
          ...a,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        setProgress((prev) => {
          const next: ProgressState = {
            attempts: [...prev.attempts, attempt],
            revisitQueue: prev.revisitQueue.slice(),
          };
          if (attempt.accuracy < 90 && !next.revisitQueue.includes(attempt.passageId)) {
            next.revisitQueue.push(attempt.passageId);
          }
          return next;
        });
        return attempt;
      },
      addPassage: (p) => {
        const passage: Passage = {
          ...p,
          id: crypto.randomUUID(),
          status: 'Draft',
        };
        setPassagesState((prev) => [...prev, passage]);
        return passage;
      },
      updatePassage: (id, patch) => {
        setPassagesState((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      },
      toggleRevisit: (id, inQueue) => {
        setProgress((prev) => {
          const has = prev.revisitQueue.includes(id);
          let queue = prev.revisitQueue;
          if (inQueue && !has) queue = [...prev.revisitQueue, id];
          else if (!inQueue && has) queue = prev.revisitQueue.filter((p) => p !== id);
          else return prev;
          return { ...prev, revisitQueue: queue };
        });
      },
    };
  }, [passages, progress]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function resetAllData(): void {
  localStorage.removeItem('syllabustype.progress.v1');
  localStorage.removeItem('syllabustype.passages.v1');
  savePassages(SEED_PASSAGES);
}
