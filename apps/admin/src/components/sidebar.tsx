import { Link, useNavigate } from '@tanstack/react-router';
import { LayoutGrid, LogOut, Package, ShoppingCart } from 'lucide-react';
import { useLogout } from '@org/api-client';
import { useSessionStore } from '../lib/session-store.js';

export function Sidebar() {
  const user = useSessionStore((s) => s.user);
  const clearSession = useSessionStore((s) => s.clearSession);
  const navigate = useNavigate();
  const logout = useLogout();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-brand-100 bg-white px-4 py-6">
      <div className="px-2 text-lg font-semibold text-brand-900">LuxeRetail</div>
      <p className="px-2 text-xs text-brand-400">Admin</p>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        <NavItem to="/" icon={LayoutGrid} label="Dashboard" />
        <NavItem to="/products" icon={Package} label="Products" />
        <NavItem to="/orders" icon={ShoppingCart} label="Orders" />
      </nav>

      <div className="border-t border-brand-100 pt-4">
        <p className="truncate px-2 text-xs text-brand-500">{user?.email}</p>
        <button
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-brand-600 hover:bg-brand-50"
          onClick={() => {
            logout.mutate(undefined, {
              onSettled: () => {
                clearSession();
                navigate({ to: '/login' });
              },
            });
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof Package; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
      activeProps={{ className: 'bg-brand-50 text-brand-900' }}
      activeOptions={{ exact: to === '/' }}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
