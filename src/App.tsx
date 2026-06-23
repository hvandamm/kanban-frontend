import { MainLayout } from './layouts/MainLayout';
import { KanbanBoard } from './features/tasks/components/KanbanBoard';
import { TaskStatus } from './api/generated/model';
import type { Task } from './api/generated/model';

const MOCK_TASKS: Task[] = [
  { id: 1, title: 'Design system architecture', description: 'Create the high-level architecture document for the new platform.', status: TaskStatus.TODO },
  { id: 2, title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated builds and deployments.', status: TaskStatus.TODO },
  { id: 3, title: 'Implement user authentication', description: 'Add OAuth2 login flow with JWT token management.', status: TaskStatus.IN_PROGRESS },
  { id: 4, title: 'Build task API endpoints', description: 'Create CRUD endpoints for task management.', status: TaskStatus.IN_PROGRESS },
  { id: 5, title: 'Database schema design', description: 'Design the PostgreSQL schema for boards and tasks.', status: TaskStatus.DONE },
  { id: 6, title: 'Project scaffolding', description: 'Initialize the monorepo with Vite, TypeScript, and ESLint.', status: TaskStatus.DONE },
  { id: 7, title: 'API contract definition', description: 'Define OpenAPI spec for the backend API.', status: TaskStatus.DONE },
];

function App() {
  return (
    <MainLayout>
      <KanbanBoard tasks={MOCK_TASKS} />
    </MainLayout>
  );
}

export default App;