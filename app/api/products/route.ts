import { NextResponse } from "next/server";
import { getDB, saveDB, getAsyncProducts } from "@/lib/store";
import { Product } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeDrafts = searchParams.get("all") === "true" || searchParams.get("admin") === "true";
  let products = await getAsyncProducts();
  if (!includeDrafts) {
    products = products.filter((p) => p.visibleOnSite !== false);
  }
  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body: Partial<Product> = await request.json();
    const db = getDB();

    const newProduct: Product = {
      id: body.id || String(Date.now()),
      name: body.name || "NEW STREETWEAR PIECE",
      price: Number(body.price) || 2999,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      images:
        body.images && body.images.length > 0
          ? body.images.filter(Boolean)
          : ["/images/products/oversized-tshirt.jpg"],
      category: body.category || "Tops",
      subCategory: body.subCategory || "T-Shirts",
      colors: body.colors && body.colors.length > 0 ? body.colors : ["Black"],
      sizes:
        body.sizes && body.sizes.length > 0
          ? body.sizes
          : ["S", "M", "L", "XL", "XXL"],
      inStock: body.inStock ?? true,
      isNew: body.isNew ?? true,
      isSale: body.isSale ?? false,
      isBlindBox: body.isBlindBox ?? false,
      collectionSlug: body.collectionSlug || "essentials",
      description:
        body.description ||
        "Premium heavyweight streetwear garment designed with dropped shoulders and boxy silhouette.",
      stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : 10,
      visibleOnSite: body.visibleOnSite !== undefined ? Boolean(body.visibleOnSite) : true,
    };

    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.product.create({
          data: {
            id: newProduct.id,
            name: newProduct.name,
            price: Math.round(newProduct.price),
            originalPrice: newProduct.originalPrice ? Math.round(newProduct.originalPrice) : null,
            images: newProduct.images,
            category: newProduct.category,
            subCategory: newProduct.subCategory || null,
            colors: newProduct.colors,
            sizes: newProduct.sizes || ["S", "M", "L", "XL", "XXL"],
            inStock: newProduct.inStock ?? true,
            isNew: newProduct.isNew ?? true,
            isSale: newProduct.isSale ?? false,
            isBlindBox: newProduct.isBlindBox ?? false,
            collectionSlug: newProduct.collectionSlug || "essentials",
            description: newProduct.description || null,
            stockQuantity: newProduct.stockQuantity ?? 10,
            visibleOnSite: newProduct.visibleOnSite ?? true,
          },
        });
      } catch (err) {
        console.error("Prisma product create error:", err);
      }
    }

    db.products.unshift(newProduct);
    saveDB(db);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body: Partial<Product> & { id: string } = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    let updatedProduct: Product | null = null;

    // 1. Primary: Update in Neon PostgreSQL via Prisma
    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const existing = await prisma.product.findUnique({
          where: { id: body.id },
        });

        if (existing) {
          const validImages = body.images !== undefined ? body.images.filter(Boolean) : existing.images;
          const updated = await prisma.product.update({
            where: { id: body.id },
            data: {
              name: body.name !== undefined ? body.name : existing.name,
              price: body.price !== undefined ? Math.round(Number(body.price)) : existing.price,
              originalPrice:
                body.originalPrice !== undefined
                  ? body.originalPrice
                    ? Math.round(Number(body.originalPrice))
                    : null
                  : existing.originalPrice,
              images: validImages.length > 0 ? validImages : existing.images,
              category: body.category !== undefined ? body.category : existing.category,
              subCategory: body.subCategory !== undefined ? body.subCategory : existing.subCategory,
              colors: body.colors !== undefined ? body.colors : existing.colors,
              sizes: body.sizes !== undefined ? body.sizes : existing.sizes,
              inStock: body.inStock !== undefined ? body.inStock : existing.inStock,
              isNew: body.isNew !== undefined ? body.isNew : existing.isNew,
              isSale: body.isSale !== undefined ? body.isSale : existing.isSale,
              isBlindBox: body.isBlindBox !== undefined ? body.isBlindBox : existing.isBlindBox,
              collectionSlug: body.collectionSlug !== undefined ? body.collectionSlug : existing.collectionSlug,
              description: body.description !== undefined ? body.description : existing.description,
              stockQuantity:
                body.stockQuantity !== undefined
                  ? Number(body.stockQuantity)
                  : existing.stockQuantity ?? 10,
              visibleOnSite:
                body.visibleOnSite !== undefined ? Boolean(body.visibleOnSite) : existing.visibleOnSite,
            },
          });

          updatedProduct = {
            id: updated.id,
            name: updated.name,
            price: updated.price,
            originalPrice: updated.originalPrice ?? undefined,
            images: updated.images,
            category: updated.category as any,
            subCategory: updated.subCategory as any,
            colors: updated.colors,
            sizes: updated.sizes,
            inStock: updated.inStock,
            isNew: updated.isNew,
            isSale: updated.isSale,
            isBlindBox: updated.isBlindBox,
            collectionSlug: updated.collectionSlug,
            description: updated.description ?? undefined,
            stockQuantity: updated.stockQuantity ?? 10,
            visibleOnSite: updated.visibleOnSite,
          };
        }
      } catch (err) {
        console.error("Prisma product update error:", err);
      }
    }

    // 2. Secondary: Synchronize local db.json if present
    try {
      const db = getDB();
      const index = db.products.findIndex((p) => p.id === body.id);
      if (index !== -1) {
        const p = db.products[index];
        const next: Product = {
          ...p,
          ...body,
          inStock: body.inStock !== undefined ? body.inStock : p.inStock ?? true,
          sizes: body.sizes !== undefined ? body.sizes : p.sizes ?? ["S", "M", "L", "XL", "XXL"],
          images: body.images !== undefined ? body.images.filter(Boolean) : p.images,
          price: Number(body.price ?? p.price),
          originalPrice:
            body.originalPrice !== undefined
              ? body.originalPrice
                ? Number(body.originalPrice)
                : undefined
              : p.originalPrice,
          stockQuantity:
            body.stockQuantity !== undefined ? Number(body.stockQuantity) : p.stockQuantity ?? 10,
          visibleOnSite:
            body.visibleOnSite !== undefined ? Boolean(body.visibleOnSite) : p.visibleOnSite ?? true,
        };
        db.products[index] = next;
        saveDB(db);
        if (!updatedProduct) updatedProduct = next;
      }
    } catch {}

    if (updatedProduct) {
      return NextResponse.json({ success: true, product: updatedProduct });
    }

    return NextResponse.json(
      { success: false, error: "Product not found" },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // 1. Delete from PostgreSQL database via Prisma
    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.product.deleteMany({
          where: { id },
        });
      } catch (err) {
        console.error("Prisma product delete error:", err);
      }
    }

    // 2. Also remove from local db.json if present
    try {
      const db = getDB();
      db.products = db.products.filter((p) => p.id !== id);
      saveDB(db);
    } catch {}

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 400 }
    );
  }
}

