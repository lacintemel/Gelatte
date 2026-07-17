import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════
// Turkish-aware string utilities
// ═══════════════════════════════════════════

function turkishLower(str) {
  return (str || '').toLocaleLowerCase('tr-TR').trim();
}

/**
 * Parse a product name that may be JSON-stringified (legacy format)
 * or a plain text string (new format).
 */
function parseName(raw) {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed.tr || parsed.en || JSON.stringify(parsed);
    }
    return String(parsed);
  } catch {
    return String(raw);
  }
}

// ═══════════════════════════════════════════
// Category & Product Data
// ═══════════════════════════════════════════

/**
 * Categories in display order. sortOrder determines the tab order
 * in the shop page. New categories get low values (1–18),
 * old/legacy categories get high values (100+).
 */
const CATEGORIES = [
  { slug: 'croissant-sandwich', label: 'Croissant Sandwich', sortOrder: 1 },
  { slug: 'croissant', label: 'Croissant / Kruvasan', sortOrder: 2 },
  { slug: 'sandwich', label: 'Sandwich', sortOrder: 3 },
  { slug: 'coffees', label: 'Coffees', sortOrder: 4 },
  { slug: 'hot-drinks', label: 'Hot Drinks', sortOrder: 5 },
  { slug: 'desserts', label: 'Desserts', sortOrder: 6 },
  { slug: 'waffle', label: 'Waffle', sortOrder: 7 },
  { slug: 'shakes', label: 'Shakes', sortOrder: 8 },
  { slug: 'frappe', label: 'Frappe', sortOrder: 9 },
  { slug: 'fruit-juices', label: 'Fruit Juices / Meyve Suları', sortOrder: 10 },
  { slug: 'soft-drinks', label: 'Soft Drinks', sortOrder: 11 },
  { slug: 'cold-coffees', label: 'Cold Coffees', sortOrder: 12 },
  { slug: 'extras', label: 'Extras', sortOrder: 13 },
  { slug: 'matchas', label: 'Matchas', sortOrder: 14 },
  { slug: 'gelato', label: 'Gelato', sortOrder: 15 },
  { slug: 'kg-gelato', label: 'KG Gelato', sortOrder: 16 },
  { slug: 'take-away-gelato', label: 'Take Away Gelato Cup', sortOrder: 17 },
  { slug: 'chocoberry', label: 'Chocoberry', sortOrder: 18 },
];

/**
 * Legacy categories that should be pushed after the new ones.
 * These will only be updated if they already exist in the DB.
 */
const LEGACY_CATEGORY_SORT = {
  'coffee': 100,
  'bakery': 101,
  'baklava': 102,
  'cake': 103,
  'dessert': 104,
};

/**
 * Menu product data grouped by category.
 * Products within each category are listed in the desired display order.
 * The seeder assigns sortOrder sequentially (1, 2, 3, …).
 *
 * For products with Medium/Large variants:
 *   - `price` = the Medium (smaller) price
 *   - `variants` = [{ name, price }] for each size
 *
 * For KG Gelato:
 *   - Variant names use "500 gr" / "1000 gr" instead of Medium/Large
 */
