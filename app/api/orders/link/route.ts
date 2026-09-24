import { NextResponse } from "next/server";
import { getDB, saveDB, getAsyncOrders } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, currentUserEmail, currentUserPhone, verificationContact } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide a valid Order ID." },
        { status: 400 }
      );
    }

    const cleanOrderId = orderId.trim().toUpperCase().replace(/^#/, "");
    const allOrders = await getAsyncOrders();
    const order = allOrders.find((o) => o.id.toUpperCase() === cleanOrderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: `Order #${cleanOrderId} was not found. Please verify the ID on your invoice.`,
        },
        { status: 404 }
      );
    }

    const orderEmail = (order.email || "").toLowerCase().trim();
    const orderPhone = (order.phone || "").replace(/\D/g, "");

    const userEmail = (currentUserEmail || "").toLowerCase().trim();
    const userPhone = (currentUserPhone || "").replace(/\D/g, "");

    const verifyContact = (verificationContact || "").trim();
    const verifyEmail = verifyContact.toLowerCase();
    const verifyPhone = verifyContact.replace(/\D/g, "");

    // STRICT MULTI-TIER SECURITY CHECK:
    // Prevent unauthorized users (e.g. Pratik) from guessing another customer's (e.g. Shubham's) order.
    let isAuthorized = false;

    // 1. Direct match with logged-in account's email
    if (userEmail && orderEmail && userEmail === orderEmail) {
      isAuthorized = true;
    }

    // 2. Direct match with logged-in account's 10-digit phone
    if (!isAuthorized && userPhone && orderPhone) {
      if (userPhone === orderPhone || orderPhone.endsWith(userPhone) || userPhone.endsWith(orderPhone)) {
        isAuthorized = true;
      }
    }

    // 3. Verification contact provided (if order was placed with alternate guest contact)
    if (!isAuthorized && verifyContact) {
      const emailMatches = verifyEmail && orderEmail && verifyEmail === orderEmail;
      const phoneMatches =
        verifyPhone &&
        orderPhone &&
        (verifyPhone === orderPhone || orderPhone.endsWith(verifyPhone) || verifyPhone.endsWith(orderPhone));

      if (emailMatches || phoneMatches) {
        // Critical defense: If order is already registered to a different user's email,
        // an unauthorized third-party user cannot hijack it even if they know the phone number.
        if (orderEmail && userEmail && orderEmail !== userEmail) {
          return NextResponse.json(
            {
              success: false,
              error: `Security Notice: Order #${cleanOrderId} is associated with another customer identity (${orderEmail}). It cannot be claimed by this account.`,
            },
            { status: 403 }
          );
        }
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: `Security Verification Failed: The mobile number or email provided does not match Order #${cleanOrderId}. You can only link orders that belong to you.`,
        },
        { status: 403 }
      );
    }

    // If order was a guest order without email, attach user's email to it
    if (!order.email && userEmail) {
      if (process.env.DATABASE_URL) {
        try {
          const { prisma } = await import("@/lib/prisma");
          await prisma.order.update({
            where: { id: order.id },
            data: { email: userEmail },
          });
        } catch (err) {
          console.error("Prisma update order email error:", err);
        }
      }

      try {
        const db = getDB();
        const idx = db.orders.findIndex((o) => o.id === order.id);
        if (idx !== -1) {
          db.orders[idx].email = userEmail;
          saveDB(db);
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `Order #${order.id} has been verified and securely linked to your account.`,
      orderId: order.id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server error occurred while linking order: " + String(error) },
      { status: 500 }
    );
  }
}
