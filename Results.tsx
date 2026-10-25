import { useEffect, useMemo } from 'react';
import type { Passage } from '../types';
import { TYPE_META } from '../lib/meta';
import { useCountUp } from '../lib/useCountUp';
import { useApp } from '../context/AppContext';
import { RotateCcw, ArrowRight, PlusCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface AttemptResult {
  passage: Passage;
  typed: string;
  startTime: number;
  endTime: number;
  errors: number;
  correctChars: number;
  totalChars: number;
  mistakeIndices: number[];
}

interface Props {
  result: AttemptResult;
  onRetry: () => void;
  onNext: () => void;
  nextPassage?: Passage | null;
}

export function Results({ result, onRetry, onNext, nextPassage }: Props) {
  const { progress, toggleRevisit } = useApp();
  const durationSec = Math.max(1, (result.endTime - result.startTime) / 1000);
  const wpm = Math.round((result.correctChars / 5) / (durationSec / 60));
  const accuracy = result.typed.length === 0 ? 0 : Math.round((result.correctChars / result.typed.length) * 100);
  const autoAdded = accuracy < 90;
  const inQueue = progress.revisitQueue.includes(result.passage.id);

  const wpmAnim = useCountUp(wpm, 700, true);
  const accAnim = useCountUp(accuracy, 800, true);
  const errAnim = useCountUp(result.errors, 600, true);
  const timeAnim = useCountUp(Math.round(durationSec), 700, true);

  const grade = useMemo(() => {
    if (accuracy >= 95 && wpm >= 50) return { label: 'Excellent', tone: 'text-teal-600' };
    if (accuracy >= 90) return { label: 'Solid', tone: 'text-ink-700' };
    if (accuracy >= 75) return { label: 'Keep practising', tone: 'text-amber-600' };
    return { label: 'Needs revisiting', tone: 'text-red-500' };
  }, [accuracy, wpm]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="animate-pop-in card overflow-hidden p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              {result.passage.subject} · {result.passage.module}
            </span>
            <h1 className="mt-1 text-2xl font-bold text-ink-900 sm:text-3xl">{result.passage.topic}</h1>
          </div>
          <span className={`chip ${TYPE_META[result.passage.type].bg} ${TYPE_META[result.passage.type].color} ${TYPE_META[result.passage.type].border} border`}>
            {result.passage.type}
          </span>
        </div>

        {/* Big numbers */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <BigStat label="WPM" value={Math.round(wpmAnim)} />
          <BigStat label="Accuracy" value={`${Math.round(accAnim)}%`} accent="text-teal-600" />
          <BigStat label="Errors" value={Math.round(errAnim)} />
          <BigStat label="Time" value={`${Math.round(timeAnim)}s`} />
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
          <span className={grade.tone}>{grade.label}</span>
          {autoAdded && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" /> Added to revisit queue
            </span>
          )}
          {!autoAdded && accuracy >= 90 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs text-teal-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> No revisit needed
            </span>
          )}
        </div>

        {/* Mistake review */}
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-500">Mistake review</h2>
          <div className="rounded-xl border border-ink-200 bg-white p-4 font-mono text-sm leading-relaxed sm:text-base">
            <MistakePassage text={result.passage.text} typed={result.typed} />
          </div>
        </div>

        {/* Source */}
        <p className="mt-4 text-xs text-ink-500">
          Source: {result.passage.source}
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={() => toggleRevisit(result.passage.id, !inQueue)}
            className={inQueue ? 'btn-ghost' : 'btn-outline'}
          >
            <PlusCircle className="h-4 w-4" />
            {inQueue ? 'In revisit queue' : 'Add to revisit queue'}
          </button>
          <button onClick={onRetry} className="btn-outline">
            <RotateCcw className="h-4 w-4" /> Retry this passage
          </button>
          <button onClick={onNext} disabled={!nextPassage} className="btn-accent">
            <ArrowRight className="h-4 w-4" /> Next passage
          </button>
        </div>
      </div>
    </div>
  );
}

function BigStat({ label, value, accent = 'text-ink-900' }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-xl bg-cream/60 p-4 text-center">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</div>
      <div className={`mt-1 font-mono text-3xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function MistakePassage({ text, typed }: { text: string; typed: string }) {
  const chars = Array.from(text);
  return (
    <div className="whitespace-pre-wrap break-words">
      {chars.map((ch, i) => {
        const tCh = typed[i];
        let cls = 'text-ink-300';
        if (i < typed.length) {
          if (tCh === ch) cls = 'text-teal-600';
          else cls = 'text-red-500 bg-red-100/70 rounded underline decoration-red-500 underline-offset-2';
        }
        return (
          <span key={i} className={cls}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        );
      })}
    </div>
  );
}
