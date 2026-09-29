import { NextResponse } from "next/server";
import { getAsyncReels, saveAsyncReels, ReelItem } from "@/lib/reels";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const reels = await getAsyncReels();
    return NextResponse.json(reels, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    console.error("GET /api/reels error:", err);
    return NextResponse.json({ error: "Failed to fetch reels" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Payload must be an array of ReelItem" },
        { status: 400 }
      );
    }

    const updatedReels: ReelItem[] = body.map((r, idx) => ({
      id: r.id || `reel-${Date.now()}-${idx}`,
      name: String(r.name || "UNTITLED REEL").toUpperCase(),
      price: Number(r.price) || 0,
      image: String(r.image || "/images/hero-streetwear.jpg"),
      productId: String(r.productId || "1"),
      active: r.active !== false,
    }));

    await saveAsyncReels(updatedReels);

    return NextResponse.json({ success: true, reels: updatedReels });
  } catch (err) {
    console.error("POST /api/reels error:", err);
    return NextResponse.json({ error: "Failed to save reels" }, { status: 500 });
  }
}
