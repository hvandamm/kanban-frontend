import type { Task } from '../../../api/generated/model';

interface TaskCardProps {
  task: Task;
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

export function TaskCard({ task }: TaskCardProps) {
  const statusStyle = STATUS_STYLES[task.status ?? 'TODO'] ?? STATUS_STYLES.TODO;

  return (
    <div className="group cursor-pointer rounded-lg border border-slate-700/50 bg-slate-800/40 p-4 transition-all duration-200 hover:translate-y-[-2px] hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5">
      {/* Status badge */}
      <div className="mb-3 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
          {statusStyle.label}
        </span>
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