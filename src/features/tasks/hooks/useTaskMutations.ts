import { useState, useCallback, useRef } from 'react';
import type { Task, TaskStatus } from '../../../api/generated/model';
import { TaskStatus as TaskStatusEnum } from '../../../api/generated/model';
import type { TaskRequest } from '../../../api/generated/model';
import { getOpenAPIDefinition } from '../../../api/generated/kanban';

export interface TransitionError {
  taskId?: number;
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
  /**
   * Create a new task.
   * Applies an optimistic update immediately, then rolls back on failure.
   * Uses the setTasks setter to manage state (add optimistic, replace/remove on result).
   * @returns true if creation was accepted, false otherwise
   */
  createTask: (
    boardId: number,
    title: string,
    description: string,
    status: TaskStatus,
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  ) => Promise<boolean>;
  /**
   * Delete a task.
   * Applies an optimistic removal immediately, then rolls back on failure.
   * Uses the setTasks setter to manage state.
   * @returns true if deletion was accepted, false otherwise
   */
  deleteTask: (
    taskId: number,
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  ) => Promise<boolean>;
  /** Whether a creation operation is in-flight */
  isCreating: boolean;
  /** Whether a deletion operation is in-flight */
  isDeleting: ReadonlySet<number>;
}

export function useTaskMutations(): UseTaskMutationsResult {
  const [mutatingIds, setMutatingIds] = useState<Set<number>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
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

  const createTask = useCallback(
    async (
      boardId: number,
      title: string,
      description: string,
      status: TaskStatus,
      setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
    ): Promise<boolean> => {
      if (!title.trim()) return false;
      if (isCreating) return false;

      setIsCreating(true);

      // Create a temporary optimistic task with a negative ID (will be replaced on success)
      const tempId = -Date.now();
      const optimisticTask: Task = {
        id: tempId,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        board: { id: boardId },
      };

      // 1. Optimistic add — prepend the temp task to the list
      setTasks((prev) => [optimisticTask, ...prev]);

      const api = getOpenAPIDefinition();
      const request: TaskRequest = {
        boardId,
        title: title.trim(),
        description: description.trim() || undefined,
        status: status ?? TaskStatusEnum.TODO,
      };

      try {
        const res = await api.createTask(request);
        const createdTask = res.data;

        // 2. On success: replace the optimistic temp task with the real server-returned task
        if (createdTask.id != null) {
          setTasks((prev) =>
            prev.map((t) => (t.id === tempId ? createdTask : t)),
          );
        }
      } catch (err: unknown) {
        // 3. On failure: remove the optimistic task (rollback)
        setTasks((prev) => prev.filter((t) => t.id !== tempId));

        const message =
          err instanceof Error ? err.message : 'Failed to create task';

        setTransitionError({ taskId: tempId, message });
        setIsCreating(false);
        return false;
      }

      setIsCreating(false);
      return true;
    },
    [isCreating],
  );

  const deleteTask = useCallback(
    async (
      taskId: number,
      setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
    ): Promise<boolean> => {
      if (deletingIds.has(taskId)) return false;

      // 1. Snapshot the task being removed for potential rollback
      let removedTask: Task | undefined;
      setTasks((prev) => {
        removedTask = prev.find((t) => t.id === taskId);
        return prev.filter((t) => t.id !== taskId);
      });

      // 2. Mark as deleting
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.add(taskId);
        return next;
      });

      const api = getOpenAPIDefinition();

      try {
        await api.deleteTask(taskId);
      } catch (err: unknown) {
        // 3. On failure: restore the removed task (rollback)
        if (removedTask) {
          setTasks((prev) => {
            // Only restore if it hasn't been re-added by another operation
            if (prev.some((t) => t.id === taskId)) return prev;
            return [...prev, removedTask!];
          });
        }

        const message =
          err instanceof Error ? err.message : 'Failed to delete task';

        setTransitionError({ taskId, message });
      } finally {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }

      return true;
    },
    [deletingIds],
  );

  return {
    mutatingIds,
    transitionError,
    dismissError,
    transitionTask,
    createTask,
    deleteTask,
    isCreating,
    isDeleting: deletingIds as ReadonlySet<number>,
  };
}
