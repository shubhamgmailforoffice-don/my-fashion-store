import { NextResponse } from "next/server";
import { getDB, saveDB, Order } from "@/lib/store";

export async function GET() {
  const db = getDB();
  return NextResponse.json(db.orders);
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

    db.orders.unshift(newOrder);
    saveDB(db);

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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const db = getDB();
    const orderIndex = db.orders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    db.orders[orderIndex].status = status;
    saveDB(db);

    return NextResponse.json({ success: true, order: db.orders[orderIndex] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 400 }
    );
  }
}
