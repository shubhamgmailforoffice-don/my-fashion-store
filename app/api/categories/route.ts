import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const categoriesPath = path.join(process.cwd(), "data", "categories.json");

function getCategoriesData() {
  try {
    if (fs.existsSync(categoriesPath)) {
      const raw = fs.readFileSync(categoriesPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading categories:", e);
  }
  return {
    topNavLinks: [],
    accordions: [],
    bottomLinks: [],
  };
}

function saveCategoriesData(data: any) {
  try {
    const dir = path.dirname(categoriesPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(categoriesPath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error saving categories:", e);
    return false;
  }
}

export async function GET() {
  const data = getCategoriesData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = getCategoriesData();

    // Add subcategory to an accordion
    if (body.action === "add_subcategory") {
      const { accordionId, subCategory } = body;
      const acc = current.accordions.find((a: any) => a.id === accordionId);
      if (acc && subCategory && !acc.subCategories.includes(subCategory)) {
        acc.subCategories.push(subCategory);
        saveCategoriesData(current);
        return NextResponse.json({ success: true, data: current });
      }
    }

    // Remove subcategory
    if (body.action === "remove_subcategory") {
      const { accordionId, subCategory } = body;
      const acc = current.accordions.find((a: any) => a.id === accordionId);
      if (acc && subCategory) {
        acc.subCategories = acc.subCategories.filter((s: string) => s !== subCategory);
        saveCategoriesData(current);
        return NextResponse.json({ success: true, data: current });
      }
    }

    // Add new custom category / accordion
    if (body.action === "add_accordion") {
      const { name, id, subCategories } = body;
      const newId = id || name.toLowerCase().replace(/\s+/g, "-");
      if (!current.accordions.some((a: any) => a.id === newId)) {
        current.accordions.push({
          id: newId,
          name,
          subCategories: subCategories || [],
        });
        saveCategoriesData(current);
        return NextResponse.json({ success: true, data: current });
      }
    }

    // Update entire config
    if (body.accordions || body.topNavLinks) {
      saveCategoriesData(body);
      return NextResponse.json({ success: true, data: body });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
