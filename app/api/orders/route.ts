import { NextResponse } from "next/server";
import { getDB, saveDB, getAsyncOrders, Order } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const orders = await getAsyncOrders();
  return NextResponse.json(orders, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDB();

    const newOrder: Order = {
      id: `FS-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: body.customerName || "Valued Customer",
      email: body.email || "customer@example.com",
      phone: body.phone || "9876543210",
      address: body.address || "123 Fashion Ave, New Delhi",
      items: body.items || [],
      total: Number(body.total) || 0,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    };

    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.order.create({
          data: {
            id: newOrder.id,
            customerName: newOrder.customerName,
            email: newOrder.email || null,
            phone: newOrder.phone || null,
            address: newOrder.address,
            total: Math.round(newOrder.total),
            status: newOrder.status,
            date: newOrder.date,
            items: {
              create: newOrder.items.map((item) => ({
                name: item.name,
                price: Math.round(item.price),
                image: item.image,
                size: item.size,
                color: item.color,
                quantity: Number(item.quantity) || 1,
              })),
            },
          },
        });
      } catch (err) {
        console.error("Prisma order create error:", err);
      }
    }

    try {
      db.orders.unshift(newOrder);
      saveDB(db);
    } catch {
      // Ignore local file error on read-only environments
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, tracking } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const allOrders = await getAsyncOrders();
    const existingOrder = allOrders.find((o) => o.id === id);

    let updatedAddress: string | undefined = undefined;
    if (typeof tracking === "string") {
      const currentAddress = existingOrder?.address || "";
      const baseAddress = currentAddress.replace(/\[Tracking:.*?\]/i, "").trim();
      updatedAddress = tracking.trim() ? `${baseAddress} [Tracking: ${tracking.trim()}]` : baseAddress;
    }

    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const updateData: { status?: string; address?: string } = {};
        if (status) updateData.status = status;
        if (updatedAddress !== undefined) updateData.address = updatedAddress;

        await prisma.order.update({
          where: { id },
          data: updateData,
        });
      } catch (err) {
        console.error("Prisma order update error:", err);
      }
    }

    const db = getDB();
    const orderIndex = db.orders.findIndex((o) => o.id === id);

    if (orderIndex !== -1) {
      if (status) db.orders[orderIndex].status = status;
      if (updatedAddress !== undefined) db.orders[orderIndex].address = updatedAddress;
      saveDB(db);
    }

    return NextResponse.json({
      success: true,
      order: orderIndex !== -1 ? db.orders[orderIndex] : { id, status, address: updatedAddress },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 400 }
    );
  }
}

