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
} from 'lucide-react';
import useTimerWorker from '../../hooks/useTimerWorker';
import useReminderSystem from '../../hooks/useReminderSystem';

// Icon Mapping
const VIEW_ICONS: Record<string, any> = {
  dashboard: LayoutDashboard,
  dump: Brain,
  trash: Trash2,
  calendar: CalendarIcon,
  tasks: ListTodo,
  projects: Briefcase,
  habits: CheckCircle,
  routines: PlayCircle,
  notes: StickyNote,
  journal: BookOpen,
};

const MOBILE_NAV_GROUPS = [
  { id: 'dash_group', views: ['dashboard'] },
  { id: 'capture_group', views: ['dump', 'trash'] },
  { id: 'plan_group', views: ['calendar', 'tasks', 'projects'] },
  { id: 'habit_group', views: ['habits', 'routines'] },
  { id: 'record_group', views: ['notes', 'journal'] },
];

interface AppShellProps {
  children: React.ReactNode;
  miniPlayer?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children, miniPlayer }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Run global background hooks
  useTimerWorker();
  useReminderSystem();

  const uiScale = useAppStore((state) => state.uiScale);
  const setUiScale = useAppStore((state) => state.setUiScale);
  const currentView = pathname.replace('/', '') || 'dashboard';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dump', label: 'Brain Dump', icon: Brain },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'habits', label: 'Habits', icon: CheckCircle },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'routines', label: 'Routines', icon: PlayCircle },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  // Modules that are full-width container views
  const isFullWidthView =
    currentView === 'calendar' ||
    currentView === 'notes' ||
    currentView === 'projects' ||
    currentView === 'habits' ||
    currentView === 'dump' ||
    currentView === 'tasks' ||
    currentView === 'routine-player';

  const handleZoom = (direction: 'in' | 'out') => {
    const step = 0.1;
    const newScale = direction === 'in' ? uiScale + step : uiScale - step;
    setUiScale(Math.max(0.5, Math.min(1.5, parseFloat(newScale.toFixed(1)))));
  };

  const resetZoom = () => setUiScale(1);

  // Cycle / router nav stack for mobile
  const handleMobileNavClick = (views: string[]) => {
    if (views.includes(currentView)) {
      const currentIndex = views.indexOf(currentView);
      const nextIndex = (currentIndex + 1) % views.length;
      router.push(`/${views[nextIndex]}` as any);
    } else {
      router.push(`/${views[0]}` as any);
    }
  };

  // Hide shells if in routine player
  const isRoutinePlayer = currentView === 'routine-player';

  return (
    <div
      className="fixed inset-0 bg-[#0a0a0f] text-[#f1f0ff] font-sans overflow-hidden flex transition-all duration-200 ease-out"
      style={{
        zoom: uiScale,
        height: `calc(100dvh / ${uiScale})`,
        width: `calc(100vw / ${uiScale})`,
      }}
    >
      {/* Desktop Sidebar */}
      {!isRoutinePlayer && (
        <aside className="hidden md:flex flex-col w-64 bg-[#12121a] border-r border-white/5 p-6 z-[70] relative shrink-0 h-full">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 mb-8 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-pink-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <span className="font-extrabold text-white text-sm">L</span>
            </div>
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              LOAH
            </h1>
          </div>

          {/* Mini Player */}
          {miniPlayer && (
            <div className="mb-6 animate-fade-in-down shrink-0">{miniPlayer}</div>
          )}

          {/* Nav Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar -mr-2 pr-2 min-h-0">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(`/${item.id}` as any)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 relative group
                    ${
                      isActive
                        ? 'bg-white/5 text-white font-bold border border-white/10 shadow-[var(--glow-purple)]'
                        : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white border border-transparent'
                    }
                  `}
                >
                  {/* Left Border Active Indicator Glow */}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-violet-500 to-pink-500 rounded-r" />
                  )}
                  <item.icon
                    size={20}
                    className={isActive ? 'text-violet-400' : 'text-[var(--text-secondary)] group-hover:text-white transition-colors'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Footer Zoom Control */}
          <div
            className="mt-auto pt-6 border-t border-white/5 shrink-0"
            style={{ zoom: 1 / uiScale }}
          >
            <div className="bg-[#1a1a26] rounded-xl p-1.5 flex items-center justify-between shadow-lg border border-white/5">
              <button
                onClick={() => handleZoom('out')}
                className="p-2 hover:bg-white/5 hover:text-white rounded-lg text-[var(--text-secondary)] transition-all"
                title="Zoom Out"
              >
                <Minus size={14} />
              </button>
              <span
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-white tabular-nums cursor-pointer select-none"
                onDoubleClick={resetZoom}
                title="Double click to reset"
              >
                {Math.round(uiScale * 100)}%
              </span>
              <button
                onClick={() => handleZoom('in')}
                className="p-2 hover:bg-white/5 hover:text-white rounded-lg text-[var(--text-secondary)] transition-all"
                title="Zoom In"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#0a0a0f]">
        <div
          className={`flex-1 flex flex-col h-full ${
            isFullWidthView
              ? 'overflow-hidden p-0'
              : 'overflow-y-auto p-4 md:p-6 pb-24 md:pb-12'
          }`}
        >
          {children}
        </div>
      </main>

      {/* Mobile Navigation bar */}
      {!isRoutinePlayer && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#12121a]/85 backdrop-blur-xl border-t border-white/5 pb-safe z-[70] h-16 shrink-0 shadow-lg">
          {miniPlayer && (
            <div className="absolute bottom-full left-0 right-0 p-2 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none">
              <div className="pointer-events-auto">{miniPlayer}</div>
            </div>
          )}
          <div className="flex justify-around items-center h-full px-2 relative">
            {MOBILE_NAV_GROUPS.map((group) => {
              const isActive = group.views.includes(currentView);
              const viewToRender = isActive ? currentView : group.views[0];
              const IconComponent = VIEW_ICONS[viewToRender] || LayoutDashboard;

              return (
                <button
                  key={group.id}
                  onClick={() => handleMobileNavClick(group.views)}
                  className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${
                    isActive ? 'text-violet-400' : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <IconComponent size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};
export default AppShell;
