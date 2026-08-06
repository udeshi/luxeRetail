import type { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProductRequestSchema, type CreateProductRequest } from '@org/contracts';
import { useCategories } from '@org/api-client';
import { Button, Input, Label, Select } from '@org/ui';
import { slugify } from '@org/utils';
import { ImageUploader } from './image-uploader.js';

// The schema's `status`/`imageUrls` fields have zod defaults, so the form's
// *input* shape (before defaults apply) has them optional — but the value
// handed to onSubmit is the fully-resolved *output* shape. Three type
// params on useForm keeps both ends accurate instead of forcing one type
// to (incorrectly) describe both.
type ProductFormInput = z.input<typeof CreateProductRequestSchema>;

export function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: {
  defaultValues?: Partial<CreateProductRequest>;
  onSubmit: (values: CreateProductRequest) => void;
  isSubmitting: boolean;
  submitLabel: string;
}) {
  const { data: categories } = useCategories();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, CreateProductRequest>({
    resolver: zodResolver(CreateProductRequestSchema),
    defaultValues: {
      status: 'DRAFT',
      imageUrls: [],
      variants: [{ sku: '', attributes: { option: 'Default' }, priceCents: 0, inventoryQty: 0 }],
      ...defaultValues,
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });
  const imageUrls = watch('imageUrls');
  const name = watch('name');

  return (
    <form className="max-w-2xl space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          error={errors.name?.message}
          {...register('name', {
            onChange: (e) => setValue('slug', slugify(e.target.value)),
          })}
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" error={errors.slug?.message} {...register('slug')} placeholder={name ? slugify(name) : undefined} />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={4}
          className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          {...register('description')}
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="basePriceCents">Base price (cents)</Label>
          <Input
            id="basePriceCents"
            type="number"
            error={errors.basePriceCents?.message}
            {...register('basePriceCents', { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register('status')}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="categoryId">Category</Label>
        <Select id="categoryId" {...register('categoryId')}>
          <option value="">Select a category</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
      </div>

      <div>
        <Label>Images</Label>
        <ImageUploader urls={imageUrls ?? []} onChange={(urls) => setValue('imageUrls', urls)} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Variants</Label>
          <button
            type="button"
            className="text-xs font-medium text-brand-600 hover:underline"
            onClick={() => append({ sku: '', attributes: { option: 'Default' }, priceCents: 0, inventoryQty: 0 })}
          >
            + Add variant
          </button>
        </div>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_1fr_100px_100px_auto] items-end gap-2 rounded-xl border border-brand-100 p-3">
              <div>
                <Label className="text-xs">SKU</Label>
                <Input {...register(`variants.${index}.sku`)} />
              </div>
              <div>
                <Label className="text-xs">Option (e.g. Size: M)</Label>
                <Input
                  defaultValue={Object.values(field.attributes ?? {})[0] ?? ''}
                  onChange={(e) => setValue(`variants.${index}.attributes`, { option: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Price (¢)</Label>
                <Input type="number" {...register(`variants.${index}.priceCents`, { valueAsNumber: true })} />
              </div>
              <div>
                <Label className="text-xs">Stock</Label>
                <Input type="number" {...register(`variants.${index}.inventoryQty`, { valueAsNumber: true })} />
              </div>
              <button
                type="button"
                className="mb-2 text-xs text-red-500 hover:underline disabled:opacity-30"
                disabled={fields.length <= 1}
                onClick={() => remove(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {errors.variants && <p className="mt-1 text-xs text-red-600">{errors.variants.message as string}</p>}
      </div>

      <Button type="submit" size="lg" loading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
