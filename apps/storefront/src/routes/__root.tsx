import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '../components/header.js';
import { Footer } from '../components/footer.js';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
