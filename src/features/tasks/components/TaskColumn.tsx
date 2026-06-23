import type { Task, TaskStatus } from '../../../api/generated/model';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  mutatingIds?: ReadonlySet<number>;
  onPromote?: (task: Task) => void;
  onDemote?: (task: Task) => void;
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

export function TaskColumn({ status, tasks, mutatingIds, onPromote, onDemote }: TaskColumnProps) {
  const config = COLUMN_CONFIG[status] ?? COLUMN_CONFIG.TODO;

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

      {/* Card list */}
      <div className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <p className="py-10 text-center text-sm italic text-slate-500">
            No tasks
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isMutating={mutatingIds?.has(task.id ?? -1) ?? false}
              onPromote={onPromote}
              onDemote={onDemote}
            />
          ))
        )}
      </div>
    </div>
  );
}