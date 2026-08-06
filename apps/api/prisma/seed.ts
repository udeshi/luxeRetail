/**
 * Populates local/dev Postgres with enough realistic data that the
 * storefront, admin, and mobile apps all look like a real store the moment
 * you run them — matches the LuxeRetail mockups (blazers, bags, watches...).
 *
 * Run via `pnpm nx run api:prisma-seed` (wraps `prisma db seed`).
 */
import { hash } from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await hash('Password123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@luxeretail.dev' },
    update: {},
    create: {
      email: 'admin@luxeretail.dev',
      passwordHash,
      firstName: 'Ava',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@luxeretail.dev' },
    update: {},
    create: {
      email: 'customer@luxeretail.dev',
      passwordHash,
      firstName: 'Sam',
      lastName: 'Customer',
      role: 'CUSTOMER',
    },
  });

  await prisma.cart.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id },
  });

  const categories = await Promise.all(
    [
      { name: 'Apparel', slug: 'apparel' },
      { name: 'Accessories', slug: 'accessories' },
      { name: 'Footwear', slug: 'footwear' },
      { name: 'Watches', slug: 'watches' },
    ].map((c) => prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c })),
  );
  const byslug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  type Seed = {
    name: string;
    slug: string;
    description: string;
    basePriceCents: number;
    categorySlug: string;
    imageUrl: string;
    status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    variants: { sku: string; attributes: Record<string, string>; priceCents?: number; inventoryQty: number }[];
  };

  const products: Seed[] = [
    {
      name: 'Tailored Emerald Blazer',
      slug: 'tailored-emerald-blazer',
      description:
        'A single-breasted wool-blend blazer in a rich emerald tone, cut for a tailored silhouette that moves easily from desk to dinner.',
      basePriceCents: 45000,
      categorySlug: 'apparel',
      imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      variants: [
        { sku: 'BLZ-EMR-S', attributes: { size: 'S' }, inventoryQty: 8 },
        { sku: 'BLZ-EMR-M', attributes: { size: 'M' }, inventoryQty: 12 },
        { sku: 'BLZ-EMR-L', attributes: { size: 'L' }, inventoryQty: 6 },
      ],
    },
    {
      name: 'Minimal Crossbody Bag',
      slug: 'minimal-crossbody-bag',
      description:
        'Premium Italian leather crossbody with an adjustable strap and a single interior pocket — bold, dark grey, quietly detailed.',
      basePriceCents: 28500,
      categorySlug: 'accessories',
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
      variants: [
        { sku: 'BAG-CB-CHR', attributes: { color: 'Charcoal' }, inventoryQty: 20 },
        { sku: 'BAG-CB-BLK', attributes: { color: 'Black' }, inventoryQty: 15 },
      ],
    },
    {
      name: 'Aero Trainer Classic',
      slug: 'aero-trainer-classic',
      description: 'A clean low-top trainer in white leather with a soft grey accent — everyday, all-day comfort.',
      basePriceCents: 15000,
      categorySlug: 'footwear',
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
      variants: [
        { sku: 'SNK-AERO-40', attributes: { size: 'EU40' }, inventoryQty: 10 },
        { sku: 'SNK-AERO-41', attributes: { size: 'EU41' }, inventoryQty: 10 },
        { sku: 'SNK-AERO-42', attributes: { size: 'EU42' }, inventoryQty: 14 },
      ],
    },
    {
      name: 'Veridian Chronograph',
      slug: 'veridian-chronograph',
      description:
        'Automatic chronograph with a sunburst emerald dial, brushed-steel case, and a sapphire crystal — built to last generations.',
      basePriceCents: 62000,
      categorySlug: 'watches',
      imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800',
      variants: [{ sku: 'WCH-VRD-STL', attributes: { band: 'Steel' }, inventoryQty: 5 }],
    },
    {
      name: 'Silk Wide-Leg Trouser',
      slug: 'silk-wide-leg-trouser',
      description: 'Fluid, wide-leg silk trousers with a fitted waistband — sage green, cut for effortless movement.',
      basePriceCents: 34000,
      categorySlug: 'apparel',
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
      variants: [
        { sku: 'TRS-SG-S', attributes: { size: 'S' }, inventoryQty: 9 },
        { sku: 'TRS-SG-M', attributes: { size: 'M' }, inventoryQty: 11 },
      ],
    },
    {
      name: 'Geometric Canvas Tote',
      slug: 'geometric-canvas-tote',
      description: 'A structured emerald-green tote in coated canvas with vegetable-tanned leather handles.',
      basePriceCents: 19000,
      categorySlug: 'accessories',
      imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800',
      variants: [{ sku: 'TOTE-GEO-GRN', attributes: { color: 'Emerald' }, inventoryQty: 18 }],
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        basePriceCents: p.basePriceCents,
        status: p.status ?? 'ACTIVE',
        categoryId: byslug[p.categorySlug].id,
        images: { create: [{ url: p.imageUrl, altText: p.name, position: 0 }] },
      },
    });

    for (const v of p.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: {
          productId: product.id,
          sku: v.sku,
          attributes: v.attributes,
          priceCents: v.priceCents ?? p.basePriceCents,
          inventoryQty: v.inventoryQty,
        },
      });
    }
  }

  console.log('Seed complete.');
  console.log(`  Admin login:    admin@luxeretail.dev / Password123!`);
  console.log(`  Customer login: customer@luxeretail.dev / Password123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
