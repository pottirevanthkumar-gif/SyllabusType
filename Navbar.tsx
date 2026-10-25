import type { Route } from '../App';
import { BookOpenText, LayoutDashboard, PenLine, BarChart3, GraduationCap } from 'lucide-react';

const LINKS: { key: Route; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'practice', label: 'Practice', icon: PenLine },
  { key: 'progress', label: 'My Progress', icon: BarChart3 },
  { key: 'faculty', label: 'Faculty', icon: GraduationCap },
];

interface Props {
  route: Route;
  onNavigate: (r: Route) => void;
}

export function Navbar({ route, onNavigate }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-100/70 bg-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="group flex items-center gap-2.5"
          aria-label="SyllabusType home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white shadow-soft transition-transform group-hover:-translate-y-0.5">
            <BookOpenText className="h-5 w-5 text-teal-300" />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink-900">
            Syllabus<span className="text-teal-500">Type</span>
          </span>
        </button>
        <div className="flex items-center gap-1 overflow-x-auto sm:gap-1.5">
          {LINKS.map(({ key, label, icon: Icon }) => {
            const active = route === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={
                  'flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ' +
                  (active
                    ? 'bg-ink-900 text-white shadow-soft'
                    : 'text-ink-600 hover:bg-ink-100/70 hover:text-ink-900')
                }
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
