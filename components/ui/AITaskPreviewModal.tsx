'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Trash2, Plus } from 'lucide-react';

interface EditableTask {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface AITaskPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: EditableTask[];
  onConfirm: (editedTasks: EditableTask[]) => void;
  isLoading?: boolean;
}

export const AITaskPreviewModal: React.FC<AITaskPreviewModalProps> = ({
  isOpen,
  onClose,
  tasks: initialTasks,
  onConfirm,
  isLoading = false,
}) => {
  const [tasks, setTasks] = React.useState<EditableTask[]>([]);

  React.useEffect(() => {
    setTasks(
      (initialTasks || []).map((t: any, i: number) => ({
        id: t.id || `task-${i}`,
        title: t.title || '',
        description: t.description || '',
        priority: t.priority || 'Medium',
      }))
    );
  }, [initialTasks, isOpen]);

  const handleTaskChange = (id: string, field: string, value: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleRemoveTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTask = () => {
    const newTask: EditableTask = {
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      priority: 'Medium',
    };
    setTasks((prev) => [...prev, newTask]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review & Edit Generated Tasks"
      className="md:max-w-2xl"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tasks.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              background: 'var(--bg-surface)',
              borderRadius: 12,
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
              No tasks generated. Add one manually or close this modal.
            </p>
            <button
              onClick={handleAddTask}
              style={{
                padding: '8px 16px',
                background: 'var(--brand-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={14} />
              Add Task
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Title */}
                <div>
                  <label
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => handleTaskChange(task.id, 'title', e.target.value)}
                    placeholder="Task title"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      fontSize: 14,
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    value={task.description}
                    onChange={(e) => handleTaskChange(task.id, 'description', e.target.value)}
                    placeholder="Optional description"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      minHeight: 60,
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Priority & Delete Row */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Priority
                    </label>
                    <select
                      value={task.priority}
                      onChange={(e) => handleTaskChange(task.id, 'priority', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 8,
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleRemoveTask(task.id)}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--danger-surface)',
                      color: 'var(--danger-default)',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    className="hover:bg-[var(--danger-default)] hover:text-white transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Task Button */}
        <button
          onClick={handleAddTask}
          style={{
            padding: '10px 16px',
            background: 'var(--bg-surface)',
            border: '2px dashed var(--border-default)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Plus size={14} />
          Add Another Task
        </button>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
            className="hover:bg-[var(--bg-surface-elevated)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(tasks);
              onClose();
            }}
            disabled={isLoading || tasks.length === 0}
            style={{
              padding: '10px 20px',
              background: tasks.length === 0 ? 'var(--border-subtle)' : 'var(--brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: tasks.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              opacity: tasks.length === 0 ? 0.5 : 1,
            }}
          >
            {isLoading ? 'Creating...' : `Create ${tasks.length} Task${tasks.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AITaskPreviewModal;
