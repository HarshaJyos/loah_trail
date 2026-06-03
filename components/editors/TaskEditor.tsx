'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Task, Priority, Subtask } from '../../types';
import { ArrowLeft, ListTodo, CalendarClock, Trash2, X, Plus, CheckSquare } from 'lucide-react';

export const TaskEditor: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onAddTask = useAppStore((s) => s.handleAddTask);
  const onUpdateTask = useAppStore((s) => s.handleUpdateTask);
  const tasks = useAppStore((s) => s.tasks);
  const onDeleteDump = useAppStore((s) => s.handleDeleteDump);

  const taskId = searchParams?.get('id');
  const existingTask = React.useMemo(() => tasks.find(t => t.id === taskId), [tasks, taskId]);

  const [title, setTitle] = React.useState(searchParams?.get('title') || '');
  const [description, setDescription] = React.useState(searchParams?.get('desc') || '');
  const [priority, setPriority] = React.useState<Priority>('Medium');
  const [projectId, setProjectId] = React.useState<string | undefined>();
  const [category, setCategory] = React.useState('Personal');
  const [duration, setDuration] = React.useState('30');
  const [scheduledDate, setScheduledDate] = React.useState(searchParams?.get('date') || '');
  const [scheduledTime, setScheduledTime] = React.useState('');
  const [subtasks, setSubtasks] = React.useState<Subtask[]>([]);

  React.useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || '');
      setPriority(existingTask.priority);
      setProjectId(existingTask.projectId);
      setCategory(existingTask.category || 'Personal');
      setDuration((existingTask.duration || 30).toString());
      setSubtasks(existingTask.subtasks || []);
      if (existingTask.startTime) {
        const d = new Date(existingTask.startTime);
        setScheduledDate(d.toISOString().split('T')[0]);
        setScheduledTime(d.toTimeString().substring(0, 5));
      }
    }
  }, [existingTask]);

  const deleteDumpId = searchParams?.get('deleteDumpId');

  const projects = useAppStore((s) => s.projects);
  const activeProjects = React.useMemo(() => projects.filter((p) => !p.deletedAt && !p.archivedAt), [projects]);

  const handleSave = () => {
    if (!title.trim()) {
      router.push('/tasks' as any);
      return;
    }

    let startTime: number | undefined;
    if (scheduledDate && scheduledTime) {
      startTime = new Date(`${scheduledDate}T${scheduledTime}`).getTime();
    } else if (scheduledDate) {
      startTime = new Date(`${scheduledDate}T00:00:00`).getTime();
    }

    const newTask: Task = {
      id: existingTask ? existingTask.id : Date.now().toString(),
      title: title.trim(),
      description,
      priority,
      projectId,
      category,
      duration: parseInt(duration) || 30,
      startTime,
      subtasks,
      isCompleted: existingTask ? existingTask.isCompleted : false,
      createdAt: existingTask ? existingTask.createdAt : Date.now(),
    };
    if (existingTask) {
      onUpdateTask(newTask);
    } else {
      onAddTask(newTask);
    }
    if (deleteDumpId) {
      onDeleteDump(deleteDumpId);
    }
    router.push('/tasks' as any);
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { id: Date.now().toString(), title: `Subtask ${subtasks.length + 1}`, isCompleted: false }]);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-fade-in" style={{ background: 'var(--bg-app)' }}>
      {/* ── Header ───────────────────────────────────────────── */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, background: 'var(--bg-canvas)',
          position: 'sticky', top: 0, zIndex: 50,
        }}
      >
        <button onClick={() => router.back()} className="loah-icon-btn">
          <ArrowLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ListTodo size={18} color="var(--brand-primary)" />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {existingTask ? 'Edit Task' : 'New Task'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.back()} className="loah-btn-ghost">
            Discard
          </button>
          <button onClick={handleSave} className="loah-btn-primary">
            Save
          </button>
        </div>
      </div>

      {/* ── Form content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '32px 24px 100px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="loah-title-input"
          style={{ marginBottom: 32, fontSize: '40px' }}
          autoFocus
        />

        <div className="loah-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            Details
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes or context..."
            className="loah-input"
            style={{ minHeight: 80, marginBottom: 16 }}
          />

          {/* Subtasks */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Subtasks
            </span>
            <button onClick={addSubtask} className="loah-btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }}>
              <Plus size={12} style={{ marginRight: 4 }} /> Add
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {subtasks.map((sub, idx) => (
              <div key={sub.id} className="flex gap-2 items-center">
                <button
                  onClick={() => {
                    const newSubs = [...subtasks];
                    newSubs[idx].isCompleted = !newSubs[idx].isCompleted;
                    setSubtasks(newSubs);
                  }}
                  style={{ color: sub.isCompleted ? 'var(--brand-primary)' : 'var(--text-tertiary)' }}
                >
                  {sub.isCompleted ? <CheckSquare size={16} /> : <div style={{ width: 16, height: 16, border: '1px solid currentColor', borderRadius: 2 }} />}
                </button>
                <input
                  value={sub.title}
                  onChange={(e) => {
                    const newSubs = [...subtasks];
                    newSubs[idx].title = e.target.value;
                    setSubtasks(newSubs);
                  }}
                  className="loah-input flex-1"
                  style={{ padding: '8px 12px', fontSize: 13, textDecoration: sub.isCompleted ? 'line-through' : 'none', opacity: sub.isCompleted ? 0.6 : 1 }}
                />
                <button onClick={() => setSubtasks(subtasks.filter((s) => s.id !== sub.id))} style={{ padding: '4px', color: 'var(--danger-default)' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="loah-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Priority Level
              </div>
              <div className="flex flex-col gap-2">
                {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    style={{
                      padding: '10px', borderRadius: '12px',
                      border: `1px solid ${priority === p ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                      background: priority === p ? 'var(--brand-primary-muted)' : 'var(--bg-surface-elevated)',
                      color: priority === p ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontWeight: 600, fontSize: '13px',
                      transition: 'all 0.2s',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: 16 }}>
                  Category
                </div>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="loah-input"
                />
              </div>
              <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: 16 }}>
                  Duration (min)
                </div>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="loah-input"
                />
              </div>
            </div>
          </div>

          <div className="loah-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeProjects.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Assign to Project
                </div>
                <select
                  value={projectId || ''}
                  onChange={(e) => setProjectId(e.target.value || undefined)}
                  className="loah-input"
                >
                  <option value="">No Project</option>
                  {activeProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: activeProjects.length > 0 ? 16 : 0 }}>
                Schedule
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="loah-input flex-1"
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="loah-input flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskEditor;
