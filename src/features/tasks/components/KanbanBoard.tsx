import { useMemo } from 'react';
import type { Task } from '../../../api/generated/model';
import { TaskStatus } from '../../../api/generated/model';
import { TaskColumn } from './TaskColumn';

interface KanbanBoardProps {
  tasks: Task[];
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
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

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <TaskColumn status={TaskStatus.TODO} tasks={columns[TaskStatus.TODO]} />
      <TaskColumn status={TaskStatus.IN_PROGRESS} tasks={columns[TaskStatus.IN_PROGRESS]} />
      <TaskColumn status={TaskStatus.DONE} tasks={columns[TaskStatus.DONE]} />
    </div>
  );
}