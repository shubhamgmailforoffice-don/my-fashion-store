import fs from "fs";
import path from "path";
import { Product } from "@/lib/data";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "customer" | "admin";
  createdAt: string;
}

export interface DBData {
  products: Product[];
  orders: Order[];
  users: User[];
}

const dataDir = path.join(process.cwd(), "data");
const dbFilePath = path.join(dataDir, "db.json");

// Initial seed data
const initialProducts: Product[] = [
  {
    id: "1",
    name: "RACING CLUB OVERSIZED T-SHIRT",
    price: 4499,
    originalPrice: 5499,
    images: [
      "/images/products/oversized-tshirt.jpg",
      "/images/products/oversized-tshirt.jpg",
    ],
    category: "Tops",
    subCategory: "T-Shirts",
    colors: ["Black", "Orange"],
    isNew: true,
    isSale: false,
    collectionSlug: "racing-club",
    description:
      "High-octane vintage motorsport inspired graphic oversized tee crafted in 280 GSM heavyweight combed cotton.",
  },
  {
    id: "2",
    name: "BLACK NOCTURNAL HOODIE",
    price: 6999,
    originalPrice: 7999,
    images: [
      "/images/products/black-nocturnal-hoodie.jpg",
      "/images/products/black-nocturnal-hoodie.jpg",
    ],
    category: "Tops",
    subCategory: "Hoodies",
    colors: ["Black"],
    isNew: true,
    isSale: false,
    collectionSlug: "winter-collection",
    description:
      "Signature 420 GSM French Terry heavyweight boxy hoodie with tonal high-density embossed branding.",
  },
  {
    id: "3",
    name: "TACTICAL INDUSTRIAL CARGO PANTS",
    price: 5999,
    originalPrice: 6999,
    images: [
      "/images/products/tactical-cargo-pants.jpg",
      "/images/products/tactical-cargo-pants.jpg",
    ],
    category: "Bottoms",
    subCategory: "Cargo Pants",
    colors: ["Grey", "Black"],
    isNew: true,
    isSale: false,
    collectionSlug: "essentials",
    description:
      "Military ripstop relaxed-fit cargos with modular buckle straps, deep utility pockets, and adjustable ankle toggles.",
  },
  {
    id: "4",
    name: "STAR STUDDED BROWN HOODIE",
    price: 7499,
    originalPrice: 8499,
    images: [
      "/images/products/star-studded-brown-hoodie.jpg",
      "/images/products/star-studded-brown-hoodie.jpg",
    ],
    category: "Tops",
    subCategory: "Hoodies",
    colors: ["Brown", "Orange"],
    isNew: true,
    isSale: true,
    collectionSlug: "winter-collection",
    description:
      "Rich chocolate brown fleece hoodie featuring premium multi-layer chenille star embroidery and tactile puff prints.",
  },
  {
    id: "5",
    name: "BLIND BOX 26 - EXCLUSIVE DROP",
    price: 3999,
    originalPrice: 5999,
    images: [
      "/images/products/black-nocturnal-hoodie.jpg",
      "/images/products/oversized-tshirt.jpg",
    ],
    category: "Special",
    subCategory: "Mystery Box",
    colors: ["Mixed"],
    isBlindBox: true,
    collectionSlug: "blind-box",
    description:
      "Serialized mystery release containing limited sample garments, collectible accessories, and unreleased prints.",
  },
  {
    id: "6",
    name: "HEAVYWEIGHT RAW CUT CARGOS",
    price: 6499,
    originalPrice: 7499,
    images: [
      "/images/products/tactical-cargo-pants.jpg",
      "/images/products/tactical-cargo-pants.jpg",
    ],
    category: "Bottoms",
    subCategory: "Cargo Pants",
    colors: ["Black", "Grey"],
    isNew: false,
    isSale: true,
    collectionSlug: "essentials",
    description:
      "Heavy cotton canvas workwear silhouette with articulated knees, reinforced seams, and custom branded metal rivets.",
  },
];

