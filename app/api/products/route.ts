import { NextResponse } from "next/server";
import { getDB, saveDB, getAsyncProducts } from "@/lib/store";
import { Product } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const products = await getAsyncProducts();
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
          ? body.images
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

    const db = getDB();
    const index = db.products.findIndex((p) => p.id === body.id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const updatedProduct: Product = {
      ...db.products[index],
      ...body,
      inStock: body.inStock !== undefined ? body.inStock : db.products[index].inStock ?? true,
      sizes: body.sizes !== undefined ? body.sizes : db.products[index].sizes ?? ["S", "M", "L", "XL", "XXL"],
      price: Number(body.price ?? db.products[index].price),
      originalPrice: body.originalPrice
        ? Number(body.originalPrice)
        : db.products[index].originalPrice,
    };

    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.product.update({
          where: { id: body.id },
          data: {
            name: updatedProduct.name,
            price: Math.round(updatedProduct.price),
            originalPrice: updatedProduct.originalPrice ? Math.round(updatedProduct.originalPrice) : null,
            images: updatedProduct.images,
            category: updatedProduct.category,
            subCategory: updatedProduct.subCategory || null,
            colors: updatedProduct.colors,
            sizes: updatedProduct.sizes || ["S", "M", "L", "XL", "XXL"],
            inStock: updatedProduct.inStock ?? true,
            isNew: updatedProduct.isNew ?? true,
            isSale: updatedProduct.isSale ?? false,
            isBlindBox: updatedProduct.isBlindBox ?? false,
            collectionSlug: updatedProduct.collectionSlug || "essentials",
            description: updatedProduct.description || null,
          },
        });
      } catch (err) {
        console.error("Prisma product update error:", err);
      }
    }

    db.products[index] = updatedProduct;
    saveDB(db);
    return NextResponse.json({ success: true, product: db.products[index] });
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

    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.product.delete({
          where: { id },
        });
      } catch (err) {
        console.error("Prisma product delete error:", err);
      }
    }

    const db = getDB();
    db.products = db.products.filter((p) => p.id !== id);
    saveDB(db);

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 400 }
    );
  }
}

