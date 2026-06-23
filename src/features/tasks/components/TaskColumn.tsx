import { useState, useCallback, useRef } from 'react';
import type { Task, TaskStatus } from '../../../api/generated/model';
import { TaskStatus as TaskStatusEnum } from '../../../api/generated/model';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  boardId: number | null;
  isCreating?: boolean;
  mutatingIds?: ReadonlySet<number>;
  isDeleting?: ReadonlySet<number>;
  onPromote?: (task: Task) => void;
  onDemote?: (task: Task) => void;
  onCreateTask?: (title: string, description: string, status: TaskStatus) => void;
  onDeleteTask?: (taskId: number) => void;
}

const COLUMN_CONFIG: Record<string, { label: string; headerBg: string; accent: string; border: string }> = {
  TODO: {
    label: 'To Do',
    headerBg: 'bg-kanban-todo-bg',
    accent: 'text-kanban-todo',
    border: 'border-kanban-todo/20',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    headerBg: 'bg-kanban-progress-bg',
    accent: 'text-kanban-progress',
    border: 'border-kanban-progress/20',
  },
  DONE: {
    label: 'Done',
    headerBg: 'bg-kanban-done-bg',
    accent: 'text-kanban-done',
    border: 'border-kanban-done/20',
  },
};

export function TaskColumn({
  status,
  tasks,
  boardId,
  isCreating = false,
  mutatingIds,
  isDeleting,
  onPromote,
  onDemote,
  onCreateTask,
  onDeleteTask,
}: TaskColumnProps) {
  const config = COLUMN_CONFIG[status] ?? COLUMN_CONFIG.TODO;
  const isTodoColumn = status === TaskStatusEnum.TODO;

  // Quick-add form state
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      onCreateTask?.(title.trim(), description.trim(), TaskStatusEnum.TODO);
      setTitle('');
      setDescription('');
      setExpanded(false);
    },
    [title, description, onCreateTask],
  );

  const handleCancel = useCallback(() => {
    setTitle('');
    setDescription('');
    setExpanded(false);
  }, []);

  const handleOpen = useCallback(() => {
    setExpanded(true);
    // Focus title input after render
    requestAnimationFrame(() => titleRef.current?.focus());
  }, []);

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border ${config.border} bg-slate-900/60 p-4`}>
      {/* Column header */}
      <div className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2.5 ${config.headerBg}`}>
        <h2 className={`text-xs font-bold uppercase tracking-[0.08em] ${config.accent}`}>
          {config.label}
        </h2>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-slate-700/60 bg-slate-800/80 px-2 text-[11px] font-semibold text-slate-300">
          {tasks.length}
        </span>
      </div>

      {/* Inline expandable form — only on TODO column when board exists */}
      {isTodoColumn && onCreateTask && boardId != null && (
        <div ref={formRef} className="mb-3">
          {!expanded ? (
            /* Collapsed: clickable "Add card..." button */
            <button
              type="button"
              onClick={handleOpen}
              disabled={isCreating}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-700/50 px-3 py-2.5 text-sm text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-400 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add a card...
            </button>
          ) : (
            /* Expanded: inline form with title, description, and actions */
            <form onSubmit={handleSubmit} className="rounded-lg border border-slate-700/50 bg-slate-800/60 p-3">
              {/* Title input */}
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title *"
                disabled={isCreating}
                className="mb-2 w-full rounded-md border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
              />

              {/* Description textarea */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                disabled={isCreating}
                className="mb-3 w-full resize-none rounded-md border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
              />

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCreating}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !title.trim()}
                  className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Add task
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Card list */}
      <div className="flex flex-col gap-3">
        {tasks.length === 0 && !isTodoColumn ? (
          <p className="py-10 text-center text-sm italic text-slate-500">
            No tasks
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isMutating={mutatingIds?.has(task.id ?? -1) ?? false}
              isDeleting={isDeleting?.has(task.id ?? -1) ?? false}
              onPromote={onPromote}
              onDemote={onDemote}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>

      {/* Bottom helper text for empty TODO when form is collapsed or creating */}
      {isTodoColumn && tasks.length === 0 && onCreateTask && boardId != null && !expanded && (
        <p className="py-6 text-center text-sm italic text-slate-500">
          {isCreating ? 'Adding...' : 'Click "Add a card" above'}
        </p>
      )}
    </div>
  );
}