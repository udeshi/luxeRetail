import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import './lib/api-client-setup.js'; // side-effect: configureApiClient() must run before anything fetches
import { bootstrapSession } from './lib/api-client-setup.js';
import { queryClient } from './lib/query-client.js';
import { routeTree } from './routeTree.gen';
import './styles.css';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Restore the session from the httpOnly refresh cookie (if any) before the
// first render, so signed-in users don't see a flash of logged-out UI.
bootstrapSession().finally(() => {
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
});
