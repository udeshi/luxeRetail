import { Link } from '@tanstack/react-router';
import { ShoppingBag, User } from 'lucide-react';
import { useCart } from '@org/api-client';
import { useSessionStore } from '../lib/session-store.js';

export function Header() {
  const isAuthenticated = useSessionStore((s) => s.status === 'authenticated');
  const { data: cart } = useCart(isAuthenticated);
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-30 border-b border-brand-100/60 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-semibold tracking-tight text-brand-900">
          LuxeRetail
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-brand-700 md:flex">
          <Link to="/" className="hover:text-brand-900" activeProps={{ className: 'text-brand-900' }}>
            New Arrivals
          </Link>
          <Link to="/catalog" className="hover:text-brand-900" activeProps={{ className: 'text-brand-900' }}>
            Catalog
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative rounded-full p-2 hover:bg-brand-50" aria-label="Cart">
            <ShoppingBag className="h-5 w-5 text-brand-800" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-800 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            to={isAuthenticated ? '/account/orders' : '/login'}
            className="rounded-full p-2 hover:bg-brand-50"
            aria-label="Account"
          >
            <User className="h-5 w-5 text-brand-800" />
          </Link>
        </div>
      </div>
    </header>
  );
}
