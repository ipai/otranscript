import { useCallback } from 'react';

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useTranscriptSession() {
  const checkAndIncrementSession = useCallback(async (transcriptId: string) => {
    const viewedTranscripts = JSON.parse(localStorage.getItem('viewedTranscripts') || '{}');
    const lastViewTime = viewedTranscripts[transcriptId];
    const now = Date.now();

    // Clean up old sessions
    Object.entries(viewedTranscripts).forEach(([id, time]) => {
      if (now - (time as number) > SESSION_DURATION) {
        delete viewedTranscripts[id];
      }
    });

    // Check if we need to increment
    const needsIncrement = !lastViewTime || (now - lastViewTime) > SESSION_DURATION;

    if (needsIncrement) {
      await fetch('/api/transcript/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transcriptId }),
      });

      // Update session storage
      viewedTranscripts[transcriptId] = now;
      localStorage.setItem('viewedTranscripts', JSON.stringify(viewedTranscripts));
    }

    return needsIncrement;
  }, []);

  return { checkAndIncrementSession };
}
