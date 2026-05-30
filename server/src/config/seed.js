import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SHOP_CATEGORIES = [
  { slug: 'all', label: 'All', sortOrder: 0 },
  { slug: 'gelato', label: 'Gelato', sortOrder: 1 },
  { slug: 'coffee', label: 'Coffee', sortOrder: 2 },
  { slug: 'bakery', label: 'Bakery', sortOrder: 3 },
  { slug: 'waffle', label: 'Waffles', sortOrder: 4 },
  { slug: 'baklava', label: 'Baklava', sortOrder: 5 },
  { slug: 'cake', label: 'Cakes', sortOrder: 6 },
  { slug: 'dessert', label: 'Desserts', sortOrder: 7 },
];

const SHOP_PRODUCTS = [
  // ── Gelato ──
  { name: 'prod_g1_name', description: 'prod_g1_desc', price: 8.50, categorySlug: 'gelato', badge: 'Signature', image: '/images/gelato.png' },
  { name: 'prod_g2_name', description: 'prod_g2_desc', price: 7.50, categorySlug: 'gelato', badge: 'Best Seller', image: '/images/gelato.png' },
  { name: 'prod_g3_name', description: 'prod_g3_desc', price: 7.00, categorySlug: 'gelato', badge: null, image: '/images/gelato.png' },
  { name: 'prod_g4_name', description: 'prod_g4_desc', price: 7.50, categorySlug: 'gelato', badge: 'Fresh Daily', image: '/images/gelato.png' },

  // ── Coffee ──
  { name: 'prod_c1_name', description: 'prod_c1_desc', price: 6.50, categorySlug: 'coffee', badge: 'Best Seller', image: '/images/coffee.png' },
  { name: 'prod_c2_name', description: 'prod_c2_desc', price: 7.00, categorySlug: 'coffee', badge: 'Signature', image: '/images/coffee.png' },
  { name: 'prod_c3_name', description: 'prod_c3_desc', price: 8.00, categorySlug: 'coffee', badge: null, image: '/images/coffee.png' },
  { name: 'prod_c4_name', description: 'prod_c4_desc', price: 5.50, categorySlug: 'coffee', badge: null, image: '/images/coffee.png' },

  // ── Bakery ──
  { name: 'prod_b1_name', description: 'prod_b1_desc', price: 5.50, categorySlug: 'bakery', badge: 'Fresh Daily', image: '/images/bakery.png' },
  { name: 'prod_b2_name', description: 'prod_b2_desc', price: 6.00, categorySlug: 'bakery', badge: 'Fresh Daily', image: '/images/bakery.png' },
  { name: 'prod_b3_name', description: 'prod_b3_desc', price: 6.50, categorySlug: 'bakery', badge: 'Best Seller', image: '/images/bakery.png' },
  { name: 'prod_b4_name', description: 'prod_b4_desc', price: 5.50, categorySlug: 'bakery', badge: null, image: '/images/bakery.png' },

  // ── Waffles ──
  { name: 'prod_w1_name', description: 'prod_w1_desc', price: 14.50, categorySlug: 'waffle', badge: 'Signature', image: '/images/waffle.png' },
  { name: 'prod_w2_name', description: 'prod_w2_desc', price: 13.50, categorySlug: 'waffle', badge: 'Best Seller', image: '/images/waffle.png' },
  { name: 'prod_w3_name', description: 'prod_w3_desc', price: 12.00, categorySlug: 'waffle', badge: null, image: '/images/waffle.png' },

  // ── Baklava ──
  { name: 'prod_bk1_name', description: 'prod_bk1_desc', price: 12.00, categorySlug: 'baklava', badge: 'Best Seller', image: '/images/baklava.png' },
  { name: 'prod_bk2_name', description: 'prod_bk2_desc', price: 10.00, categorySlug: 'baklava', badge: null, image: '/images/baklava.png' },
  { name: 'prod_bk3_name', description: 'prod_bk3_desc', price: 28.00, categorySlug: 'baklava', badge: 'Signature', image: '/images/baklava.png' },

  // ── Cakes ──
  { name: 'prod_ck1_name', description: 'prod_ck1_desc', price: 9.50, categorySlug: 'cake', badge: 'Signature', image: '/images/cake.png' },
  { name: 'prod_ck2_name', description: 'prod_ck2_desc', price: 8.50, categorySlug: 'cake', badge: 'Best Seller', image: '/images/cake.png' },
  { name: 'prod_ck3_name', description: 'prod_ck3_desc', price: 8.00, categorySlug: 'cake', badge: null, image: '/images/cake.png' },

  // ── Desserts ──
  { name: 'prod_d1_name', description: 'prod_d1_desc', price: 11.00, categorySlug: 'dessert', badge: 'Signature', image: '/images/dessert.png' },
  { name: 'prod_d2_name', description: 'prod_d2_desc', price: 9.00, categorySlug: 'dessert', badge: null, image: '/images/dessert.png' },
  { name: 'prod_d3_name', description: 'prod_d3_desc', price: 8.50, categorySlug: 'dessert', badge: 'Fresh Daily', image: '/images/dessert.png' },
];

async function main() {
  console.log('🌱 Seeding Gelatte database...');

  // Create Categories (upsert)
  const categoryMap = {}; // slug -> id
  for (const cat of SHOP_CATEGORIES) {
    if (cat.slug === 'all') continue; // We don't seed 'all' into DB

    const dbCategory = await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: { label: cat.label, sortOrder: cat.sortOrder },
      create: { slug: cat.slug, label: cat.label, sortOrder: cat.sortOrder },
    });
    categoryMap[cat.slug] = dbCategory.id;
    console.log(`✅ Upserted category: ${cat.label}`);
  }

  // Create Products (upsert by checking if product with same name exists, if not create)
  for (const prod of SHOP_PRODUCTS) {
    // Check if it already exists
    const existing = await prisma.product.findFirst({
      where: { name: JSON.stringify(prod.name) },
      include: { images: true }
    });

    if (existing) {
      console.log(`⏩ Product already exists: ${prod.name}`);
      continue;
    }

    const categoryId = categoryMap[prod.categorySlug];
    if (!categoryId) {
      console.warn(`⚠️ Skipping product ${prod.name}: Category '${prod.categorySlug}' not found.`);
      continue;
    }

    const dbProduct = await prisma.product.create({
      data: {
        categoryId,
        name: JSON.stringify(prod.name),
        description: JSON.stringify(prod.description),
        price: prod.price,
        stock: 100, // default stock
        badge: prod.badge,
        images: {
          create: [{ url: prod.image, sortOrder: 0 }]
        }
      }
    });
    console.log(`✅ Created product: ${prod.name}`);
  }

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
