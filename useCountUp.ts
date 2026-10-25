import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, duration = 800, start = true): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const from = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + (target - from) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setValue(target);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, start]);
  return value;
}
