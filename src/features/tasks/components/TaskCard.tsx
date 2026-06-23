import type { Task, TaskStatus } from '../../../api/generated/model';

interface TaskCardProps {
  task: Task;
  isMutating?: boolean;
  onPromote?: (task: Task) => void;
  onDemote?: (task: Task) => void;
}

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  TODO: {
    label: 'TODO',
    bg: 'bg-kanban-todo-bg',
    text: 'text-kanban-todo',
    dot: 'bg-kanban-todo',
  },
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    bg: 'bg-kanban-progress-bg',
    text: 'text-kanban-progress',
    dot: 'bg-kanban-progress',
  },
  DONE: {
    label: 'DONE',
    bg: 'bg-kanban-done-bg',
    text: 'text-kanban-done',
    dot: 'bg-kanban-done',
  },
};

// Status pipeline order
const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export function TaskCard({ task, isMutating = false, onPromote, onDemote }: TaskCardProps) {
  const statusStyle = STATUS_STYLES[task.status ?? 'TODO'] ?? STATUS_STYLES.TODO;
  const currentIndex = STATUS_ORDER.indexOf(task.status as TaskStatus);
  const canDemote = currentIndex > 0;
  const canPromote = currentIndex < STATUS_ORDER.length - 1;
  const handleClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className={`group rounded-lg border border-slate-700/50 bg-slate-800/40 p-4 transition-all duration-200 ${
        isMutating ? 'pointer-events-none opacity-60' : 'hover:translate-y-[-2px] hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5'
      }`}
    >
      {/* Top row: status badge + transition buttons */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
          {statusStyle.label}
        </span>

        {/* Transition controls */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          {onDemote && canDemote && (
            <button
              type="button"
              onClick={handleClick}
              onMouseDown={() => onDemote(task)}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-600/50 bg-slate-800 text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-700 hover:text-white"
              title={`Move to ${STATUS_STYLES[STATUS_ORDER[currentIndex - 1]].label.toLowerCase()}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {onPromote && canPromote && (
            <button
              type="button"
              onClick={handleClick}
              onMouseDown={() => onPromote(task)}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-600/50 bg-slate-800 text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-700 hover:text-white"
              title={`Move to ${STATUS_STYLES[STATUS_ORDER[currentIndex + 1]].label.toLowerCase()}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}

          {/* Spinner when mutating */}
          {isMutating && (
            <svg className="h-4 w-4 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-1 text-[15px] font-semibold leading-snug text-slate-100">
        {task.title ?? 'Untitled Task'}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
          {task.description}
        </p>
      )}
    </div>
  );
}