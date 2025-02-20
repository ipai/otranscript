import { useState, useEffect, useCallback } from 'react';

interface UseProgressSimulationProps {
  isActive: boolean;
  duration?: number;
  increment?: number;
  maxProgress?: number;
  onComplete?: () => void;
}

export function useProgressSimulation({
  isActive,
  duration = 200,
  increment = 1,
  maxProgress = 95,
  onComplete
}: UseProgressSimulationProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(maxProgress, prev + increment);
        if (next === maxProgress && onComplete) {
          onComplete();
        }
        return next;
      });
    }, duration);

    return () => clearInterval(interval);
  }, [isActive, duration, increment, maxProgress, onComplete]);

  const setProgressValue = useCallback((value: number) => {
    setProgress(value);
  }, []);

  return { progress, setProgress: setProgressValue };
}
