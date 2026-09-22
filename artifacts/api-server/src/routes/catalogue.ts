import { and, eq, ilike, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { brands, categories, products } from "@workspace/db/schema";

const router: IRouter = Router();

const brandSeed = ["BLAZOL", "BELLZOIL", "EMPOWER"];
const categorySeed = ["Engine Oils", "Gear Oils", "Greases", "Hydraulic Oils", "Transmission Oils", "Coolants", "Brake Fluids", "Differential Oils", "Industrial Lubricants", "Other Lubricants"];
const productSeed = [
  ["bellzoil-gear-power-75w90", "BELLZOIL", "Gear Oils", "Gear Power 75W90 Gear Oil"],
  ["bellzoil-gear-power-80w90", "BELLZOIL", "Gear Oils", "Gear Power 80W90 Gear Oil"],
  ["bellzoil-gear-power-85w140", "BELLZOIL", "Gear Oils", "Gear Power 85W140"],
  ["bellzoil-gear-lube-ep90", "BELLZOIL", "Gear Oils", "Gear Lube EP 90 Gear Oil"],
  ["bellzoil-gear-lube-ep140", "BELLZOIL", "Gear Oils", "Gear Lube EP140 Gear Oil"],
  ["bellzoil-long-run-grease", "BELLZOIL", "Greases", "Long Run Grease"],
  ["bellzoil-turbo-tc", "BELLZOIL", "Engine Oils", "Turbo TC 15W40 CF4 Engine Oil"],
  ["bellzoil-super-nxg", "BELLZOIL", "Engine Oils", "Super NXG Engine Oil"],
  ["empower-chassis-grease", "EMPOWER", "Greases", "Empower Chassis Grease"],
  ["empower-blue-gel-grease", "EMPOWER", "Greases", "Blue Gel Grease XHP"],
  ["empower-engine-oils", "EMPOWER", "Engine Oils", "Empower Engine Oils"],
  ["empower-coolant", "EMPOWER", "Coolants", "Empower Coolant Products"],
  ["empower-heavy-duty-gear", "EMPOWER", "Gear Oils", "Heavy Duty Gear Oils"],
  ["blazol-engine-oils", "BLAZOL", "Engine Oils", "Blazol Engine Oils"],
  ["blazol-greases", "BLAZOL", "Greases", "Blazol Greases"],
] as const;

let seeded = false;
async function ensureSeeded() {
  if (seeded) return;
  const existing = await db.select({ id: brands.id }).from(brands).limit(1);
  if (!existing.length) {
    await db.insert(brands).values(brandSeed.map((name) => ({ name }))).onConflictDoNothing();
    await db.insert(categories).values(categorySeed.map((name) => ({ name }))).onConflictDoNothing();
    const brandRows = await db.select().from(brands);
    const categoryRows = await db.select().from(categories);
    const brandMap = new Map(brandRows.map((row) => [row.name, row.id]));
    const categoryMap = new Map(categoryRows.map((row) => [row.name, row.id]));
    await db.insert(products).values(productSeed.map(([slug, brand, category, name]) => ({
      slug,
      brandId: brandMap.get(brand)!,
      categoryId: categoryMap.get(category)!,
      name,
      imageUrl: null,
    }))).onConflictDoNothing();
  }
  seeded = true;
}

function toProduct(row: typeof products.$inferSelect, brand: string, category: string) {
  return {
    id: row.id,
    slug: row.slug,
    brand,
    category,
    name: row.name,
    grade: row.grade,
    packSize: row.packSize,
    application: row.application,
    imageUrl: row.imageUrl,
    availability: row.availability,
  };
}

router.get("/products", async (req, res) => {
  await ensureSeeded();
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const brand = typeof req.query.brand === "string" ? req.query.brand : undefined;
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const rows = await db
    .select({ product: products, brand: brands.name, category: categories.name })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(
      eq(products.active, true),
      brand ? eq(brands.name, brand) : undefined,
      category ? eq(categories.name, category) : undefined,
      q ? or(ilike(products.name, `%${q}%`), ilike(brands.name, `%${q}%`), ilike(categories.name, `%${q}%`)) : undefined,
    ));
  res.json(rows.map((row) => toProduct(row.product, row.brand, row.category)));
});

router.get("/brands", async (_req, res) => {
  await ensureSeeded();
  res.json(await db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(brands.name));
});

router.get("/categories", async (_req, res) => {
  await ensureSeeded();
  res.json(await db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(categories.name));
});

export { ensureSeeded, toProduct };
export default router;