import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAdminProduct, useUpdateProduct } from '@org/api-client';
import { Spinner } from '@org/ui';
import { requireAdmin } from '../../../lib/auth-guard.js';
import { ProductForm } from '../../../components/product-form.js';

export const Route = createFileRoute('/products/$id/edit')({
  beforeLoad: requireAdmin,
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: product, isPending } = useAdminProduct(id);
  const updateProduct = useUpdateProduct();

  if (isPending) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (!product) return <p className="text-brand-500">Product not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-900">Edit {product.name}</h1>
      <div className="mt-6">
        <ProductForm
          submitLabel="Save Changes"
          isSubmitting={updateProduct.isPending}
          submitError={updateProduct.error?.message}
          defaultValues={{
            name: product.name,
            slug: product.slug,
            description: product.description,
            basePriceCents: product.basePriceCents,
            categoryId: product.categoryId,
            status: product.status,
            imageUrls: product.images.map((i) => i.url),
            variants: product.variants.map((v) => ({
              sku: v.sku,
              attributes: v.attributes,
              priceCents: v.priceCents,
              inventoryQty: v.inventoryQty,
            })),
          }}
          onSubmit={(values) => updateProduct.mutate({ id, input: values }, { onSuccess: () => navigate({ to: '/products' }) })}
        />
      </div>
    </div>
  );
}
