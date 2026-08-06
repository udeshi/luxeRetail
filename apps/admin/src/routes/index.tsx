import { createFileRoute } from '@tanstack/react-router';
import { useAdminOrders, useAdminProducts } from '@org/api-client';
import { Card } from '@org/ui';
import { formatPrice } from '@org/utils';
import { requireAdmin } from '../lib/auth-guard.js';

export const Route = createFileRoute('/')({
  beforeLoad: requireAdmin,
  component: DashboardPage,
});

function DashboardPage() {
  const { data: products } = useAdminProducts({ page: 1, pageSize: 1 });
  const { data: orders } = useAdminOrders({ page: 1, pageSize: 100 });

  const revenueCents = orders?.items.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.totalCents, 0) ?? 0;
  const pendingCount = orders?.items.filter((o) => o.status === 'PENDING').length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Products" value={String(products?.total ?? '—')} />
        <StatCard label="Orders" value={String(orders?.total ?? '—')} />
        <StatCard label="Revenue" value={formatPrice(revenueCents)} />
        <StatCard label="Pending orders" value={String(pendingCount)} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-6">
      <p className="text-sm text-brand-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-brand-900">{value}</p>
    </Card>
  );
}
