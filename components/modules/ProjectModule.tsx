'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Project, Task, FocusSession, Note, Priority } from '../../types';
import {
  Plus,
  Briefcase,
  Calendar,
  Clock,
  ArrowRight,
  Archive,
  RefreshCcw,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Play,
  CheckSquare,
  Pin,
  PauseCircle,
  PlayCircle,
  Filter,
} from 'lucide-react';
import { NoteCard } from './NotesModule';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { useRouter } from 'next/navigation';

const PROJECT_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#6366f1',
  '#14b8a6',
];

export const ProjectModule: React.FC = () => {
  const projects = useAppStore((state) => state.projects);
  const tasks = useAppStore((state) => state.tasks);
  const focusSessions = useAppStore((state) => state.focusSessions);

  const onAddProject = useAppStore((state) => state.handleAddProject);
  const onUpdateProject = useAppStore((state) => state.handleUpdateProject);
  const onDeleteProject = useAppStore((state) => state.handleDeleteProject);
  const onArchiveProject = (id: string) => useAppStore.getState().handleArchive(id, 'project');
  const onUnarchiveProject = (id: string) => useAppStore.getState().handleUnarchive(id, 'project');
  const onReorder = useAppStore((state) => state.handleReorderProjects);

  const convertingDump = useAppStore((state) => state.convertingDump);
  const onClearConvertingDump = () => useAppStore.getState().setConvertingDump(null);
  const onConvertComplete = useAppStore((state) => state.handleConvertComplete);

  const onAddTask = useAppStore((state) => state.handleAddTask);
  const onUpdateTask = useAppStore((state) => state.handleUpdateTask);
  const onDeleteTask = useAppStore((state) => state.handleDeleteTask);
  const onStartTask = useAppStore((state) => state.startTaskFocus);
  const onToggleTask = useAppStore((state) => state.toggleTask);

  const router = useRouter();
  const [viewingProjectId, setViewingProjectId] = React.useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(null);
  const [showArchived, setShowArchived] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'on-hold' | 'completed'>('active');
  const [draggedProjectId, setDraggedProjectId] = React.useState<string | null>(null);

  // Form State Removed

  const activeProjects = projects.filter((p) => !p.deletedAt && !p.archivedAt);
  const archivedProjects = projects.filter((p) => !p.deletedAt && p.archivedAt);

  const currentViewProjects = showArchived ? archivedProjects : activeProjects;

  const filteredProjects = React.useMemo(() => {
    let filtered = currentViewProjects;
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    return [...filtered].sort(
      (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
    );
  }, [currentViewProjects, statusFilter]);

  React.useEffect(() => {
    if (convertingDump) {
      router.push('/projects/new' as any);
    }
  }, [convertingDump, router]);

  // resetForm removed

  const openModal = (project?: Project) => {
    if (project) {
      router.push(`/projects/edit?id=${project.id}` as any);
    } else {
      router.push('/projects/new' as any);
    }
  };

  // handleSave removed

  const handleTogglePin = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    onUpdateProject({ ...project, isPinned: !project.isPinned });
  };

  const handleCycleStatus = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    let nextStatus: 'active' | 'completed' | 'on-hold' = 'active';
    if (project.status === 'active') nextStatus = 'completed';
    else if (project.status === 'completed') nextStatus = 'on-hold';
    else nextStatus = 'active';
    onUpdateProject({ ...project, status: nextStatus });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedProjectId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedProjectId || draggedProjectId === targetId || !onReorder)
      return;

    const allProjects = [...projects];
    const fromIndex = allProjects.findIndex((r) => r.id === draggedProjectId);
    const toIndex = allProjects.findIndex((r) => r.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [moved] = allProjects.splice(fromIndex, 1);
      allProjects.splice(toIndex, 0, moved);
      onReorder(allProjects);
    }
    setDraggedProjectId(null);
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(
      (t) => t.projectId === projectId && !t.deletedAt
    );
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.isCompleted).length;
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    let totalSeconds = 0;
    projectTasks.forEach((task) => {
      const taskSessions = focusSessions.filter(
        (s) => s.routineId === `task-${task.id}`
      );
      totalSeconds += taskSessions.reduce(
        (acc, s) => acc + s.durationSeconds,
        0
      );
    });
    return { totalTasks, completedTasks, progress, totalSeconds };
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const getPriorityColor = (p: Priority) => {
    if (p === 'High') return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
    if (p === 'Medium') return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
  };

  if (viewingProjectId) {
    const project = projects.find((p) => p.id === viewingProjectId);
    if (project) {
      return (
        <ProjectDetailView
          project={project}
          tasks={tasks.filter(
            (t) => t.projectId === project.id && !t.deletedAt
          )}
          onBack={() => setViewingProjectId(null)}
          onAddTask={onAddTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onStartTask={onStartTask}
          onToggleTask={onToggleTask}
          onUpdateProject={onUpdateProject}
          stats={getProjectStats(project.id)}
        />
      );
    }
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      {/* ── Header ──────── */}
      <div
        className="loah-module-header"
        style={{ paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <div className="loah-module-title">
              {showArchived ? 'Archive' : 'Projects'}
            </div>
            <div className="loah-module-date" style={{ marginTop: 4 }}>
              {showArchived
                ? 'Showing archived projects'
                : `${activeProjects.length} active`}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="loah-icon-btn"
              style={{
                background: showArchived ? 'var(--brand-primary-muted)' : 'var(--bg-surface-elevated)',
                color: showArchived ? 'var(--brand-primary)' : 'var(--text-secondary)',
              }}
              title={showArchived ? 'View Active' : 'View Archive'}
            >
              <Archive size={16} />
            </button>
            <button
              onClick={() => openModal()}
              className="loah-btn-primary"
              style={{ padding: '0 16px', borderRadius: '12px', height: '40px' }}
              title="New Project"
            >
              <Plus size={16} />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 16 }} className="no-scrollbar">
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 4, alignItems: 'center', gap: 4 }}>
            {['all', 'active', 'on-hold', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f as any)}
                style={{
                  padding: '6px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  background: statusFilter === f ? 'var(--brand-primary-muted)' : 'transparent',
                  color: statusFilter === f ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                }}
                className={statusFilter !== f ? 'hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]' : ''}
              >
                {f.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const { totalTasks, completedTasks, progress, totalSeconds } =
            getProjectStats(project.id);
          const isOverdue = Date.now() > project.dueDate && progress < 100;

          return (
              <div
                key={project.id}
                draggable={!showArchived}
                onDragStart={(e) => handleDragStart(e, project.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, project.id)}
                onClick={() => setViewingProjectId(project.id)}
                className="loah-card group cursor-pointer relative overflow-hidden flex flex-col justify-between h-[320px]"
                style={{
                  border: project.isPinned ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                  boxShadow: project.isPinned ? '0 8px 30px rgba(137,121,255,0.1)' : undefined,
                }}
              >
              <div
                className="absolute top-0 left-0 w-1.5 h-full"
                style={{ backgroundColor: project.color }}
              />
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight mb-2 flex items-center gap-2 group-hover:text-[#8979FF] transition-colors">
                        {project.title}
                        <div
                          className={`w-2 h-2 rounded-full ${getPriorityColor(
                            project.priority
                          )}`}
                          title={`Priority: ${project.priority}`}
                        />
                      </h3>
                      <button
                        onClick={(e) => handleCycleStatus(e, project)}
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 transition-all hover:opacity-80 active:scale-95 font-mono
                          ${
                            project.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                              : project.status === 'on-hold'
                              ? 'bg-amber-50 text-amber-850 text-amber-800 border-amber-200/60'
                              : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                          }
                        `}
                        title="Click to cycle status"
                      >
                        {project.status === 'completed' && <CheckCircle2 size={10} />}
                        {project.status === 'on-hold' && <PauseCircle size={10} />}
                        {project.status === 'active' && <PlayCircle size={10} />}
                        {project.status}
                      </button>
                    </div>

                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleTogglePin(e, project)}
                        style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        className={`transition-all ${
                          project.isPinned
                            ? 'text-[var(--brand-primary)] bg-[var(--brand-primary-muted)]'
                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
                        }`}
                      >
                        <Pin
                          size={14}
                          fill={project.isPinned ? 'currentColor' : 'none'}
                        />
                      </button>
                      {showArchived ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnarchiveProject(project.id);
                          }}
                          style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
                        >
                          <RefreshCcw size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchiveProject(project.id);
                          }}
                          style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
                        >
                          <Archive size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(project);
                        }}
                        style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project.id);
                        }}
                        style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        className="text-[var(--text-tertiary)] hover:text-[var(--danger-default)] hover:bg-[var(--danger-surface)] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[var(--text-tertiary)] text-xs line-clamp-2 leading-relaxed mb-6">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-4 mt-auto">
                  <div>
                    <div className="flex justify-between items-end mb-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                      <span>Progress</span>
                      <span>
                        {completedTasks}/{totalTasks} Tasks ({progress}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-surface-elevated)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--border-subtle)]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] text-[9px] font-bold font-mono uppercase tracking-wider">
                        <Calendar size={12} />
                        <span>Due Date</span>
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isOverdue ? 'text-rose-500 animate-pulse' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {new Date(project.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] text-[9px] font-bold font-mono uppercase tracking-wider">
                        <Clock size={12} />
                        <span>Time Spent</span>
                      </div>
                      <span className="text-xs font-bold text-[var(--text-secondary)]">
                        {formatDuration(totalSeconds)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-[var(--border-default)] rounded-3xl bg-[var(--bg-surface-elevated)] text-[var(--text-tertiary)] flex flex-col items-center justify-center">
            <Filter size={40} className="mb-4 opacity-20 text-[var(--text-secondary)]" />
            <p className="text-sm">No projects found in this view.</p>
          </div>
        )}
      </div>

      {/* Project Create / Edit Modal Removed */}
    </div>
  );
};

const ProjectDetailView: React.FC<{
  project: Project;
  tasks: Task[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    progress: number;
    totalSeconds: number;
  };
  onBack: () => void;
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStartTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onUpdateProject: (project: Project) => void;
}> = ({
  project,
  tasks,
  stats,
  onBack,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onStartTask,
  onToggleTask,
  onUpdateProject,
}) => {
  const [activeTab, setActiveTab] = React.useState<'tasks' | 'notes'>('tasks');
  const [newTaskTitle, setNewTaskTitle] = React.useState('');

  // Note State
  const [isNoteModalOpen, setIsNoteModalOpen] = React.useState(false);
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [initialNoteData, setInitialNoteData] = React.useState<
    Partial<Note> | undefined
  >(undefined);

  const projectNotes = React.useMemo(() => {
    return (project.notes || []).sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [project.notes]);

  const handleQuickAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      isCompleted: false,
      priority: 'Medium',
      category: 'Work',
      projectId: project.id,
      createdAt: Date.now(),
      duration: 30,
    };
    onAddTask(newTask);
    setNewTaskTitle('');
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    let updatedNotes = project.notes ? [...project.notes] : [];

    if (editingNoteId) {
      updatedNotes = updatedNotes.map((n) =>
        n.id === editingNoteId
          ? { ...n, ...noteData, updatedAt: Date.now() }
          : n
      );
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [],
        images: [],
        type: 'text',
        isPinned: false,
        color: 'transparent',
        title: '',
        content: '',
        ...noteData,
      };
      updatedNotes.push(newNote);
    }
    onUpdateProject({ ...project, notes: updatedNotes });
    closeNoteModal();
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = (project.notes || []).filter((n) => n.id !== noteId);
    onUpdateProject({ ...project, notes: updatedNotes });
  };

  const handleToggleNoteItem = (noteId: string, itemId: string) => {
    const note = project.notes?.find((n) => n.id === noteId);
    if (note && note.items) {
      const updatedItems = note.items.map((i) =>
        i.id === itemId ? { ...i, isDone: !i.isDone } : i
      );
      const updatedNote = { ...note, items: updatedItems };
      const updatedNotes = project.notes!.map((n) =>
        n.id === noteId ? updatedNote : n
      );
      onUpdateProject({ ...project, notes: updatedNotes });
    }
  };

  const handleToggleNotePin = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    const updatedNotes = (project.notes || []).map((n) =>
      n.id === note.id ? { ...n, isPinned: !n.isPinned } : n
    );
    onUpdateProject({ ...project, notes: updatedNotes });
  };

  const openNoteModal = (note?: Note) => {
    if (note) {
      setEditingNoteId(note.id);
      setInitialNoteData(note);
    } else {
      setEditingNoteId(null);
      setInitialNoteData(undefined);
    }
    setIsNoteModalOpen(true);
  };

  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setEditingNoteId(null);
    setInitialNoteData(undefined);
  };

  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-canvas)] animate-fade-in pb-32">
      {/* Detail Header */}
      <div className="px-6 py-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/30 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 font-bold uppercase tracking-wider text-xs transition-colors"
        >
          <ArrowRight size={16} className="rotate-180" /> Back to Projects
        </button>
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] leading-tight">
                {project.title}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--border-default)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] font-mono">
                {project.status}
              </span>
            </div>
            <p className="text-[var(--text-tertiary)] text-sm max-w-2xl">{project.description}</p>
            <div className="flex items-center gap-6 mt-6 text-xs font-bold text-[var(--text-secondary)] font-mono uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-violet-400" />
                <span>
                  {new Date(project.startDate).toLocaleDateString()} -{' '}
                  {new Date(project.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-violet-400" />
                <span>{(stats.totalSeconds / 3600).toFixed(1)}h Spent</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-64">
            <div className="flex justify-between text-[9px] font-bold text-[var(--text-tertiary)] uppercase mb-2 font-mono">
              <span>Progress</span>
              <span>{stats.progress}%</span>
            </div>
            <div className="h-2 bg-[var(--bg-surface-elevated)] rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${stats.progress}%`,
                  backgroundColor: project.color,
                }}
              />
            </div>
            <p className="text-right text-[10px] text-[var(--text-secondary)] mt-1 font-mono">
              {stats.completedTasks}/{stats.totalTasks} Tasks Completed
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-canvas)]">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors font-mono ${
            activeTab === 'tasks'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors font-mono ${
            activeTab === 'notes'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Project Notes
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-[var(--bg-canvas)]">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'tasks' && (
            <>
              {/* Task Quick Input */}
              <div className="flex gap-2 mb-8 bg-[var(--bg-surface)] p-2 pr-3 rounded-xl border border-[var(--border-subtle)] focus-within:border-violet-500/50 transition-all">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickAddTask()}
                  placeholder="Add a task to this project..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none placeholder-zinc-700 font-semibold"
                />
                <button
                  onClick={handleQuickAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="bg-violet-600 hover:bg-violet-500 disabled:bg-[var(--bg-surface-elevated)] disabled:text-[var(--text-secondary)] text-[var(--text-primary)] px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Active Tasks list */}
              <div className="space-y-3 mb-8">
                <h3 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-mono mb-4 pl-1">
                  Active Project Tasks
                </h3>
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 border border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-surface)] hover:border-violet-500/20 hover:shadow-lg transition-all group"
                  >
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="text-[var(--text-secondary)] hover:text-violet-400 transition-colors shrink-0"
                    >
                      <div className="w-5 h-5 border border-[var(--border-default)] rounded-md" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm text-[var(--text-primary)] block truncate">
                        {task.title}
                      </span>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--text-tertiary)] font-mono font-bold uppercase">
                        <span className="text-violet-400">{task.priority} Priority</span>
                        <span>•</span>
                        <span>{task.duration || 30}m estimate</span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1.5 transition-opacity shrink-0">
                      <button
                        onClick={() => onStartTask(task)}
                        className="p-2 hover:bg-[var(--bg-surface-elevated)] rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                        title="Start Timer Focus"
                      >
                        <Play size={16} fill="currentColor" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 hover:bg-rose-500/10 rounded-lg text-[var(--text-tertiary)] hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {pendingTasks.length === 0 && (
                  <p className="text-[var(--text-secondary)] italic text-xs pl-1">
                    No active tasks left in this project.
                  </p>
                )}
              </div>

              {/* Completed tasks list */}
              {completedTasks.length > 0 && (
                <div className="space-y-3 opacity-60 hover:opacity-100 transition-all border-t border-[var(--border-subtle)] pt-6">
                  <h3 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-mono mb-4 pl-1">
                    Completed Tasks
                  </h3>
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 p-3 border border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-surface-elevated)]0"
                    >
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="text-violet-400 shrink-0"
                      >
                        <CheckSquare size={18} />
                      </button>
                      <span className="font-medium text-xs text-[var(--text-tertiary)] line-through flex-1 truncate">
                        {task.title}
                      </span>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 hover:bg-rose-500/10 rounded-lg text-[var(--text-secondary)] hover:text-rose-400 transition-colors shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <button
                onClick={() => openNoteModal()}
                className="w-full border border-dashed border-[var(--border-default)] hover:border-violet-500/30 rounded-2xl p-5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/[0.02] transition-all flex items-center justify-center gap-2 active:scale-[0.98] font-bold uppercase tracking-wider text-xs font-mono"
              >
                <Plus size={16} /> Add Project Note
              </button>
              <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                {projectNotes.map((note) => (
                  <div key={note.id} className="break-inside-avoid">
                    <NoteCard
                      note={note}
                      onClick={() => openNoteModal(note)}
                      onPin={(e) => handleToggleNotePin(e, note)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      onToggleItem={handleToggleNoteItem}
                    />
                  </div>
                ))}
                {projectNotes.length === 0 && (
                  <p className="text-center col-span-full text-[var(--text-secondary)] py-10 italic text-xs">
                    No notes associated with this project.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline project note editor */}
      {isNoteModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
          onClick={closeNoteModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF', borderRadius: 20,
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              width: '100%', maxWidth: 480,
              padding: 24,
              display: 'flex', flexDirection: 'column', gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {editingNoteId ? 'Edit Note' : 'Add Project Note'}
              </span>
              <button onClick={closeNoteModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                ✕
              </button>
            </div>
            <input
              value={(initialNoteData?.title as string) || ''}
              onChange={(e) => setInitialNoteData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Note title..."
              style={{
                width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)',
                borderRadius: 10, padding: '10px 14px',
                fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', outline: 'none',
              }}
            />
            <textarea
              value={(initialNoteData?.content as string) || ''}
              onChange={(e) => setInitialNoteData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Note content..."
              style={{
                width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)',
                borderRadius: 10, padding: '10px 14px',
                fontSize: 13, color: 'var(--text-primary)', outline: 'none',
                minHeight: 120, resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={closeNoteModal}
                style={{
                  padding: '8px 16px', borderRadius: 200,
                  border: '1px solid var(--border-subtle)', background: 'transparent',
                  fontSize: 12, fontWeight: 700, color: '#64748B', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveNote(initialNoteData || {})}
                style={{
                  padding: '8px 16px', borderRadius: 200,
                  background: '#8979FF', border: 'none',
                  fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer',
                }}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectModule;
