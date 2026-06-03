'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Pause, Play, SkipForward, Maximize2 } from 'lucide-react';
import { playSound } from '../../utils/sounds';

export const MiniPlayer: React.FC = () => {
  const router = useRouter();

  const activeRoutine = useAppStore((state) => state.activeRoutine);
  const isMinimized = useAppStore((state) => state.isMinimized);
  const steps = useAppStore((state) => state.playerSteps);
  const currentStepIndex = useAppStore((state) => state.currentStepIndex);
  const timeElapsed = useAppStore((state) => state.timeElapsedInStep);
  const isPlaying = useAppStore((state) => state.isPlaying);

  const setPlayerState = useAppStore((state) => state.setPlayerState);
  const handleStepComplete = useAppStore((state) => state.handleStepComplete);

  if (!activeRoutine || !isMinimized) return null;

  const currentStep = steps[currentStepIndex] || {
    title: 'Finished',
    durationSeconds: 0,
  };
  const stepDuration = currentStep.durationSeconds;
  const timeLeft = stepDuration - timeElapsed;
  const isOvertime = timeLeft < 0;
  const progress =
    stepDuration > 0 ? (timeElapsed / stepDuration) * 100 : 100;

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    return `${seconds < 0 ? '-' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('TIMER_START');
    setPlayerState({ isPlaying: !isPlaying });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStepIndex >= steps.length - 1) {
      playSound('ROUTINE_COMPLETE');
    } else {
      playSound('TIMER_START');
    }
    handleStepComplete();
  };

  const handleExpand = () => {
    setPlayerState({ isMinimized: false });
    router.push('/routine-player');
  };

  return (
    <div
      onClick={handleExpand}
      className="bg-white/90 border border-slate-200/60 p-3 rounded-2xl shadow-xl flex items-center gap-3 w-full max-w-sm mx-auto backdrop-blur-md hover:border-violet-500/30 transition-all cursor-pointer"
    >
      {/* Circular Timer Progress */}
      <div className="relative w-10 h-10 shrink-0" onClick={handleTogglePlay}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="18"
            stroke="rgba(0,0,0,0.05)"
            strokeWidth="3"
            fill="transparent"
          />
          <circle
            cx="50%"
            cy="50%"
            r="18"
            stroke={isOvertime ? '#f43f5e' : '#10b981'}
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 18}
            strokeDashoffset={
              2 * Math.PI * 18 -
              (Math.min(100, progress) / 100) * (2 * Math.PI * 18)
            }
            strokeLinecap="round"
            className="transition-all duration-300 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-slate-800">
          {isPlaying ? (
            <Pause size={14} fill="currentColor" />
          ) : (
            <Play size={14} fill="currentColor" className="ml-0.5" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold truncate text-slate-900">
            {currentStep.title}
          </h4>
          <span
            className={`text-xs font-mono font-medium ${
              isOvertime ? 'text-rose-600 animate-pulse' : 'text-slate-500'
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 truncate">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {activeRoutine.title}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 border-l border-slate-200/60 pl-2 ml-1">
        <button
          onClick={handleNext}
          className="p-2 text-[var(--text-secondary)] hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
          title="Next Step"
        >
          <SkipForward size={16} />
        </button>
        <button
          onClick={handleExpand}
          className="p-2 text-[var(--text-secondary)] hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
          title="Maximize"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
};
export default MiniPlayer;
