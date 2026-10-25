import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import type { Passage } from '../types';
import { TYPE_META } from '../lib/meta';
import { RotateCcw, TrendingUp, ShieldCheck } from 'lucide-react';

interface Props {
  onPractiseRevisit: (p: Passage) => void;
}

export function Progress({ onPractiseRevisit }: Props) {
  const { progress, approvedPassages } = useApp();
  const attempts = progress.attempts;

  const chartData = useMemo(
    () =>
      attempts.slice(-15).map((a, i) => ({
        idx: i + 1,
        label: `#${i + 1}`,
        WPM: a.wpm,
        Accuracy: a.accuracy,
      })),
    [attempts],
  );

  const topicStats = useMemo(() => {
    const map = new Map<string, { subject: string; topic: string; attempts: number; bestWpm: number; avgAcc: number; last: number }>();
    for (const a of attempts) {
      const key = `${a.subject}::${a.topic}`;
      const e = map.get(key) ?? { subject: a.subject, topic: a.topic, attempts: 0, bestWpm: 0, avgAcc: 0, last: 0 };
      e.attempts += 1;
      e.bestWpm = Math.max(e.bestWpm, a.wpm);
      e.avgAcc += a.accuracy;
      e.last = Math.max(e.last, a.timestamp);
      map.set(key, e);
    }
    return Array.from(map.values()).map((e) => ({
      ...e,
      avgAcc: Math.round(e.avgAcc / e.attempts),
    }));
  }, [attempts]);

  const weakTopics = useMemo(
    () => [...topicStats].sort((a, b) => a.avgAcc - b.avgAcc).slice(0, 5),
    [topicStats],
  );

  const revisitPassages = useMemo(
    () => progress.revisitQueue.map((id) => approvedPassages.find((p) => p.id === id)).filter(Boolean) as Passage[],
    [progress.revisitQueue, approvedPassages],
  );

  if (attempts.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-500">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-ink-900">No attempts yet</h1>
          <p className="mt-1 text-sm text-ink-500">
            Complete a practice session to see your WPM and accuracy trends here.
          </p>
        </div>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-400">
          <ShieldCheck className="h-3.5 w-3.5" /> Your performance is personal to you.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">My Progress</h1>
        <p className="mt-1 text-sm text-ink-500">Last {chartData.length} attempts visualised.</p>
      </header>

      {/* Chart */}
      <section className="card p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-900">WPM & Accuracy trend</h2>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf5" vertical={false} />
              <XAxis dataKey="label" stroke="#7c89b3" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#7c89b3" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e8ecf5',
                  boxShadow: '0 8px 24px -12px rgba(19,26,54,0.25)',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="WPM" stroke="#10a08f" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Accuracy" stroke="#2e3a66" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Topic table */}
      <section className="mt-6 card overflow-hidden">
        <div className="border-b border-ink-100 p-5 sm:p-6">
          <h2 className="text-base font-bold text-ink-900">Topic-wise breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-cream/60 text-xs uppercase tracking-wide text-ink-500">
                <th className="px-5 py-3 font-semibold">Subject</th>
                <th className="px-5 py-3 font-semibold">Topic</th>
                <th className="px-5 py-3 font-semibold text-right">Attempts</th>
                <th className="px-5 py-3 font-semibold text-right">Best WPM</th>
                <th className="px-5 py-3 font-semibold text-right">Avg accuracy</th>
                <th className="px-5 py-3 font-semibold text-right">Last practised</th>
              </tr>
            </thead>
            <tbody>
              {topicStats.map((t) => (
                <tr key={`${t.subject}-${t.topic}`} className="border-t border-ink-100">
                  <td className="px-5 py-3 text-ink-700">{t.subject}</td>
                  <td className="px-5 py-3 font-medium text-ink-900">{t.topic}</td>
                  <td className="px-5 py-3 text-right font-mono text-ink-700">{t.attempts}</td>
                  <td className="px-5 py-3 text-right font-mono text-ink-700">{t.bestWpm}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={'font-mono ' + (t.avgAcc < 80 ? 'text-red-500' : t.avgAcc < 90 ? 'text-amber-600' : 'text-teal-600')}>
                      {t.avgAcc}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-ink-500">{relativeTime(t.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weak topics */}
        <section className="card p-5 sm:p-6">
          <h2 className="mb-3 text-base font-bold text-ink-900">Weak topics</h2>
          {weakTopics.length === 0 ? (
            <p className="text-sm text-ink-500">No data yet.</p>
          ) : (
            <ul className="space-y-2">
              {weakTopics.map((t) => (
                <li key={`weak-${t.subject}-${t.topic}`} className="flex items-center justify-between rounded-xl bg-cream/60 p-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">{t.subject}</div>
                    <div className="font-medium text-ink-900">{t.topic}</div>
                  </div>
                  <span className="font-mono text-sm font-bold text-red-500">{t.avgAcc}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Revisit queue */}
        <section className="card p-5 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink-900">
            <RotateCcw className="h-4 w-4 text-teal-500" /> Revisit queue
            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">{revisitPassages.length}</span>
          </h2>
          {revisitPassages.length === 0 ? (
            <p className="text-sm text-ink-500">Your queue is empty — practise more to fill it up.</p>
          ) : (
            <ul className="space-y-2">
              {revisitPassages.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-cream/60 p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      {p.subject} · {p.module}
                      <span className={`chip ${TYPE_META[p.type].bg} ${TYPE_META[p.type].color}`}>{p.type}</span>
                    </div>
                    <div className="truncate font-medium text-ink-900">{p.topic}</div>
                  </div>
                  <button onClick={() => onPractiseRevisit(p)} className="btn-accent shrink-0">Practise now</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-400">
        <ShieldCheck className="h-3.5 w-3.5" /> Your performance is personal to you.
      </p>
    </div>
  );
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
