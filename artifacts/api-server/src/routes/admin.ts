import { and, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { brands, categories, customers, enquiries, orderItems, orders, products } from "@workspace/db/schema";
import { requireAdmin } from "../middlewares/auth";
import { allowedStatuses } from "./customer";
import { ensureSeeded, toProduct } from "./catalogue";

const router: IRouter = Router();

router.get("/admin/products", requireAdmin, async (_req, res) => {
  await ensureSeeded();
  const rows = await db.select({ product: products, brand: brands.name, category: categories.name })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(products.name);
  res.json(rows.map((row) => toProduct(row.product, row.brand, row.category)));
});

router.get("/admin/customers", requireAdmin, async (_req, res) => {
  res.json(await db.select({
    id: customers.id,
    clerkUserId: customers.clerkUserId,
    name: customers.name,
    businessName: customers.businessName,
    phone: customers.phone,
    whatsapp: customers.whatsapp,
    city: customers.city,
    address: customers.address,
    createdAt: customers.createdAt,
  }).from(customers).orderBy(customers.createdAt));
});

router.get("/admin/enquiries", requireAdmin, async (_req, res) => {
  res.json(await db.select({
    id: enquiries.id,
    customerId: enquiries.customerId,
    message: enquiries.message,
    status: enquiries.status,
    createdAt: enquiries.createdAt,
  }).from(enquiries).orderBy(enquiries.createdAt));
});

router.get("/admin/orders", requireAdmin, async (_req, res) => {
  const rows = await db.select({
    id: orders.id,
    customerId: orders.customerId,
    status: orders.status,
    message: orders.message,
    createdAt: orders.createdAt,
  }).from(orders).orderBy(orders.createdAt);
  const withItems = await Promise.all(rows.map(async (order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    items: await db.select({
      productId: orderItems.productId,
      productName: products.name,
      quantity: orderItems.quantity,
    }).from(orderItems).innerJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, order.id)),
  })));
  res.json(withItems);
});

router.get("/admin/brands", requireAdmin, async (_req, res) => {
  await ensureSeeded();
  res.json(await db.select().from(brands).orderBy(brands.name));
});

router.get("/admin/categories", requireAdmin, async (_req, res) => {
  await ensureSeeded();
  res.json(await db.select().from(categories).orderBy(categories.name));
});

router.post("/admin/products", requireAdmin, async (req, res) => {
  await ensureSeeded();
  const body = req.body as Record<string, unknown>;
  if (typeof body.name !== "string" || typeof body.slug !== "string" || !Number.isInteger(body.brandId) || !Number.isInteger(body.categoryId)) {
    res.status(400).json({ error: "slug, name, brandId and categoryId are required" });
    return;
  }
  const [created] = await db.insert(products).values({
    slug: body.slug,
    name: body.name,
    brandId: body.brandId as number,
    categoryId: body.categoryId as number,
    grade: typeof body.grade === "string" ? body.grade : null,
    packSize: typeof body.packSize === "string" ? body.packSize : null,
    application: typeof body.application === "string" ? body.application : null,
    imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : null,
    availability: typeof body.availability === "string" ? body.availability : null,
  }).returning();
  res.status(201).json(created);
});

router.patch("/admin/products/:id", requireAdmin, async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const update: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of ["slug", "name", "grade", "packSize", "application", "imageUrl", "availability"]) {
    if (typeof body[key] === "string" || body[key] === null) update[key] = body[key];
  }
  if (Number.isInteger(body.brandId)) update.brandId = body.brandId;
  if (Number.isInteger(body.categoryId)) update.categoryId = body.categoryId;
  if (typeof body.active === "boolean") update.active = body.active;
  const [updated] = await db.update(products).set(update).where(eq(products.id, Number(req.params.id))).returning();
  if (!updated) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(updated);
});

router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  await db.update(products).set({ active: false, updatedAt: new Date() }).where(eq(products.id, Number(req.params.id)));
  res.status(204).send();
});

router.patch("/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const status = typeof req.body?.status === "string" ? req.body.status : "";
  if (!allowedStatuses.has(status)) { res.status(400).json({ error: "Invalid order status" }); return; }
  const [updated] = await db.update(orders).set({ status }).where(eq(orders.id, Number(req.params.id))).returning();
  if (!updated) { res.status(404).json({ error: "Order not found" }); return; }
  const items = await db.select({ productId: orderItems.productId, quantity: orderItems.quantity }).from(orderItems).where(eq(orderItems.orderId, updated.id));
  res.json({ id: updated.id, status: updated.status, message: updated.message, createdAt: updated.createdAt.toISOString(), items });
});

router.post("/admin/brands", requireAdmin, async (req, res) => {
  if (typeof req.body?.name !== "string" || !req.body.name.trim()) { res.status(400).json({ error: "Brand name is required" }); return; }
  const [created] = await db.insert(brands).values({ name: req.body.name.trim() }).returning();
  res.status(201).json(created);
});

router.post("/admin/categories", requireAdmin, async (req, res) => {
  if (typeof req.body?.name !== "string" || !req.body.name.trim()) { res.status(400).json({ error: "Category name is required" }); return; }
  const [created] = await db.insert(categories).values({ name: req.body.name.trim() }).returning();
  res.status(201).json(created);
});

router.patch("/admin/brands/:id", requireAdmin, async (req, res) => {
  if (typeof req.body?.name !== "string" || !req.body.name.trim()) { res.status(400).json({ error: "Brand name is required" }); return; }
  const [updated] = await db.update(brands).set({ name: req.body.name.trim() }).where(eq(brands.id, Number(req.params.id))).returning();
  if (!updated) { res.status(404).json({ error: "Brand not found" }); return; }
  res.json(updated);
});

router.delete("/admin/brands/:id", requireAdmin, async (req, res) => {
  const linked = await db.select({ id: products.id }).from(products).where(eq(products.brandId, Number(req.params.id))).limit(1);
  if (linked.length) {
    res.status(409).json({ error: "Brand has products and cannot be deleted until those products are removed" });
    return;
  }
  await db.delete(brands).where(eq(brands.id, Number(req.params.id)));
  res.status(204).send();
});

router.patch("/admin/categories/:id", requireAdmin, async (req, res) => {
  if (typeof req.body?.name !== "string" || !req.body.name.trim()) { res.status(400).json({ error: "Category name is required" }); return; }
  const [updated] = await db.update(categories).set({ name: req.body.name.trim() }).where(eq(categories.id, Number(req.params.id))).returning();
  if (!updated) { res.status(404).json({ error: "Category not found" }); return; }
  res.json(updated);
});

router.delete("/admin/categories/:id", requireAdmin, async (req, res) => {
  const linked = await db.select({ id: products.id }).from(products).where(eq(products.categoryId, Number(req.params.id))).limit(1);
  if (linked.length) {
    res.status(409).json({ error: "Category has products and cannot be deleted until those products are removed" });
    return;
  }
  await db.delete(categories).where(eq(categories.id, Number(req.params.id)));
  res.status(204).send();
});

export default router;