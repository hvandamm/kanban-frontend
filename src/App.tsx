import { MainLayout } from './layouts/MainLayout';
import { KanbanBoard } from './features/tasks/components/KanbanBoard';
import { useKanbanBoard } from './features/tasks/hooks/useKanbanBoard';

function App() {
  const { tasks, boardName, loading, error, setTasks } = useKanbanBoard();

  return (
    <MainLayout boardName={boardName}>
      <KanbanBoard tasks={tasks} loading={loading} error={error} onSetTasks={setTasks} />
    </MainLayout>
  );
}

export default App;