import { type ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  boardName: string;
}

export function MainLayout({ children, boardName }: MainLayoutProps) {
  return (
    <div className="min-h-svh flex flex-col bg-slate-950 text-slate-100">
      {/* Sticky glassmorphism header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <h1 className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              Enterprise Kanban Workspace
            </h1>
            {boardName && (
              <>
                <span className="text-slate-700">/</span>
                <span className="text-sm font-medium text-slate-300">{boardName}</span>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex gap-1">
            <button
              type="button"
              className="rounded-md px-4 py-2 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-500/10"
            >
              Boards
            </button>
            <button
              type="button"
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/50"
            >
              Tasks
            </button>
          </nav>
        </div>
      </header>

      {/* Main content area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}