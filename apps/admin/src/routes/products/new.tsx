import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCreateProduct } from '@org/api-client';
import { requireAdmin } from '../../lib/auth-guard.js';
import { ProductForm } from '../../components/product-form.js';

export const Route = createFileRoute('/products/new')({
  beforeLoad: requireAdmin,
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-900">New Product</h1>
      <div className="mt-6">
        <ProductForm
          submitLabel="Create Product"
          isSubmitting={createProduct.isPending}
          submitError={createProduct.error?.message}
          onSubmit={(values) => createProduct.mutate(values, { onSuccess: () => navigate({ to: '/products' }) })}
        />
      </div>
    </div>
  );
}
