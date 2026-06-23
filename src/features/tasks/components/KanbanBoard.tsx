import { useMemo, useCallback } from 'react';
import { TaskStatus } from '../../../api/generated/model';
import type { Task } from '../../../api/generated/model';
import { TaskColumn } from './TaskColumn';
import { useTaskMutations } from '../hooks/useTaskMutations';

interface KanbanBoardProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onSetTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

// Status pipeline order (TODO → IN_PROGRESS → DONE)
const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {[1, 2, 3].map((col) => (
        <div key={col} className="animate-pulse rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
          <div className="mb-3 h-10 rounded-lg bg-slate-800/60" />
          <div className="flex flex-col gap-3">
            {[1, 2].map((card) => (
              <div key={card} className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                <div className="mb-3 h-4 w-16 rounded bg-slate-700/50" />
                <div className="mb-2 h-5 w-3/4 rounded bg-slate-700/40" />
                <div className="h-4 w-full rounded bg-slate-700/30" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-800/40 bg-red-900/10 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-red-300">Failed to load board</h3>
      <p className="max-w-md text-sm text-slate-400">{message}</p>
    </div>
  );
}

function TransitionErrorBanner({
  error,
  onDismiss,
}: {
  error: { taskId: number; message: string };
  onDismiss: () => void;
}) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 backdrop-blur-sm">
      <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-medium text-red-300">Task update failed</p>
        <p className="mt-0.5 text-xs text-red-400/80">{error.message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="flex h-6 w-6 items-center justify-center rounded text-red-400/60 transition-colors hover:bg-red-800/40 hover:text-red-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function KanbanBoard({ tasks, loading, error, onSetTasks }: KanbanBoardProps) {
  const { mutatingIds, transitionError, dismissError, transitionTask } = useTaskMutations();

  const columns = useMemo(() => {
    const grouped: Record<string, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.DONE]: [],
    };

    for (const task of tasks) {
      const status = task.status ?? TaskStatus.TODO;
      if (grouped[status]) {
        grouped[status].push(task);
      } else {
        grouped[TaskStatus.TODO].push(task);
      }
    }

    return grouped;
  }, [tasks]);

  const optimisticUpdater = useCallback(
    (taskId: number, newStatus: TaskStatus) => {
      onSetTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      );
    },
    [onSetTasks],
  );

  const handlePromote = useCallback(
    (task: Task) => {
      const idx = STATUS_ORDER.indexOf(task.status as TaskStatus);
      if (idx < STATUS_ORDER.length - 1) {
        transitionTask(task, STATUS_ORDER[idx + 1], optimisticUpdater);
      }
    },
    [transitionTask, optimisticUpdater],
  );

  const handleDemote = useCallback(
    (task: Task) => {
      const idx = STATUS_ORDER.indexOf(task.status as TaskStatus);
      if (idx > 0) {
        transitionTask(task, STATUS_ORDER[idx - 1], optimisticUpdater);
      }
    },
    [transitionTask, optimisticUpdater],
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div>
      {/* Dismissible transition error banner */}
      {transitionError && (
        <TransitionErrorBanner error={transitionError} onDismiss={dismissError} />
      )}

      {/* Kanban columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <TaskColumn
          status={TaskStatus.TODO}
          tasks={columns[TaskStatus.TODO]}
          mutatingIds={mutatingIds}
          onPromote={handlePromote}
          onDemote={handleDemote}
        />
        <TaskColumn
          status={TaskStatus.IN_PROGRESS}
          tasks={columns[TaskStatus.IN_PROGRESS]}
          mutatingIds={mutatingIds}
          onPromote={handlePromote}
          onDemote={handleDemote}
        />
        <TaskColumn
          status={TaskStatus.DONE}
          tasks={columns[TaskStatus.DONE]}
          mutatingIds={mutatingIds}
          onPromote={handlePromote}
          onDemote={handleDemote}
        />
      </div>
    </div>
  );
}