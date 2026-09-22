const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const dbPath = path.join(__dirname, "..", "data", "db.json");
  if (!fs.existsSync(dbPath)) {
    console.log("No data/db.json found to seed.");
    return;
  }

  const raw = fs.readFileSync(dbPath, "utf-8");
  const data = JSON.parse(raw);

  console.log(`Starting migration to PostgreSQL database...`);

  // Seed Products
  for (const p of data.products || []) {
    await prisma.product.upsert({
      where: { id: String(p.id) },
      update: {
        name: p.name,
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        images: p.images || [],
        category: p.category,
        subCategory: p.subCategory || null,
        colors: p.colors || [],
        sizes: p.sizes || ["S", "M", "L", "XL", "XXL"],
        inStock: p.inStock ?? true,
        isNew: p.isNew ?? true,
        isSale: p.isSale ?? false,
        isBlindBox: p.isBlindBox ?? false,
        collectionSlug: p.collectionSlug || "essentials",
        description: p.description || "",
      },
      create: {
        id: String(p.id),
        name: p.name,
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        images: p.images || [],
        category: p.category,
        subCategory: p.subCategory || null,
        colors: p.colors || [],
        sizes: p.sizes || ["S", "M", "L", "XL", "XXL"],
        inStock: p.inStock ?? true,
        isNew: p.isNew ?? true,
        isSale: p.isSale ?? false,
        isBlindBox: p.isBlindBox ?? false,
        collectionSlug: p.collectionSlug || "essentials",
        description: p.description || "",
      },
    });
  }

  console.log(`✓ Seeded ${data.products?.length || 0} products into PostgreSQL.`);

  // Seed Orders
  for (const o of data.orders || []) {
    await prisma.order.upsert({
      where: { id: String(o.id) },
      update: {
        customerName: o.customerName,
        email: o.email || null,
        phone: o.phone || null,
        address: o.address,
        total: Math.round(o.total),
        status: o.status,
        date: o.date,
      },
      create: {
        id: String(o.id),
        customerName: o.customerName,
        email: o.email || null,
        phone: o.phone || null,
        address: o.address,
        total: Math.round(o.total),
        status: o.status,
        date: o.date,
        items: {
          create: (o.items || []).map((i) => ({
            name: i.name,
            price: Math.round(i.price),
            image: i.image,
            size: i.size,
            color: i.color,
            quantity: Number(i.quantity) || 1,
          })),
        },
      },
    });
  }
  console.log(`✓ Seeded ${data.orders?.length || 0} orders into PostgreSQL.`);

  // Seed Users
  for (const u of data.users || []) {
    await prisma.user.upsert({
      where: { id: String(u.id) },
      update: {
        name: u.name,
        email: u.email || null,
        phone: u.phone || null,
        role: u.role || "customer",
        createdAt: u.createdAt || new Date().toISOString().split("T")[0],
      },
      create: {
        id: String(u.id),
        name: u.name,
        email: u.email || null,
        phone: u.phone || null,
        role: u.role || "customer",
        createdAt: u.createdAt || new Date().toISOString().split("T")[0],
      },
    });
  }

  console.log(`✓ Seeded ${data.users?.length || 0} users into PostgreSQL.`);
  console.log("PostgreSQL Database is ready and synchronized!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
