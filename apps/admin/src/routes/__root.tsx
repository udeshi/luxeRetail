import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Sidebar } from '../components/sidebar.js';
import { useSessionStore } from '../lib/session-store.js';

export const Route = createRootRoute({ component: RootLayout });

function RootLayout() {
  const isAuthenticated = useSessionStore((s) => s.status === 'authenticated');

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
}