const MENU_DATA = [
  // ══════════════════════════════════════════
  // CROISSANT SANDWICH
  // ══════════════════════════════════════════
  {
    categorySlug: 'croissant-sandwich',
    products: [
      { name: 'Sade', price: 210 },
      { name: 'Üç Peynirli', price: 310, description: 'Cheddar, Kaşar Peyniri ve Labne' },
      { name: 'Hindi Fümeli', price: 360, description: 'Hindi Füme, Marul, Kaşar Peyniri ve Labne' },
      { name: 'Et Fümeli', price: 430, description: 'Et Füme, Cheddar, Roka ve Krem Peynir' },
      { name: 'Caprese Sandviç', price: 400, description: 'Mozzarella Peyniri, Domates, Fesleğen Pesto Sos ve Zeytinyağı' },
      { name: 'Scrambled Egg Croissant', price: 420, description: 'Avokado, Çırpılmış Yumurta, Labne ve Kaşar Peyniri' },
    ],
  },

  // ══════════════════════════════════════════
  // CROISSANT / KRUVASAN
  // ══════════════════════════════════════════
  {
    categorySlug: 'croissant',
    products: [
      { name: 'Nutellalı Kruvasan', price: 270 },
      { name: 'Kremalı ve Meyveli Kruvasan', price: 410 },
    ],
  },

  // ══════════════════════════════════════════
  // SANDWICH (Baget / Ciabatta / Ekşi Mayalı)
  // ══════════════════════════════════════════
  {
    categorySlug: 'sandwich',
    products: [
      { name: 'Hindi Fümeli', price: 310, description: 'Hindi Füme, Marul, Kaşar Peyniri ve Labne' },
      { name: 'Et Fümeli', price: 380, description: 'Et Füme, Cheddar, Roka ve Krem Peynir' },
      { name: 'Mozzarellalı', price: 370, description: 'Mozzarella Peyniri, Domates, Fesleğen Pesto Sos ve Zeytinyağı' },
    ],
  },

  // ══════════════════════════════════════════
  // COFFEES
  // ══════════════════════════════════════════
  {
    categorySlug: 'coffees',
    products: [
      // Single-price coffees
      { name: 'Ristretto', price: 175 },
      { name: 'Espresso', price: 175 },
      { name: 'Double Espresso', price: 225 },
      { name: 'Espresso Macchiato', price: 185 },
      { name: 'Espresso Con Panna', price: 185 },
      { name: 'Flat White', price: 250 },
      { name: 'Cortado', price: 270 },
      // Medium / Large coffees
      { name: 'Filter Coffee', price: 200, variants: [{ name: 'Medium', price: 200 }, { name: 'Large', price: 240 }] },
      { name: 'Americano', price: 220, variants: [{ name: 'Medium', price: 220 }, { name: 'Large', price: 260 }] },
      { name: 'Cappuccino', price: 255, variants: [{ name: 'Medium', price: 255 }, { name: 'Large', price: 295 }] },
      { name: 'Cafe Latte', price: 255, variants: [{ name: 'Medium', price: 255 }, { name: 'Large', price: 295 }] },
      { name: 'Latte Macchiato', price: 275, variants: [{ name: 'Medium', price: 275 }, { name: 'Large', price: 315 }] },
      { name: 'Caramel Macchiato', price: 285, variants: [{ name: 'Medium', price: 285 }, { name: 'Large', price: 325 }] },
      { name: 'Coffee Mocha', price: 280, variants: [{ name: 'Medium', price: 280 }, { name: 'Large', price: 320 }] },
      { name: 'White Mocha', price: 280, variants: [{ name: 'Medium', price: 280 }, { name: 'Large', price: 320 }] },
      { name: 'Türk Kahvesi', price: 160, variants: [{ name: 'Medium', price: 160 }, { name: 'Large', price: 200 }] },
    ],
  },

  // ══════════════════════════════════════════
  // HOT DRINKS
  // ══════════════════════════════════════════
  {
    categorySlug: 'hot-drinks',
    products: [
      // Single-price
      { name: 'Türk Çayı (Bardak-Glass)', price: 90 },
      { name: 'Bitki Çayı (Herbal Tea)', price: 240 },
      { name: 'Yeşil Çay (Green Tea)', price: 280 },
      // Medium / Large
      { name: 'Türk Çayı (Fincan-Cup)', price: 120, variants: [{ name: 'Medium', price: 120 }, { name: 'Large', price: 160 }] },
      { name: 'İngiliz Çayı (English Tea)', price: 240, variants: [{ name: 'Medium', price: 240 }, { name: 'Large', price: 280 }] },
      { name: 'Chai Tea Latte', price: 250, variants: [{ name: 'Medium', price: 250 }, { name: 'Large', price: 290 }] },
      { name: 'Sahlep', price: 260, variants: [{ name: 'Medium', price: 260 }, { name: 'Large', price: 300 }] },
      { name: 'Hot Chocolate', price: 280, variants: [{ name: 'Medium', price: 280 }, { name: 'Large', price: 320 }] },
    ],
  },

  // ══════════════════════════════════════════
  // DESSERTS
  // ══════════════════════════════════════════
  {
    categorySlug: 'desserts',
    products: [
      { name: 'San Sebastian', price: 400 },
      { name: 'Tiramisu', price: 360 },
      { name: 'Cheesecake', price: 420, description: 'Çilek, Frambuaz ve Lotus' },
      { name: 'Brownie', price: 340 },
      { name: 'Milföy Pasta', price: 350 },
      { name: 'Tartolet', price: 280 },
      { name: 'Fransız Ekler', price: 160 },
      { name: 'Cream Puff', price: 300 },
      { name: 'Cup Tatlılar', price: 320, description: 'Çilek, Oreo, Spoonfull vb.' },
      { name: 'Lotus Cup', price: 340 },
      { name: 'Dubai Cup', price: 340 },
      { name: 'Cookie', price: 160 },
      { name: 'American Cake', price: 440 },
    ],
  },

  // ══════════════════════════════════════════
  // WAFFLE
  // ══════════════════════════════════════════
  {
    categorySlug: 'waffle',
    products: [
      { name: 'Sade (Plain)', price: 200 },
      { name: '2 Meyveli', price: 450, description: 'Muz, Çilek, Krep Kırığı, Belçika Çikolatası' },
      { name: 'Cream Waffle', price: 490, description: 'Muz, Çilek, Pastacı Kreması, Beyaz ve Bitter Çikolata' },
      { name: 'Crazy Waffle', price: 1350, description: 'Çift Kat Waffle, Muz, Çilek, Krema, Belçika Çikolatası' },
    ],
  },

  // ══════════════════════════════════════════
  // SHAKES (all Medium / Large)
  // ══════════════════════════════════════════
  {
    categorySlug: 'shakes',
    products: [
      { name: 'Çikolata / Chocolate', price: 400, variants: [{ name: 'Medium', price: 400 }, { name: 'Large', price: 440 }] },
      { name: 'Karamel / Caramel', price: 400, variants: [{ name: 'Medium', price: 400 }, { name: 'Large', price: 440 }] },
      { name: 'Çilek / Strawberry', price: 400, variants: [{ name: 'Medium', price: 400 }, { name: 'Large', price: 440 }] },
      { name: 'Gök Mavisi / Sky Blue', price: 400, variants: [{ name: 'Medium', price: 400 }, { name: 'Large', price: 440 }] },
    ],
  },

  // ══════════════════════════════════════════
  // FRAPPE (all Medium / Large)
  // ══════════════════════════════════════════
  {
    categorySlug: 'frappe',
    products: [
      { name: 'Çikolata / Chocolate', price: 440, variants: [{ name: 'Medium', price: 440 }, { name: 'Large', price: 480 }] },
      { name: 'Vanilya / Vanilla', price: 440, variants: [{ name: 'Medium', price: 440 }, { name: 'Large', price: 480 }] },
      { name: 'Karamel / Caramel', price: 440, variants: [{ name: 'Medium', price: 440 }, { name: 'Large', price: 480 }] },
      { name: 'Oreo', price: 460, variants: [{ name: 'Medium', price: 460 }, { name: 'Large', price: 500 }] },
      { name: 'Nutella', price: 460, variants: [{ name: 'Medium', price: 460 }, { name: 'Large', price: 500 }] },
      { name: 'Lotus', price: 460, variants: [{ name: 'Medium', price: 460 }, { name: 'Large', price: 500 }] },
    ],
  },

  // ══════════════════════════════════════════
  // FRUIT JUICES / MEYVE SULARI (all Medium / Large)
  // ══════════════════════════════════════════
  {
    categorySlug: 'fruit-juices',
    products: [
      { name: 'Limonata', price: 220, variants: [{ name: 'Medium', price: 220 }, { name: 'Large', price: 260 }] },
      { name: 'Naneli Limonata', price: 230, variants: [{ name: 'Medium', price: 230 }, { name: 'Large', price: 270 }] },
      { name: 'Çilekli Limonata', price: 230, variants: [{ name: 'Medium', price: 230 }, { name: 'Large', price: 270 }] },
      { name: 'Portakal Suyu', price: 290, variants: [{ name: 'Medium', price: 290 }, { name: 'Large', price: 330 }] },
      { name: 'Mix', price: 350, variants: [{ name: 'Medium', price: 350 }, { name: 'Large', price: 390 }] },
    ],
  },

  // ══════════════════════════════════════════
  // SOFT DRINKS
  // ══════════════════════════════════════════
  {
    categorySlug: 'soft-drinks',
    products: [
      { name: 'Su', price: 40 },
      { name: 'Soda', price: 70 },
      { name: 'Mineralli Su', price: 120 },
      { name: 'Fuse Tea', price: 140 },
      { name: 'Coca Cola', price: 140 },
      { name: 'Fanta', price: 140 },
      { name: 'Sprite', price: 140 },
      { name: 'S. Pellegrino', price: 210 },
      { name: 'Red Bull', price: 180 },
      { name: 'Pin Drinks', price: 140 },
    ],
  },

  // ══════════════════════════════════════════
  // COLD COFFEES
  // ══════════════════════════════════════════
  {
    categorySlug: 'cold-coffees',
    products: [
      // Medium / Large
      { name: 'Ice Americano', price: 260, variants: [{ name: 'Medium', price: 260 }, { name: 'Large', price: 300 }] },
      { name: 'Ice Filter Coffee', price: 240, variants: [{ name: 'Medium', price: 240 }, { name: 'Large', price: 280 }] },
      { name: 'Ice Coffee', price: 280, variants: [{ name: 'Medium', price: 280 }, { name: 'Large', price: 320 }] },
      { name: 'Ice Latte', price: 295, variants: [{ name: 'Medium', price: 295 }, { name: 'Large', price: 335 }] },
      { name: 'Ice Caramel Latte', price: 300, variants: [{ name: 'Medium', price: 300 }, { name: 'Large', price: 340 }] },
      { name: 'Ice Vanilla Latte', price: 300, variants: [{ name: 'Medium', price: 300 }, { name: 'Large', price: 340 }] },
      { name: 'Ice Cappuccino', price: 295, variants: [{ name: 'Medium', price: 295 }, { name: 'Large', price: 335 }] },
      { name: 'Ice Mocha', price: 300, variants: [{ name: 'Medium', price: 300 }, { name: 'Large', price: 340 }] },
      { name: 'Ice White Mocha', price: 300, variants: [{ name: 'Medium', price: 300 }, { name: 'Large', price: 340 }] },
      { name: 'Ice Chai Tea Latte', price: 305, variants: [{ name: 'Medium', price: 305 }, { name: 'Large', price: 345 }] },
      // Single-price
      { name: 'Affagato', price: 350 },
    ],
  },

  // ══════════════════════════════════════════
  // EXTRAS
  // ══════════════════════════════════════════
  {
    categorySlug: 'extras',
    products: [
      { name: 'Süt / Milk', price: 30 },
      { name: 'Şurup / Syrup', price: 30 },
      { name: 'Ekstra Shot', price: 50 },
      { name: 'Bitkisel Sütler / Plant-Based Milk', price: 50 },
    ],
  },

  // ══════════════════════════════════════════
  // MATCHAS (all Medium / Large)
  // ══════════════════════════════════════════
  {
    categorySlug: 'matchas',
    products: [
      { name: 'Ice Matcha Latte', price: 320, variants: [{ name: 'Medium', price: 320 }, { name: 'Large', price: 360 }] },
      { name: 'Ice Strawberry Matcha Latte', price: 350, variants: [{ name: 'Medium', price: 350 }, { name: 'Large', price: 390 }] },
      { name: 'Ice Blue Matcha Latte', price: 350, variants: [{ name: 'Medium', price: 350 }, { name: 'Large', price: 390 }] },
    ],
  },

  // ══════════════════════════════════════════
  // GELATO
  // ══════════════════════════════════════════
  {
    categorySlug: 'gelato',
    products: [
      { name: '1 Top / 1 Scoop', price: 170 },
      { name: '2 Top / 2 Scoops', price: 320 },
      { name: '3 Top / 3 Scoops', price: 450 },
      { name: '4 Top / 4 Scoops', price: 580 },
      { name: 'Premium Gelato', price: 220 },
      { name: 'Extra Cornet', price: 70 },
    ],
  },

  // ══════════════════════════════════════════
  // KG GELATO (500 gr / 1000 gr variants)
  // ══════════════════════════════════════════
  {
    categorySlug: 'kg-gelato',
    products: [
      { name: 'Klasik', price: 700, variants: [{ name: '500 gr', price: 700 }, { name: '1000 gr', price: 1300 }] },
      { name: 'Premium', price: 850, variants: [{ name: '500 gr', price: 850 }, { name: '1000 gr', price: 1650 }] },
    ],
  },

  // ══════════════════════════════════════════
  // TAKE AWAY GELATO CUP
  // ══════════════════════════════════════════
  {
    categorySlug: 'take-away-gelato',
    products: [
      { name: '3 Top / 3 Scoops', price: 550 },
      { name: '4 Top / 4 Scoops', price: 650 },
    ],
  },

  // ══════════════════════════════════════════
  // CHOCOBERRY (Medium / Large)
  // ══════════════════════════════════════════
  {
    categorySlug: 'chocoberry',
    products: [
      { name: 'Çilek ve Belçika Çikolatası', price: 450, variants: [{ name: 'Medium', price: 450 }, { name: 'Large', price: 550 }] },
    ],
  },
];

