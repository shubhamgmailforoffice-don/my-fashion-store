import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const categoriesPath = path.join(process.cwd(), "data", "categories.json");

function getFallbackCategoriesData() {
  try {
    if (fs.existsSync(categoriesPath)) {
      const raw = fs.readFileSync(categoriesPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading categories fallback:", e);
  }
  return {
    topNavLinks: [],
    accordions: [],
    bottomLinks: [],
  };
}

async function getCategoriesData() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const record = await prisma.siteConfig.findUnique({
      where: { key: "categories_menu" },
    });
    if (record && typeof record.value === "object" && record.value !== null) {
      return record.value as any;
    }
  } catch (err) {
    console.error("Database read error for categories_menu:", err);
  }
  return getFallbackCategoriesData();
}

async function saveCategoriesData(data: any) {
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.siteConfig.upsert({
      where: { key: "categories_menu" },
      update: { value: data },
      create: { key: "categories_menu", value: data },
    });

    try {
      const dir = path.dirname(categoriesPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(categoriesPath, JSON.stringify(data, null, 2), "utf-8");
    } catch {
      // Ignored on read-only serverless filesystems
    }
    return true;
  } catch (e) {
    console.error("Error saving categories to database:", e);
    return false;
  }
}

export async function GET() {
  const data = await getCategoriesData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = await getCategoriesData();

    // Add subcategory to an accordion
    if (body.action === "add_subcategory") {
      const { accordionId, subCategory } = body;
      const acc = current.accordions?.find((a: any) => a.id === accordionId);
      if (acc && subCategory && !acc.subCategories?.includes(subCategory)) {
        if (!acc.subCategories) acc.subCategories = [];
        acc.subCategories.push(subCategory);
        await saveCategoriesData(current);
        return NextResponse.json({ success: true, data: current });
      }
    }

    // Remove subcategory
    if (body.action === "remove_subcategory") {
      const { accordionId, subCategory } = body;
      const acc = current.accordions?.find((a: any) => a.id === accordionId);
      if (acc && subCategory && acc.subCategories) {
        acc.subCategories = acc.subCategories.filter((s: string) => s !== subCategory);
        await saveCategoriesData(current);
        return NextResponse.json({ success: true, data: current });
      }
    }

    // Add new custom category / accordion
    if (body.action === "add_accordion") {
      const { name, id, subCategories } = body;
      const newId = id || name.toLowerCase().replace(/\s+/g, "-");
      if (!current.accordions) current.accordions = [];
      if (!current.accordions.some((a: any) => a.id === newId)) {
        current.accordions.push({
          id: newId,
          name,
          subCategories: subCategories || [],
        });
        await saveCategoriesData(current);
        return NextResponse.json({ success: true, data: current });
      }
    }

    // Update entire config
    if (body.accordions || body.topNavLinks) {
      await saveCategoriesData(body);
      return NextResponse.json({ success: true, data: body });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
