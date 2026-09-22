import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/store";
import { Product } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const db = getDB();
  return NextResponse.json(db.products, {
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

    db.products[index] = {
      ...db.products[index],
      ...body,
      inStock: body.inStock !== undefined ? body.inStock : db.products[index].inStock ?? true,
      sizes: body.sizes !== undefined ? body.sizes : db.products[index].sizes ?? ["S", "M", "L", "XL", "XXL"],
      price: Number(body.price ?? db.products[index].price),
      originalPrice: body.originalPrice
        ? Number(body.originalPrice)
        : db.products[index].originalPrice,
    };

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
