import { useState, useCallback, useRef } from 'react';
import type { Task, TaskStatus } from '../../../api/generated/model';
import { getOpenAPIDefinition } from '../../../api/generated/kanban';

export interface TransitionError {
  taskId: number;
  message: string;
}

interface UseTaskMutationsResult {
  /** Set of task IDs currently being updated (in-flight) */
  mutatingIds: ReadonlySet<number>;
  /** Latest transition error, if any */
  transitionError: TransitionError | null;
  /** Dismiss the current error */
  dismissError: () => void;
  /**
   * Transition a task to a new status.
   * Applies an optimistic update immediately, then rolls back on failure.
   * @returns true if the transition was accepted, false otherwise
   */
  transitionTask: (
    task: Task,
    newStatus: TaskStatus,
    optimisticUpdater: (taskId: number, newStatus: TaskStatus) => void,
  ) => Promise<boolean>;
}

export function useTaskMutations(): UseTaskMutationsResult {
  const [mutatingIds, setMutatingIds] = useState<Set<number>>(new Set());
  const [transitionError, setTransitionError] = useState<TransitionError | null>(null);
  const inFlight = useRef<Map<number, Promise<unknown>>>(new Map());

  const dismissError = useCallback(() => setTransitionError(null), []);

  const transitionTask = useCallback(
    async (
      task: Task,
      newStatus: TaskStatus,
      optimisticUpdater: (taskId: number, newStatus: TaskStatus) => void,
    ): Promise<boolean> => {
      const taskId = task.id;
      if (taskId == null) return false;

      // Prevent duplicate in-flight transitions for the same task
      if (inFlight.current.has(taskId)) return false;

      // Save current status for rollback
      const previousStatus = task.status;

      // 1. Optimistic update
      optimisticUpdater(taskId, newStatus);

      // 2. Mark as mutating
      setMutatingIds((prev) => {
        const next = new Set(prev);
        next.add(taskId);
        return next;
      });

      const api = getOpenAPIDefinition();
      const updatedTask: Task = { ...task, status: newStatus };

      const promise = (async () => {
        try {
          await api.updateTask(taskId, updatedTask);
        } catch (err: unknown) {
          // Rollback optimistic state
          if (previousStatus != null) {
            optimisticUpdater(taskId, previousStatus);
          }

          const message =
            err instanceof Error ? err.message : 'Failed to update task';

          setTransitionError({ taskId, message });
        } finally {
          inFlight.current.delete(taskId);
          setMutatingIds((prev) => {
            const next = new Set(prev);
            next.delete(taskId);
            return next;
          });
        }
      })();

      inFlight.current.set(taskId, promise);
      await promise;

      return true;
    },
    [],
  );

  return { mutatingIds, transitionError, dismissError, transitionTask };
}