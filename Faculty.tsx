import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Passage, PassageStatus, PassageType } from '../types';
import { ALL_TYPES, TYPE_META, STATUS_FLOW } from '../lib/meta';
import { ShieldAlert, Plus, Archive, Pencil, X, Check, ArrowRight, FileText } from 'lucide-react';

const STATUSES: PassageStatus[] = ['Draft', 'In Review', 'Approved', 'Archived'];

const STATUS_STYLE: Record<PassageStatus, string> = {
  Draft: 'bg-ink-100 text-ink-700',
  'In Review': 'bg-amber-100 text-amber-700',
  Approved: 'bg-teal-100 text-teal-700',
  Archived: 'bg-ink-50 text-ink-500 line-through',
};

export function Faculty() {
  const { passages, addPassage, updatePassage } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Passage | null>(null);

  const counts = useMemo(() => {
    const c: Record<PassageStatus, number> = { Draft: 0, 'In Review': 0, Approved: 0, Archived: 0 };
    for (const p of passages) c[p.status] += 1;
    return c;
  }, [passages]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Faculty Content Hub</h1>
          <p className="mt-1 text-sm text-ink-500">Create and approve passages for student practice.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-accent">
          <Plus className="h-4 w-4" /> New passage
        </button>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <span className="font-semibold">Demo:</span> in the full product this page is role-restricted to faculty accounts. Anyone can edit here for the hackathon demo.
        </p>
      </div>

      {/* status counts */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUSES.map((s) => (
          <div key={s} className="card p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">{s}</div>
            <div className="mt-1 text-2xl font-bold text-ink-900">{counts[s]}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <PassageForm
          initial={editing}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          onSubmit={(data) => {
            if (editing) {
              updatePassage(editing.id, data);
            } else {
              addPassage(data as Omit<Passage, 'id' | 'status'>);
            }
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {/* list */}
      <section className="card overflow-hidden">
        <div className="border-b border-ink-100 p-5">
          <h2 className="text-base font-bold text-ink-900">All passages ({passages.length})</h2>
        </div>
        {passages.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-500">No passages yet. Create one to get started.</div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {passages.map((p) => (
              <li key={p.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      {p.subject} · {p.module}
                      <span className={`chip ${TYPE_META[p.type].bg} ${TYPE_META[p.type].color}`}>{p.type}</span>
                      <span className={`chip ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                    </div>
                    <h3 className="mt-1 font-semibold text-ink-900">{p.topic}</h3>
                    <p className="mt-1 line-clamp-2 font-mono text-sm text-ink-600">{p.text.replace(/\n/g, ' ⏎ ')}</p>
                    <p className="mt-1 text-xs text-ink-400">Source: {p.source}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {STATUS_FLOW[p.status] && (
                      <button
                        onClick={() => updatePassage(p.id, { status: STATUS_FLOW[p.status] as PassageStatus })}
                        className="btn-ghost text-xs"
                        title={`Advance to ${STATUS_FLOW[p.status]}`}
                      >
                        <ArrowRight className="h-3.5 w-3.5" /> {STATUS_FLOW[p.status]}
                      </button>
                    )}
                    <button
                      onClick={() => { setEditing(p); setShowForm(true); }}
                      className="btn-ghost text-xs"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => updatePassage(p.id, { status: 'Archived' })}
                      className="btn-ghost text-xs text-ink-500"
                      title="Archive"
                      disabled={p.status === 'Archived'}
                    >
                      <Archive className="h-3.5 w-3.5" /> Archive
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

interface FormProps {
  initial: Passage | null;
  onCancel: () => void;
  onSubmit: (data: Partial<Omit<Passage, 'id'>> & { topic: string; text: string; subject: string; module: string; branch: string; semester: number; type: PassageType; source: string }) => void;
}

function PassageForm({ initial, onCancel, onSubmit }: FormProps) {
  const [branch, setBranch] = useState(initial?.branch ?? 'CSE-AIML');
  const [semester, setSemester] = useState(String(initial?.semester ?? 3));
  const [subject, setSubject] = useState(initial?.subject ?? '');
  const [module, setModule] = useState(initial?.module ?? 'Module 1');
  const [topic, setTopic] = useState(initial?.topic ?? '');
  const [type, setType] = useState<PassageType>(initial?.type ?? 'Definition');
  const [text, setText] = useState(initial?.text ?? '');

  const valid = subject.trim() && topic.trim() && text.trim() && Number(semester) > 0;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-ink-950/40 p-4 backdrop-blur-sm sm:items-center" onClick={onCancel}>
      <div
        className="animate-pop-in w-full max-w-lg rounded-2xl bg-white p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
            <FileText className="h-5 w-5 text-teal-500" /> {initial ? 'Edit passage' : 'New passage'}
          </h2>
          <button onClick={onCancel} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onSubmit({
              branch,
              semester: Number(semester),
              subject: subject.trim(),
              module,
              topic: topic.trim(),
              type,
              text,
              source: `${module} – Faculty approved`,
            });
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Branch</label>
              <input className="input" value={branch} onChange={(e) => setBranch(e.target.value)} />
            </div>
            <div>
              <label className="label">Semester</label>
              <input type="number" min={1} className="input" value={semester} onChange={(e) => setSemester(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <input className="input" placeholder="e.g. Mathematics" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="label">Module</label>
              <input className="input" placeholder="Module 1" value={module} onChange={(e) => setModule(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Topic</label>
              <input className="input" placeholder="e.g. Matrix rank" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value as PassageType)}>
                {ALL_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Passage text</label>
            <textarea
              className="input min-h-[120px] font-mono"
              placeholder="Type or paste the passage. For code, use Enter for new lines."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="mt-1 text-xs text-ink-400">Tip: for multi-line code, press Enter to add new lines — students will type them too.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={!valid} className="btn-accent">
              <Check className="h-4 w-4" /> {initial ? 'Save changes' : 'Create as Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
