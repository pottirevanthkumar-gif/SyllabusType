import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Passage } from '../types';
import { TYPE_META } from '../lib/meta';
import { RotateCcw, SkipForward, Flag, Keyboard } from 'lucide-react';

interface Props {
  passage: Passage;
  onFinish: (result: {
    passage: Passage;
    typed: string;
    startTime: number;
    endTime: number;
    errors: number;
    correctChars: number;
    totalChars: number;
    mistakeIndices: number[];
  }) => void;
  onSkip: () => void;
}

export function Practice({ passage, onFinish, onSkip }: Props) {
  const text = passage.text;
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const finishedRef = useRef(false);

  // reset when passage changes
  useEffect(() => {
    setTyped('');
    setStartTime(null);
    finishedRef.current = false;
    setShake(false);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [passage.id]);

  const errors = useMemo(() => {
    let e = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== text[i]) e++;
    }
    return e;
  }, [typed, text]);

  const correctChars = typed.length - errors;
  const isComplete = typed.length >= text.length;

  const elapsedSec = startTime ? (Date.now() - startTime) / 1000 : 0;
  const minutes = elapsedSec / 60 || 1 / 60;
  const wpm = Math.max(0, Math.round(correctChars / 5 / minutes));
  const accuracy = typed.length === 0 ? 100 : Math.round((correctChars / typed.length) * 100);

  // live tick for timer display
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!startTime || isComplete) return;
    const i = setInterval(() => forceTick((n) => n + 1), 250);
    return () => clearInterval(i);
  }, [startTime, isComplete]);

  // auto-finish
  useEffect(() => {
    if (isComplete && !finishedRef.current && startTime) {
      finishedRef.current = true;
      const endTime = Date.now();
      onFinish({
        passage,
        typed,
        startTime,
        endTime,
        errors,
        correctChars,
        totalChars: text.length,
        mistakeIndices: mistakeIndicesFromTyped(typed, text),
      });
    }
  }, [isComplete, startTime, typed, errors, correctChars, text.length, passage, onFinish]);

  // Single source of truth for input. The textarea is the real input (works on mobile
  // soft keyboards), but is visually transparent and overlays the colored passage.
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const raw = e.target.value;
      // The caret can jump on mobile autocorrect; clamp to passage length.
      if (raw.length > text.length) {
        setTyped(raw.slice(0, text.length));
        return;
      }
      // On mobile, typing sometimes inserts multiple chars or replaces a word.
      // We only allow appending one character at a time (or deleting) so the
      // character-level coloring stays accurate.
      setTyped((prev) => {
        // deletion (including select-all + type)
        if (raw.length < prev.length) {
          // accept deletion only if it's a tail truncation (mobile backspace)
          if (prev.startsWith(raw)) {
            if (startTime == null && raw.length > 0) setStartTime(Date.now());
            return raw;
          }
          // a replacement / mid-string edit — reject to keep things simple
          return prev;
        }
        // append: only accept if raw starts with prev and adds 1 char
        if (raw.length === prev.length + 1 && raw.startsWith(prev)) {
          if (startTime == null) setStartTime(Date.now());
          return raw;
        }
        // anything else (multi-char insert) — accept single-char appends only
        if (raw.length > prev.length) {
          // take exactly one new char from the end to keep coloring correct
          if (startTime == null) setStartTime(Date.now());
          return prev + raw.slice(prev.length, prev.length + 1);
        }
        return prev;
      });
    },
    [text.length, startTime],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Esc to restart (desktop)
      if (e.key === 'Escape') {
        e.preventDefault();
        setTyped('');
        setStartTime(null);
        finishedRef.current = false;
        return;
      }
      // Enter: only accept if the next expected char is a newline (multi-line code).
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isComplete) return;
        if (text[typed.length] === '\n') {
          if (startTime == null) setStartTime(Date.now());
          setTyped((t) => t + '\n');
        } else {
          setShake(true);
          setTimeout(() => setShake(false), 250);
        }
        return;
      }
      // prevent tab from leaving the field
      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }
    },
    [isComplete, text, typed.length, startTime],
  );

  const restart = useCallback(() => {
    setTyped('');
    setStartTime(null);
    finishedRef.current = false;
    inputRef.current?.focus();
  }, []);

  const finishNow = useCallback(() => {
    if (!startTime || finishedRef.current) return;
    finishedRef.current = true;
    onFinish({
      passage,
      typed,
      startTime,
      endTime: Date.now(),
      errors,
      correctChars,
      totalChars: text.length,
      mistakeIndices: mistakeIndicesFromTyped(typed, text),
    });
  }, [startTime, typed, errors, correctChars, text.length, passage, onFinish]);

  const progress = Math.round((typed.length / text.length) * 100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      {/* header chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
        <span className="chip bg-ink-900 text-white">{passage.subject}</span>
        <span className="text-ink-300">/</span>
        <span className="chip bg-ink-100 text-ink-700">{passage.module}</span>
        <span className={`chip ${TYPE_META[passage.type].bg} ${TYPE_META[passage.type].color} ${TYPE_META[passage.type].border} border`}>
          {passage.type}
        </span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{passage.topic}</h1>

      {/* progress bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* typing passage — textarea overlays the colored display */}
      <div
        className={
          'relative mt-4 rounded-2xl border bg-white p-5 font-mono shadow-card transition-colors sm:p-6 ' +
          (focused
            ? 'border-teal-400 ring-2 ring-teal-400/30'
            : 'border-ink-200') +
          (shake ? ' animate-shake' : '')
        }
        style={{ minHeight: '14rem' }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* colored passage rendering */}
        <PassageDisplay text={text} typed={typed} />
        {/* transparent textarea on top — real input for mobile + desktop */}
        <textarea
          ref={inputRef}
          value={typed}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="absolute inset-0 h-full w-full resize-none bg-transparent p-5 font-mono text-lg leading-relaxed text-transparent caret-teal-500 outline-none sm:p-6 sm:text-xl"
          style={{ caretColor: 'transparent' }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          inputMode="text"
          aria-label="Typing area"
        />
      </div>

      {/* keyboard hint */}
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-ink-500">
        <Keyboard className="h-3.5 w-3.5" />
        Tap the passage and start typing ·
        <kbd className="rounded border border-ink-200 bg-white px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd>
        to restart
      </div>

      {/* live stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="WPM" value={wpm} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Errors" value={errors} />
        <Stat label="Time" value={`${elapsedSec.toFixed(1)}s`} />
      </div>

      {/* actions */}
      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        <button onClick={restart} className="btn-ghost">
          <RotateCcw className="h-4 w-4" /> Restart
        </button>
        <button onClick={onSkip} className="btn-outline">
          <SkipForward className="h-4 w-4" /> Skip
        </button>
        <button onClick={finishNow} className="btn-primary" disabled={!startTime}>
          <Flag className="h-4 w-4" /> Finish attempt
        </button>
      </div>
    </div>
  );
}