const initialOrders: Order[] = [
  {
    id: "BLU-9021",
    customerName: "Aman Sharma",
    email: "aman.sharma@example.com",
    phone: "9876543210",
    address: "B-42 Vasant Vihar, New Delhi - 110057",
    items: [
      {
        id: "2",
        name: "BLACK NOCTURNAL HOODIE",
        price: 6999,
        image: "/images/products/black-nocturnal-hoodie.jpg",
        size: "L",
        color: "Black",
        quantity: 1,
      },
    ],
    total: 6999,
    status: "Processing",
    date: "2026-09-21",
  },
  {
    id: "BLU-8842",
    customerName: "Rohan Varma",
    email: "rohan.v@example.com",
    phone: "9820012345",
    address: "Flat 12, Bandra West, Mumbai - 400050",
    items: [
      {
        id: "1",
        name: "RACING CLUB OVERSIZED T-SHIRT",
        price: 4499,
        image: "/images/products/oversized-tshirt.jpg",
        size: "XL",
        color: "Black",
        quantity: 1,
      },
      {
        id: "3",
        name: "TACTICAL INDUSTRIAL CARGO PANTS",
        price: 5999,
        image: "/images/products/tactical-cargo-pants.jpg",
        size: "M",
        color: "Grey",
        quantity: 1,
      },
    ],
    total: 10498,
    status: "Shipped",
    date: "2026-09-20",
  },
];

const initialUsers: User[] = [
  {
    id: "admin-1",
    name: "Admin Manager",
    email: "admin@fashionstore.com",
    phone: "9999999999",
    role: "admin",
    createdAt: "2026-09-01",
  },
];

export function getDB(): DBData {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbFilePath)) {
    const initialData: DBData = {
      products: initialProducts,
      orders: initialOrders,
      users: initialUsers,
    };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }

  try {
    const raw = fs.readFileSync(dbFilePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      products: initialProducts,
      orders: initialOrders,
      users: initialUsers,
    };
  }
}

export function saveDB(data: DBData): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getAsyncProducts(): Promise<Product[]> {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const records = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (records && records.length > 0) {
        return records.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice ?? undefined,
          images: p.images,
          category: p.category as Product["category"],
          subCategory: p.subCategory as Product["subCategory"],
          colors: p.colors,
          sizes: p.sizes,
          inStock: p.inStock,
          isNew: p.isNew,
          isSale: p.isSale,
          isBlindBox: p.isBlindBox,
          collectionSlug: p.collectionSlug,
          description: p.description ?? undefined,
        }));
      }
    } catch {
      // Fallback to local db.json
    }
  }
  return getDB().products;
}

export async function getAsyncProductById(id: string): Promise<Product | undefined> {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const p = await prisma.product.findUnique({ where: { id } });
      if (p) {
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice ?? undefined,
          images: p.images,
          category: p.category as Product["category"],
          subCategory: p.subCategory as Product["subCategory"],
          colors: p.colors,
          sizes: p.sizes,
          inStock: p.inStock,
          isNew: p.isNew,
          isSale: p.isSale,
          isBlindBox: p.isBlindBox,
          collectionSlug: p.collectionSlug,
          description: p.description ?? undefined,
        };
      }
    } catch {
      // Fallback to local db.json
    }
  }
  const db = getDB();
  return db.products.find((p) => p.id === id);
}

export async function getAsyncOrders(): Promise<Order[]> {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const records = await prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
      if (records && records.length > 0) {
        return records.map((o) => ({
          id: o.id,
          customerName: o.customerName,
          email: o.email || "",
          phone: o.phone || "",
          address: o.address,
          total: o.total,
          status: o.status as Order["status"],
          date: o.date,
          items: o.items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            image: i.image,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
        }));
      }
    } catch {
      // Fallback to local db.json
    }
  }
  return getDB().orders;
}

