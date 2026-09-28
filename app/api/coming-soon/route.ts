import { NextResponse } from "next/server";
import {
  getAsyncComingSoonData,
  saveAsyncComingSoonData,
  ComingSoonCategoryConfig,
  defaultComingSoonConfigs,
} from "@/lib/comingSoon";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getAsyncComingSoonData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = await getAsyncComingSoonData();

    // 1. Subscribe to VIP drop notifications
    if (body.action === "subscribe") {
      const { category, contact } = body;
      if (!contact || !contact.trim()) {
        return NextResponse.json({ success: false, error: "Email or phone number is required" }, { status: 400 });
      }

      const cleanContact = contact.trim();
      const existing = current.subscribers.find(
        (s) => s.contact.toLowerCase() === cleanContact.toLowerCase() && s.category === category
      );

      if (!existing) {
        current.subscribers.unshift({
          id: "sub_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
          category: category || "All",
          contact: cleanContact,
          createdAt: new Date().toISOString(),
        });
        await saveAsyncComingSoonData(current);
      }

      return NextResponse.json({
        success: true,
        message: "You're on the VIP list! We will notify you before the drop.",
      });
    }

    // 2. Toggle Coming Soon status for a category
    if (body.action === "toggle") {
      const { categoryId, field, value } = body;
      if (!categoryId) {
        return NextResponse.json({ success: false, error: "Missing categoryId" }, { status: 400 });
      }

      if (!current.categories[categoryId]) {
        current.categories[categoryId] = {
          ...(defaultComingSoonConfigs[categoryId] || {
            id: categoryId,
            name: categoryId,
            enabled: false,
            autoWhenEmpty: true,
            title: `${categoryId.toUpperCase()} DROP COMING SOON`,
            subtitle: "NEW CAPSULE COLLECTION IN PRODUCTION",
            description: "We are currently manufacturing pieces for this category. Register below for early VIP access.",
            releaseDate: "COMING SOON",
            bannerImage: "/images/hero-streetwear.jpg",
            badge: "PRODUCTION IN PROGRESS",
          }),
        };
      }

      if (field === "enabled") {
        current.categories[categoryId].enabled = Boolean(value);
      } else if (field === "autoWhenEmpty") {
        current.categories[categoryId].autoWhenEmpty = Boolean(value);
      }

      await saveAsyncComingSoonData(current);
      return NextResponse.json({ success: true, data: current });
    }

    // 3. Update full config for a category
    if (body.action === "update_category") {
      const { config }: { config: ComingSoonCategoryConfig } = body;
      if (!config || !config.id) {
        return NextResponse.json({ success: false, error: "Missing config data" }, { status: 400 });
      }

      current.categories[config.id] = {
        ...(current.categories[config.id] || {}),
        ...config,
      };

      await saveAsyncComingSoonData(current);
      return NextResponse.json({ success: true, data: current });
    }

    // 4. Delete a subscriber lead
    if (body.action === "delete_subscriber") {
      const { subscriberId } = body;
      current.subscribers = current.subscribers.filter((s) => s.id !== subscriberId);
      await saveAsyncComingSoonData(current);
      return NextResponse.json({ success: true, data: current });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Error in /api/coming-soon:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
