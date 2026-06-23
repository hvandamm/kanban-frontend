import { useState, useEffect } from 'react';
import { getOpenAPIDefinition } from '../../../api/generated/kanban';
import type { Task } from '../../../api/generated/model';

interface UseKanbanBoardResult {
  tasks: Task[];
  boardName: string;
  loading: boolean;
  error: string | null;
}

export function useKanbanBoard(): UseKanbanBoardResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [boardName, setBoardName] = useState<string>('Loading...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const api = getOpenAPIDefinition();

    let cancelled = false;

    async function fetchData() {
      try {
        // 1. Fetch boards to find the default one
        const boardsRes = await api.getAllBoards();
        const boards = boardsRes.data;

        if (boards.length === 0) {
          if (!cancelled) {
            setBoardName('No boards available');
            setTasks([]);
            setLoading(false);
          }
          return;
        }

        // Use the first board (seeder creates it)
        const board = boards[0];
        if (!cancelled) {
          setBoardName(board.name ?? 'Kanban Board');
        }

        // 2. Fetch all tasks
        const tasksRes = await api.getAllTasks();
        console.log("Fetched Tasks:", tasksRes.data);
        if (!cancelled) {
          setTasks(tasksRes.data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to fetch board data';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { tasks, boardName, loading, error };
}