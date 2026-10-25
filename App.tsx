import { useCallback, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Practice } from './pages/Practice';
import { Results, type AttemptResult } from './pages/Results';
import { Progress } from './pages/Progress';
import { Faculty } from './pages/Faculty';
import type { Passage } from './types';

export type Route = 'dashboard' | 'practice' | 'results' | 'progress' | 'faculty';

function Shell() {
  const { approvedPassages, recordAttempt } = useApp();
  const [route, setRoute] = useState<Route>('dashboard');
  const [activePassage, setActivePassage] = useState<Passage | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);

  const startPractice = useCallback((p: Passage) => {
    setActivePassage(p);
    setResult(null);
    setRoute('practice');
    window.scrollTo({ top: 0 });
  }, []);

  const handleNavigate = useCallback((r: Route) => {
    if (r === 'practice' && !activePassage && approvedPassages.length > 0) {
      setActivePassage(approvedPassages[0]);
    }
    setRoute(r);
    window.scrollTo({ top: 0 });
  }, [activePassage, approvedPassages]);

  const handleFinish = useCallback(
    (res: Omit<AttemptResult, never>) => {
      recordAttempt({
        passageId: res.passage.id,
        topic: res.passage.topic,
        subject: res.passage.subject,
        module: res.passage.module,
        type: res.passage.type,
        wpm: Math.round((res.correctChars / 5) / Math.max(0.001, (res.endTime - res.startTime) / 60000)),
        accuracy: res.typed.length === 0 ? 0 : Math.round((res.correctChars / res.typed.length) * 100),
        errors: res.errors,
        durationSec: Math.round((res.endTime - res.startTime) / 1000),
        totalChars: res.totalChars,
        correctChars: res.correctChars,
        mistakeIndices: res.mistakeIndices,
      });
      setResult(res);
      setRoute('results');
      window.scrollTo({ top: 0 });
    },
    [recordAttempt],
  );

  const handleSkip = useCallback(() => {
    const idx = approvedPassages.findIndex((p) => p.id === activePassage?.id);
    const next = approvedPassages[(idx + 1) % approvedPassages.length] ?? approvedPassages[0];
    if (next) startPractice(next);
  }, [approvedPassages, activePassage, startPractice]);

  const nextPassage = activePassage
    ? approvedPassages[(approvedPassages.findIndex((p) => p.id === activePassage.id) + 1) % approvedPassages.length] ?? null
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar route={route} onNavigate={handleNavigate} />
      <main className="flex-1">
        {route === 'dashboard' && (
          <Dashboard
            onStart={startPractice}
            onPractiseRevisit={startPractice}
            onNavigateProgress={() => setRoute('progress')}
          />
        )}
        {route === 'practice' && activePassage && (
          <Practice passage={activePassage} onFinish={handleFinish} onSkip={handleSkip} />
        )}
        {route === 'practice' && !activePassage && (
          <div className="mx-auto max-w-md px-4 py-16 text-center">
            <p className="text-ink-600">No passage selected. Pick one from the dashboard.</p>
            <button onClick={() => setRoute('dashboard')} className="btn-primary mt-4">Go to dashboard</button>
          </div>
        )}
        {route === 'results' && result && (
          <Results
            result={result}
            onRetry={() => startPractice(result.passage)}
            onNext={() => nextPassage && startPractice(nextPassage)}
            nextPassage={nextPassage}
          />
        )}
        {route === 'results' && !result && (
          <div className="mx-auto max-w-md px-4 py-16 text-center">
            <p className="text-ink-600">No result to show yet. Complete a practice session first.</p>
            <button onClick={() => setRoute('dashboard')} className="btn-primary mt-4">Go to dashboard</button>
          </div>
        )}
        {route === 'progress' && <Progress onPractiseRevisit={startPractice} />}
        {route === 'faculty' && <Faculty />}
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-10 border-t border-ink-100/70 bg-cream/60">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <p className="text-xs text-ink-500">
          Typing metrics are practice signals, not proof of exam mastery.
        </p>
        <p className="mt-1 text-xs text-ink-400">
          SyllabusType — hackathon demo · all progress is stored locally in your browser.
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
