import { and, eq, inArray } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { customers, enquiries, orderItems, orders, products, brands, categories } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth";
import { ensureSeeded, toProduct } from "./catalogue";

const router: IRouter = Router();
const allowedStatuses = new Set(["NEW", "CONTACTED", "QUOTED", "CONFIRMED", "PROCESSING", "DISPATCHED", "COMPLETED", "CANCELLED"]);

async function getCustomer(userId: string) {
  const existing = await db.select().from(customers).where(eq(customers.clerkUserId, userId)).limit(1);
  if (existing[0]) return existing[0];
  const created = await db.insert(customers).values({ clerkUserId: userId }).returning();
  return created[0];
}

async function serializeOrder(orderId: number) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return null;
  const rows = await db.select({
    productId: products.id,
    productName: products.name,
    quantity: orderItems.quantity,
  }).from(orderItems).innerJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, orderId));
  return { id: order.id, status: order.status, message: order.message, createdAt: order.createdAt.toISOString(), items: rows };
}

router.get("/me/profile", requireAuth, async (req, res) => {
  const customer = await getCustomer(req.userId!);
  res.json({
    name: customer.name,
    businessName: customer.businessName,
    phone: customer.phone,
    whatsapp: customer.whatsapp,
    city: customer.city,
    address: customer.address,
  });
});

router.put("/me/profile", requireAuth, async (req, res) => {
  const customer = await getCustomer(req.userId!);
  const body = req.body as Record<string, unknown>;
  const values = {
    name: typeof body.name === "string" ? body.name.trim() : "",
    businessName: typeof body.businessName === "string" ? body.businessName.trim() : "",
    phone: typeof body.phone === "string" ? body.phone.trim() : "",
    whatsapp: typeof body.whatsapp === "string" ? body.whatsapp.trim() : "",
    city: typeof body.city === "string" ? body.city.trim() : "",
    address: typeof body.address === "string" ? body.address.trim() : "",
    updatedAt: new Date(),
  };
  const [updated] = await db.update(customers).set(values).where(eq(customers.id, customer.id)).returning();
  res.json({
    name: updated.name,
    businessName: updated.businessName,
    phone: updated.phone,
    whatsapp: updated.whatsapp,
    city: updated.city,
    address: updated.address,
  });
});

router.get("/me/orders", requireAuth, async (req, res) => {
  const customer = await getCustomer(req.userId!);
  const customerOrders = await db.select().from(orders).where(eq(orders.customerId, customer.id)).orderBy(orders.createdAt);
  const serialized = await Promise.all(customerOrders.map((order) => serializeOrder(order.id)));
  res.json(serialized.filter(Boolean));
});

router.post("/me/enquiries", requireAuth, async (req, res) => {
  await ensureSeeded();
  const customer = await getCustomer(req.userId!);
  const body = req.body as { message?: unknown; items?: unknown };
  const items = Array.isArray(body.items) ? body.items : [];
  const normalized = items
    .map((item) => item as Record<string, unknown>)
    .map((item) => ({ productId: Number(item.productId), quantity: Number(item.quantity) }))
    .filter((item) => Number.isInteger(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0);
  if (!normalized.length) {
    res.status(400).json({ error: "At least one product is required" });
    return;
  }
  const productIds = normalized.map((item) => item.productId);
  const validProducts = await db.select({ id: products.id }).from(products).where(inArray(products.id, productIds));
  const validIds = new Set(validProducts.map((product) => product.id));
  const validItems = normalized.filter((item) => validIds.has(item.productId));
  if (!validItems.length) {
    res.status(400).json({ error: "No valid products were supplied" });
    return;
  }
  const message = typeof body.message === "string" ? body.message.trim() : null;
  const [enquiry] = await db.insert(enquiries).values({ customerId: customer.id, message, status: "NEW" }).returning();
  const [order] = await db.insert(orders).values({ customerId: customer.id, enquiryId: enquiry.id, message, status: "NEW" }).returning();
  await db.insert(orderItems).values(validItems.map((item) => ({ orderId: order.id, productId: item.productId, quantity: item.quantity })));
  res.status(201).json(await serializeOrder(order.id));
});

export { allowedStatuses };
export default router;