// ═══════════════════════════════════════════
// Seed Logic
// ═══════════════════════════════════════════

async function main() {
  console.log('🌱 Seeding Gelatte database...\n');

  const report = {
    categoriesUpserted: [],
    created: [],
    updated: [],
    unmatched: [],
    variantsUpserted: 0,
  };

  // ── 1. Upsert new categories ────────────
  const categoryMap = {}; // slug → id
  for (const cat of CATEGORIES) {
    const dbCat = await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: { label: cat.label, sortOrder: cat.sortOrder },
      create: { slug: cat.slug, label: cat.label, sortOrder: cat.sortOrder },
    });
    categoryMap[cat.slug] = dbCat.id;
    report.categoriesUpserted.push(cat.slug);
  }
  console.log(`✅ Upserted ${CATEGORIES.length} categories`);

  // ── 2. Push legacy categories to the back ──
  for (const [slug, sortOrder] of Object.entries(LEGACY_CATEGORY_SORT)) {
    const existing = await prisma.productCategory.findUnique({ where: { slug } });
    if (existing) {
      await prisma.productCategory.update({
        where: { slug },
        data: { sortOrder },
      });
      console.log(`📦 Pushed legacy category "${slug}" to sortOrder ${sortOrder}`);
    }
  }

  // ── 3. Process each category's products ──
  for (const group of MENU_DATA) {
    const categoryId = categoryMap[group.categorySlug];
    if (!categoryId) {
      console.warn(`⚠️  Category "${group.categorySlug}" not found in categoryMap, skipping.`);
      continue;
    }

    console.log(`\n── ${group.categorySlug} ──`);

    // Get all existing products in this category
    const existingProducts = await prisma.product.findMany({
      where: { categoryId },
      include: { variants: true },
    });

    // Track which existing products are matched (to bump unmatched ones later)
    const matchedIds = new Set();

    // Process each product in prompt order
    for (let i = 0; i < group.products.length; i++) {
      const prod = group.products[i];
      const sortOrder = i + 1; // 1-based, sequential
      const normalizedName = turkishLower(prod.name);

      // Find existing product by Turkish-insensitive name within this category
      const match = existingProducts.find((ep) => {
        const epName = parseName(ep.name);
        return turkishLower(epName) === normalizedName;
      });

      if (match) {
        matchedIds.add(match.id);

        // Update existing product — preserve images, stock, badge, IDs, etc.
        const updateData = {
          name: prod.name,
          price: prod.price,
          sortOrder,
        };
        if (prod.description !== undefined) {
          updateData.description = prod.description;
        }

        await prisma.product.update({
          where: { id: match.id },
          data: updateData,
        });

        // Handle variants
        if (prod.variants) {
          await upsertVariants(match.id, match.variants, prod.variants);
        }

        report.updated.push(`${prod.name} [${group.categorySlug}]`);
        console.log(`  🔄 Updated: ${prod.name}`);
      } else {
        // Create new product
        const newProduct = await prisma.product.create({
          data: {
            categoryId,
            name: prod.name,
            description: prod.description || '',
            price: prod.price,
            sortOrder,
            stock: 100,
            showInMenu: true,
            availableForOnlineOrder: true,
          },
        });

        // Create variants
        if (prod.variants) {
          for (let vi = 0; vi < prod.variants.length; vi++) {
            const v = prod.variants[vi];
            await prisma.productVariant.create({
              data: {
                productId: newProduct.id,
                name: v.name,
                type: 'size',
                price: v.price,
                sortOrder: vi + 1,
                stock: 100,
              },
            });
            report.variantsUpserted++;
          }
        }

        report.created.push(`${prod.name} [${group.categorySlug}]`);
        console.log(`  ✅ Created: ${prod.name}`);
      }
    }

    // Bump unmatched existing products in this category to sortOrder 1000+
    const unmatchedProducts = existingProducts.filter((ep) => !matchedIds.has(ep.id));
    for (let j = 0; j < unmatchedProducts.length; j++) {
      const ep = unmatchedProducts[j];
      if (ep.sortOrder < 1000) {
        await prisma.product.update({
          where: { id: ep.id },
          data: { sortOrder: 1000 + j },
        });
        console.log(`  📦 Pushed to back: ${parseName(ep.name)} (sortOrder → ${1000 + j})`);
      }
    }
  }

  // ── 4. Print report ──
  console.log('\n' + '═'.repeat(50));
  console.log('📊 SEED REPORT');
  console.log('═'.repeat(50));
  console.log(`Categories upserted: ${report.categoriesUpserted.length}`);
  console.log(`Products created:    ${report.created.length}`);
  console.log(`Products updated:    ${report.updated.length}`);
  console.log(`Variants upserted:   ${report.variantsUpserted}`);

  if (report.created.length > 0) {
    console.log('\n── Created Products ──');
    report.created.forEach((p) => console.log(`  + ${p}`));
  }
  if (report.updated.length > 0) {
    console.log('\n── Updated Products ──');
    report.updated.forEach((p) => console.log(`  ~ ${p}`));
  }
  if (report.unmatched.length > 0) {
    console.log('\n── ⚠️  Unmatched (not safely matched) ──');
    report.unmatched.forEach((p) => console.log(`  ? ${p}`));
  }

  console.log('\n✨ Seeding complete!');
}

/**
 * Upsert size variants for a product.
 * Matches existing variants by Turkish-insensitive name + type.
 * Updates price and sortOrder if matched; creates if not.
 */
async function upsertVariants(productId, existingVariants, newVariants) {
  for (let i = 0; i < newVariants.length; i++) {
    const v = newVariants[i];
    const normalizedName = turkishLower(v.name);

    const match = existingVariants.find(
      (ev) => turkishLower(ev.name) === normalizedName && ev.type === 'size'
    );

    if (match) {
      await prisma.productVariant.update({
        where: { id: match.id },
        data: { price: v.price, sortOrder: i + 1 },
      });
    } else {
      await prisma.productVariant.create({
        data: {
          productId,
          name: v.name,
          type: 'size',
          price: v.price,
          sortOrder: i + 1,
          stock: 100,
        },
      });
    }
  }
}

// ═══════════════════════════════════════════
// Run
// ═══════════════════════════════════════════

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
