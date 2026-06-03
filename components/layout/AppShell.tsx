'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Brain,
  Calendar as CalendarIcon,
  CircleCheckBig,
  StickyNote,
  Minus,
  Plus,
  Play,
  Pause,
  SkipForward,
  X,
  ChevronDown,
} from 'lucide-react';
import useTimerWorker from '../../hooks/useTimerWorker';
import useReminderSystem from '../../hooks/useReminderSystem';

interface AppShellProps {
  children: React.ReactNode;
}

// Exactly 5 nav items matching Frame132 nav-bar icons:
// lucide-layout-dashboard, lucide-brain, lucide-calendar, lucide-circle-check-big, lucide-sticky-note
const NAV_ITEMS = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    paths: ['/dashboard', '/activity'],
  },
  {
    id: 'dump',
    icon: Brain,
    paths: ['/dump', '/trash'],
  },
  {
    id: 'calendar',
    icon: CalendarIcon,
    paths: ['/calendar', '/tasks', '/projects'],
  },
  {
    id: 'routines',
    icon: CircleCheckBig,
    paths: ['/routines', '/habits'],
  },
  {
    id: 'notes',
    icon: StickyNote,
    paths: ['/notes', '/journal'],
  },
] as const;

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Background hooks
  useTimerWorker();
  useReminderSystem();

  const uiScale = useAppStore((s) => s.uiScale);
  const setUiScale = useAppStore((s) => s.setUiScale);

  // Routine player state
  const activeRoutine = useAppStore((s) => s.activeRoutine);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);
  const timeElapsedInStep = useAppStore((s) => s.timeElapsedInStep);
  const playerSteps = useAppStore((s) => s.playerSteps);
  const setPlayerState = useAppStore((s) => s.setPlayerState);
  const exitPlayer = useAppStore((s) => s.exitPlayer);
  const handleStepComplete = useAppStore((s) => s.handleStepComplete);

  const [isIslandExpanded, setIsIslandExpanded] = React.useState(false);

  // ── Active tab detection ──────────────────────────────────
  const activeTabId = React.useMemo(() => {
    if (pathname.includes('/dashboard') || pathname.includes('/activity')) return 'dashboard';
    if (pathname.includes('/dump') || pathname.includes('/trash')) return 'dump';
    if (pathname.includes('/calendar') || pathname.includes('/tasks') || pathname.includes('/projects')) return 'calendar';
    if (pathname.includes('/routines') || pathname.includes('/habits') || pathname.includes('/routine-player')) return 'routines';
    if (pathname.includes('/notes') || pathname.includes('/journal')) return 'notes';
    return 'dashboard';
  }, [pathname]);

  // ── Nav click: cycle through paths on repeated tap ───────
  const handleNavClick = (item: (typeof NAV_ITEMS)[number]) => {
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

  // ── Timer display ─────────────────────────────────────────
  const currentStep = playerSteps[currentStepIndex];
  const duration = currentStep?.durationSeconds ?? 0;
  const remaining = Math.max(0, duration - timeElapsedInStep);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;
  const progressPercent = duration > 0 ? (timeElapsedInStep / duration) * 100 : 0;

  const handleZoom = (dir: 'in' | 'out') => {
    const next = dir === 'in' ? uiScale + 0.1 : uiScale - 0.1;
    setUiScale(Math.max(0.5, Math.min(1.5, parseFloat(next.toFixed(1)))));
  };

  // ── Page type helpers ─────────────────────────────────────
  const isRoutinePlayer = pathname.startsWith('/routine-player');

  // Quill editor pages — replace nav with quill toolbar area (toolbar is rendered by Quill itself)
  const isEditorPage =
    pathname.includes('/notes/new') ||
    pathname.includes('/notes/edit') ||
    pathname.includes('/journal/new') ||
    pathname.includes('/journal/edit') ||
    pathname.includes('/dump/new') ||
    pathname.includes('/dump/edit') ||
    pathname.includes('/tasks/new') ||
    pathname.includes('/tasks/edit') ||
    pathname.includes('/projects/new') ||
    pathname.includes('/projects/edit') ||
    pathname.includes('/habits/new') ||
    pathname.includes('/habits/edit') ||
    pathname.includes('/routines/new') ||
    pathname.includes('/routines/edit');

  const isFullWidthView =
    pathname.startsWith('/calendar') ||
    pathname.startsWith('/notes') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/habits') ||
    pathname.startsWith('/dump') ||
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/routine-player');

  return (
    <div
      className="fixed inset-0 text-[var(--text-primary)] font-sans overflow-hidden flex flex-col"
      style={{
        background: 'var(--bg-app)',
        zoom: uiScale,
        height: `calc(100dvh / ${uiScale})`,
        width: `calc(100vw / ${uiScale})`,
        colorScheme: 'dark',
      }}
    >
      {/* ── Routine Player Dynamic Island (top center) ──────── */}
      {!isRoutinePlayer && activeRoutine && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] transition-all duration-500">
          <div
            className={`bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] rounded-[28px] border border-[var(--border-subtle)] transition-all duration-500 overflow-hidden flex flex-col justify-center
              ${isIslandExpanded ? 'w-[300px] p-5 shadow-2xl' : 'w-[220px] px-4 py-2.5 h-[44px] shadow-lg'}`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className="flex items-center gap-2 cursor-pointer min-w-0"
                onClick={() => setIsIslandExpanded(!isIslandExpanded)}
              >
                <span className="w-2 h-2 rounded-full bg-[#01F7AB] animate-pulse shrink-0" />
                <span className="text-xs font-bold truncate max-w-[110px]">
                  {currentStep ? currentStep.title : activeRoutine.title}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-[#ABA2FD] tabular-nums">
                  {timeString}
                </span>
                <button
                  onClick={() => router.push('/routine-player' as any)}
                  className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronDown size={12} className="rotate-180" />
                </button>
              </div>
            </div>

            {isIslandExpanded && (
              <div className="mt-4 space-y-3 animate-fade-in">
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8979FF] rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPlayerState({ isPlaying: !isPlaying })}
                    className="p-2 bg-white text-[#1E1E1E] rounded-full hover:scale-105 active:scale-95 transition-all"
                  >
                    {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                  </button>
                  <button
                    onClick={handleStepComplete}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 active:scale-95 transition-all"
                  >
                    <SkipForward size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('End this focus session?')) {
                        exitPlayer();
                        setIsIslandExpanded(false);
                      }
                    }}
                    className="p-2 bg-rose-500/20 text-rose-400 rounded-full hover:bg-rose-500/30 active:scale-95 transition-all"
                  >
                    <X size={13} />
                  </button>
                </div>
                <button
                  onClick={() => setIsIslandExpanded(false)}
                  className="w-full text-center text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 font-mono"
                >
                  Collapse
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────────── */}
      <main
        className={`flex-1 flex flex-col h-full overflow-hidden relative ${activeRoutine ? 'pt-14' : 'pt-0'
          }`}
      >
        <div
          className={`flex-1 flex flex-col h-full ${isFullWidthView
            ? 'overflow-hidden p-0'
            : 'overflow-y-auto p-4 md:p-8 pb-32'
            }`}
        >
          {children}
        </div>
      </main>

      {/* ── Floating Bottom Navigation Bar ───────────────────── */}
      {!isRoutinePlayer && !isEditorPage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100]">
          <nav
            style={{
              borderRadius: '27.5px',
              border: '1px solid var(--border-subtle)',
              padding: '5px 10px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-nav)',
              width: '320px',
              maxWidth: '92vw',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(16, 21, 18, 0.88)', /* matches --bg-canvas */
            }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTabId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isActive ? 'var(--brand-primary)' : 'transparent',
                    boxShadow: isActive ? 'var(--shadow-primary)' : 'none',
                    flexShrink: 0,
                  }}
                >
                  <item.icon
                    size={19}
                    color={isActive ? 'var(--bg-app)' : 'var(--text-tertiary)'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </button>
              );
            })}

            {/* Zoom control (hidden on mobile) */}
            <div
              className="hidden lg:flex items-center gap-1 border-l border-[rgba(31,31,31,0.10)] pl-2 ml-1"
              style={{ height: 28 }}
            >
              <button
                onClick={() => handleZoom('out')}
                style={{
                  width: 24, height: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 6, border: 'none', background: 'transparent',
                  color: '#808DA9', cursor: 'pointer',
                }}
                title="Zoom Out"
              >
                <Minus size={11} />
              </button>
              <span
                style={{
                  fontSize: 10, fontWeight: 700, color: '#808DA9',
                  fontFamily: 'monospace', cursor: 'pointer', minWidth: 28, textAlign: 'center',
                }}
                onDoubleClick={() => setUiScale(1)}
                title="Double-click to reset"
              >
                {Math.round(uiScale * 100)}%
              </span>
              <button
                onClick={() => handleZoom('in')}
                style={{
                  width: 24, height: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 6, border: 'none', background: 'transparent',
                  color: '#808DA9', cursor: 'pointer',
                }}
                title="Zoom In"
              >
                <Plus size={11} />
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AppShell;
