'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

const TIMER_WORKER_CODE = `
let timerId = null;

self.onmessage = (e) => {
  if (e.data === 'start') {
    if (!timerId) {
      timerId = setInterval(() => {
        postMessage('tick');
      }, 1000);
    }
  } else if (e.data === 'stop') {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }
};
`;

export const useTimerWorker = () => {
  const isPlaying = useAppStore((state) => state.isPlaying);
  const activeRoutine = useAppStore((state) => state.activeRoutine);
  const setPlayerState = useAppStore((state) => state.setPlayerState);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      try {
        const blob = new Blob([TIMER_WORKER_CODE], {
          type: 'application/javascript',
        });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);
        workerRef.current = worker;

        worker.onmessage = (e) => {
          if (e.data === 'tick') {
            setPlayerState((prev) => {
              if (!prev.isPlaying) return prev;
              return { timeElapsedInStep: prev.timeElapsedInStep + 1 };
            });
          }
        };

        return () => {
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
        };
      } catch (err) {
        console.error('Failed to initialize inline Web Worker:', err);
      }
    }
  }, [setPlayerState]);

  useEffect(() => {
    if (activeRoutine && isPlaying) {
      workerRef.current?.postMessage('start');
    } else {
      workerRef.current?.postMessage('stop');
    }
  }, [activeRoutine, isPlaying]);
};
export default useTimerWorker;