function PassageDisplay({ text, typed }: { text: string; typed: string }) {
  const chars = Array.from(text);
  return (
    <div className="whitespace-pre-wrap break-words text-lg leading-relaxed sm:text-xl">
      {chars.map((ch, i) => {
        const typedCh = typed[i];
        let cls = 'text-ink-300';
        if (i < typed.length) {
          if (typedCh === ch) cls = 'text-teal-600';
          else cls = 'text-red-500 bg-red-100/70 rounded underline decoration-red-500 decoration-2 underline-offset-2';
        }
        const isCaret = i === typed.length;
        const caret = isCaret ? (
          <span className="relative -mx-px">
            <span className="absolute inset-y-0 -left-px w-[2px] animate-caret-blink bg-teal-500" />
          </span>
        ) : null;
        return (
          <span key={i} className={'relative ' + cls}>
            {caret}
            {ch === ' ' && i >= typed.length ? '\u00A0' : ch}
          </span>
        );
      })}
      {typed.length >= chars.length && (
        <span className="ml-1 inline-block h-[1.1em] w-[2px] animate-caret-blink bg-teal-500 align-middle" />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-3.5">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</div>
      <div className="mt-1 font-mono text-xl font-bold text-ink-900">{value}</div>
    </div>
  );
}

function mistakeIndicesFromTyped(typed: string, text: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] !== text[i]) out.push(i);
  }
  return out;
}
