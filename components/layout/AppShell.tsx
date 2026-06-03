'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Brain,
  Briefcase,
  CheckCircle,
  Calendar as CalendarIcon,
  ListTodo,
  PlayCircle,
  StickyNote,
  BookOpen,
  Trash2,
  Minus,
  Plus,
  Play,
  Pause,
  SkipForward,
  X,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import useTimerWorker from '../../hooks/useTimerWorker';
import useReminderSystem from '../../hooks/useReminderSystem';

interface AppShellProps {
  children: React.ReactNode;
  miniPlayer?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Run global background hooks
  useTimerWorker();
  useReminderSystem();

  const uiScale = useAppStore((state) => state.uiScale);
  const setUiScale = useAppStore((state) => state.setUiScale);
  const currentView = pathname.replace('/', '') || 'dashboard';

  // Routine Player states for Dynamic Island
  const activeRoutine = useAppStore((state) => state.activeRoutine);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const currentStepIndex = useAppStore((state) => state.currentStepIndex);
  const timeElapsedInStep = useAppStore((state) => state.timeElapsedInStep);
  const playerSteps = useAppStore((state) => state.playerSteps);
  const setPlayerState = useAppStore((state) => state.setPlayerState);
  const exitPlayer = useAppStore((state) => state.exitPlayer);
  const handleStepComplete = useAppStore((state) => state.handleStepComplete);

