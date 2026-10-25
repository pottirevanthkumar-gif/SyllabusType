import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Passage, PassageType } from '../types';
import { ALL_TYPES, TYPE_META } from '../lib/meta';
import { getStreak, getSessionsToday, getAverageWpm, getAverageAccuracy } from '../lib/storage';
import { Flame, CalendarCheck, Gauge, Target, RotateCcw, PenLine, ChevronRight } from 'lucide-react';

interface Props {
  onStart: (passage: Passage) => void;
  onPractiseRevisit: (passage: Passage) => void;
  onNavigateProgress: () => void;
}

const BRANCHES = ['CSE-AIML'];

export function Dashboard({ onStart, onPractiseRevisit, onNavigateProgress }: Props) {
  const { approvedPassages, progress } = useApp();

  const branches = useMemo(() => Array.from(new Set(approvedPassages.map((p) => p.branch))), [approvedPassages]);
  const [branch, setBranch] = useState(branches[0] ?? BRANCHES[0]);
  const semesters = useMemo(
    () => Array.from(new Set(approvedPassages.filter((p) => p.branch === branch).map((p) => p.semester))).sort((a, b) => a - b),
    [approvedPassages, branch],
  );
  const [semester, setSemester] = useState<number | null>(null);
  const subjects = useMemo(
    () => Array.from(new Set(approvedPassages.filter((p) => p.branch === branch && p.semester === (semester ?? p.semester)).map((p) => p.subject))),
    [approvedPassages, branch, semester],
  );
  const [subject, setSubject] = useState<string | null>(null);
  const modules = useMemo(
    () => Array.from(new Set(approvedPassages.filter((p) => (subject ? p.subject === subject : true)).map((p) => p.module))),
    [approvedPassages, subject],
  );
  const [module, setModule] = useState<string | null>(null);
  const [type, setType] = useState<PassageType | 'All'>('All');

  const filtered = useMemo(
    () =>
      approvedPassages.filter(
        (p) =>
          p.branch === branch &&
          (semester == null || p.semester === semester) &&
          (subject == null || p.subject === subject) &&
          (module == null || p.module === module) &&
          (type === 'All' || p.type === type),
      ),
    [approvedPassages, branch, semester, subject, module, type],
  );

  const revisitPassages = useMemo(
    () => progress.revisitQueue.map((id) => approvedPassages.find((p) => p.id === id)).filter(Boolean) as Passage[],
    [progress.revisitQueue, approvedPassages],
  );

  const stats = useMemo(
    () => ({
      streak: getStreak(),
      today: getSessionsToday(),
      wpm: getAverageWpm(),
      acc: getAverageAccuracy(),
    }),
    [progress.attempts.length],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Hero */}
      <section className="animate-fade-in mb-8 sm:mb-10">
        <div className="card relative overflow-hidden p-7 sm:p-10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal-500/10 blur-3xl" aria-hidden />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-ink-900/10 blur-3xl" aria-hidden />
          <div className="relative">
            <span className="chip bg-teal-100 text-teal-700">Beta · Hackathon demo</span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              Type. <span className="text-teal-500">Revise.</span> Retain.
            </h1>
            <p className="mt-3 max-w-xl text-base text-ink-600 sm:text-lg">
              Turn your syllabus into daily typing practice. Type definitions, formulas and code
              straight from your course — and remember them while you're at it.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => filtered[0] && onStart(filtered[0])}
                disabled={filtered.length === 0}
                className="btn-accent"
              >
                <PenLine className="h-4 w-4" />
                Start practice
              </button>
              <button onClick={onNavigateProgress} className="btn-outline">
                View my progress
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={<Flame className="h-5 w-5" />} label="Your streak" value={`${stats.streak} day${stats.streak === 1 ? '' : 's'}`} accent="text-teal-600" />
        <StatCard icon={<CalendarCheck className="h-5 w-5" />} label="Sessions today" value={String(stats.today)} accent="text-ink-700" />
        <StatCard icon={<Gauge className="h-5 w-5" />} label="Average WPM" value={String(stats.wpm)} accent="text-ink-700" />
        <StatCard icon={<Target className="h-5 w-5" />} label="Average accuracy" value={`${stats.acc}%`} accent="text-teal-600" />
      </section>

      {/* Selector cascade */}
      <section className="card p-5 sm:p-6 animate-fade-in">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-900">Choose what to practise</h2>
          <span className="text-xs text-ink-500">{filtered.length} passage{filtered.length === 1 ? '' : 's'}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="Branch" value={branch} onChange={setBranch} options={branches.length ? branches : BRANCHES} />
          <Select
            label="Semester"
            value={semester == null ? '' : String(semester)}
            onChange={(v) => setSemester(v ? Number(v) : null)}
            options={semesters.map(String)}
            placeholder="Any"
          />
          <Select label="Subject" value={subject ?? ''} onChange={(v) => setSubject(v || null)} options={subjects} placeholder="Any" />
          <Select label="Module / Topic" value={module ?? ''} onChange={(v) => setModule(v || null)} options={modules} placeholder="Any" />
        </div>

        {/* Mode tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(['All', ...ALL_TYPES] as const).map((t) => {
            const active = type === t;
            const meta = t === 'All' ? null : TYPE_META[t];
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={
                  'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ' +
                  (active
                    ? 'border-ink-900 bg-ink-900 text-white shadow-soft'
                    : meta
                      ? `${meta.border} ${meta.bg} ${meta.color} hover:opacity-80`
                      : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50')
                }
              >
                {t === 'All' ? 'All modes' : t}
              </button>
            );
          })}
        </div>

        {/* Passage list */}
        <div className="mt-5">
          {filtered.length === 0 ? (
            <EmptyState
              title="No passages match these filters"
              body="Try widening your selection — pick 'Any' for semester, subject or module."
            />
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filtered.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => onStart(p)}
                    className="group w-full rounded-xl border border-ink-100 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lift"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                        <span>{p.subject}</span>
                        <ChevronRight className="h-3 w-3" />
                        <span>{p.module}</span>
                      </div>
                      <span className={`chip ${TYPE_META[p.type].bg} ${TYPE_META[p.type].color} ${TYPE_META[p.type].border} border`}>
                        {p.type}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold text-ink-900">{p.topic}</h3>
                    <p className="mt-1 line-clamp-2 font-mono text-sm text-ink-600">{p.text.replace(/\n/g, ' ⏎ ')}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-600 opacity-0 transition-opacity group-hover:opacity-100">
                      <PenLine className="h-3.5 w-3.5" /> Practise this
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Revisit queue */}
      <section className="mt-6 card p-5 sm:p-6 animate-fade-in">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink-900">
            <RotateCcw className="h-4 w-4 text-teal-500" /> Revisit queue
            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">
              {revisitPassages.length}
            </span>
          </h2>
        </div>
        {revisitPassages.length === 0 ? (
          <EmptyState
            title="Nothing to revisit yet"
            body="Passages with accuracy below 90% land here automatically. Practise a few to see it fill up."
          />
        ) : (
          <ul className="space-y-2">
            {revisitPassages.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-cream/60 p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    {p.subject} · {p.module}
                  </div>
                  <div className="truncate font-semibold text-ink-900">{p.topic}</div>
                </div>
                <button onClick={() => onPractiseRevisit(p)} className="btn-accent shrink-0">
                  Practise now
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input appearance-none pr-9 cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-ink-400" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="card p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
        <span className={accent}>{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-ink-900 sm:text-3xl">{value}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-cream/50 p-6 text-center">
      <p className="font-semibold text-ink-700">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{body}</p>
    </div>
  );
}