  // Island expansion state
  const [isIslandExpanded, setIsIslandExpanded] = React.useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      paths: ['/dashboard', '/activity'],
    },
    {
      id: 'dump',
      label: 'Brain',
      icon: Brain,
      paths: ['/dump', '/tasks', '/projects'],
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarIcon,
      paths: ['/calendar', '/trash'],
    },
    {
      id: 'routines',
      label: 'Focus',
      icon: PlayCircle,
      paths: ['/routines', '/habits'],
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: StickyNote,
      paths: ['/notes', '/journal'],
    },
  ];

  const getActiveTabId = () => {
    if (pathname.includes('/dashboard') || pathname.includes('/activity')) return 'dashboard';
    if (pathname.includes('/dump') || pathname.includes('/tasks') || pathname.includes('/projects')) return 'dump';
    if (pathname.includes('/calendar') || pathname.includes('/trash')) return 'calendar';
    if (pathname.includes('/routines') || pathname.includes('/habits') || pathname.includes('/routine-player')) return 'routines';
    if (pathname.includes('/notes') || pathname.includes('/journal')) return 'notes';
    return '';
  };

  const activeTabId = getActiveTabId();

  const handleNavClick = (item: typeof navItems[0]) => {
    let matchedIdx = -1;
    for (let i = 0; i < item.paths.length; i++) {
      if (pathname === item.paths[i] || pathname.startsWith(item.paths[i] + '/')) {
        matchedIdx = i;
        break;
      }
    }
    
    if (matchedIdx !== -1) {
      const nextIdx = (matchedIdx + 1) % item.paths.length;
      router.push(item.paths[nextIdx] as any);
    } else {
      router.push(item.paths[0] as any);
    }
  };

  // Active step details for timer calculation
  const currentStep = playerSteps[currentStepIndex];
  const duration = currentStep ? currentStep.durationSeconds : 0;
  const remainingSeconds = Math.max(0, duration - timeElapsedInStep);
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;
  const progressPercent = duration > 0 ? (timeElapsedInStep / duration) * 100 : 0;

  const handleZoom = (direction: 'in' | 'out') => {
    const step = 0.1;
    const newScale = direction === 'in' ? uiScale + step : uiScale - step;
    setUiScale(Math.max(0.5, Math.min(1.5, parseFloat(newScale.toFixed(1)))));
  };

  const resetZoom = () => setUiScale(1);

  // Modules that are full-width container views
  const isFullWidthView =
    pathname.startsWith('/calendar') ||
    pathname.startsWith('/notes') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/habits') ||
    pathname.startsWith('/dump') ||
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/routine-player');

  const isRoutinePlayer = currentView === 'routine-player';
  const isQuillPage =
    pathname.includes('/notes/new') ||
    pathname.includes('/notes/edit') ||
    pathname.includes('/journal/new') ||
    pathname.includes('/journal/edit');

  return (
    <div
      className="fixed inset-0 bg-[#F5F7FA] text-[#1E1E1E] font-sans overflow-hidden flex flex-col transition-all duration-200 ease-out"
      style={{
        zoom: uiScale,
        height: `calc(100dvh / ${uiScale})`,
        width: `calc(100vw / ${uiScale})`,
      }}
    >
      {/* 🏝️ DYNAMIC ISLAND (TOP CENTER NAVIGATION & PLAYER STATUS) */}
      {!isRoutinePlayer && activeRoutine && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-in-out">
          <div
            className={`bg-slate-900 text-white rounded-[28px] shadow-2xl border border-white/10 transition-all duration-500 ease-in-out overflow-hidden flex flex-col justify-center
              ${isIslandExpanded ? 'w-[320px] p-5' : 'w-[240px] px-4 py-2.5 h-[48px]'}`}
          >
            {/* Compact Header View */}
            <div className="flex items-center justify-between w-full">
              <div
                className="flex items-center gap-2 cursor-pointer min-w-0"
                onClick={() => setIsIslandExpanded(!isIslandExpanded)}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-xs font-black truncate max-w-[120px] tracking-tight">
                  {currentStep ? currentStep.title : activeRoutine.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-violet-300 tabular-nums">
                  {timeString}
                </span>
                <button
                  onClick={() => router.push('/routine-player' as any)}
                  className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  title="Fullscreen Mode"
                >
                  <ChevronDown size={14} className="rotate-180" />
                </button>
              </div>
            </div>

            {/* Expanded Action & Status View */}
            {isIslandExpanded && (
              <div className="mt-4 space-y-4 animate-fade-in">
                {/* Progress Bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-400 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Controller Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPlayerState({ isPlaying: !isPlaying })}
                    className="p-2.5 bg-white text-slate-900 rounded-full hover:scale-105 active:scale-95 transition-all"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  </button>
                  <button
                    onClick={handleStepComplete}
                    className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 active:scale-95 transition-all text-white"
                    title="Skip Step"
                  >
                    <SkipForward size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('End this focus session?')) {
                        exitPlayer();
                        setIsIslandExpanded(false);
                      }
                    }}
                    className="p-2.5 bg-rose-500/20 text-rose-400 rounded-full hover:bg-rose-500/30 active:scale-95 transition-all"
                    title="End Session"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Collapse Toggle */}
                <button
                  onClick={() => setIsIslandExpanded(false)}
                  className="w-full text-center text-[10px] uppercase font-mono tracking-widest text-zinc-500 hover:text-zinc-300 pt-1"
                >
                  Collapse View
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pt-16">
        <div
          className={`flex-1 flex flex-col h-full ${
            isFullWidthView
              ? 'overflow-hidden p-0'
              : 'overflow-y-auto p-4 md:p-8 pb-32 md:pb-32'
          }`}
        >
          {children}
        </div>
      </main>

      {/* 🏝️ FLOATING BOTTOM NAVIGATION BAR */}
      {!isRoutinePlayer && !isQuillPage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-[640px] px-2">
          <nav className="bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-[28px] p-2 flex items-center gap-1 overflow-x-auto no-scrollbar justify-between">
            <div className="flex items-center gap-1 w-full justify-between">
              {navItems.map((item) => {
                const isActive = activeTabId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl transition-all duration-200 shrink-0 select-none
                      ${
                        isActive
                          ? 'bg-[#8979FF] text-white shadow-lg shadow-indigo-500/25 font-bold scale-[1.02]'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                      }`}
                  >
                    <item.icon
                      size={18}
                      className={isActive ? 'text-white' : 'text-slate-500'}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="text-xs font-extrabold hidden md:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Zoom Control Widget embedded in pill */}
            <div className="hidden lg:flex items-center border-l border-slate-200/80 ml-2 pl-2 gap-1 shrink-0">
              <button
                onClick={() => handleZoom('out')}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                title="Zoom Out"
              >
                <Minus size={12} />
              </button>
              <span
                className="text-[10px] font-black text-slate-500 tabular-nums cursor-pointer px-1 select-none"
                onDoubleClick={resetZoom}
                title="Double click to reset"
              >
                {Math.round(uiScale * 100)}%
              </span>
              <button
                onClick={() => handleZoom('in')}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                title="Zoom In"
              >
                <Plus size={12} />
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AppShell;
