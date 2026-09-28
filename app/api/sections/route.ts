import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sectionsPath = path.join(process.cwd(), "data", "sections.json");

function getFallbackSections() {
  try {
    if (fs.existsSync(sectionsPath)) {
      const raw = fs.readFileSync(sectionsPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading sections.json fallback:", err);
  }
  return [];
}

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const record = await prisma.siteConfig.findUnique({
      where: { key: "storefront_sections" },
    });

    if (record && Array.isArray(record.value)) {
      return NextResponse.json(record.value, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    const fallback = getFallbackSections();
    return NextResponse.json(fallback, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    console.error("GET /api/sections database error:", err);
    const fallback = getFallbackSections();
    return NextResponse.json(fallback);
  }
}

export async function POST(request: Request) {
  try {
    const updatedSections = await request.json();
    if (!Array.isArray(updatedSections)) {
      return NextResponse.json(
        { error: "Sections payload must be an array" },
        { status: 400 }
      );
    }

    // 1. Persist to Neon PostgreSQL
    const { prisma } = await import("@/lib/prisma");
    await prisma.siteConfig.upsert({
      where: { key: "storefront_sections" },
      update: { value: updatedSections },
      create: { key: "storefront_sections", value: updatedSections },
    });

    // 2. Best-effort write to local filesystem (ignored if on read-only serverless like Vercel)
    try {
      const dir = path.dirname(sectionsPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(sectionsPath, JSON.stringify(updatedSections, null, 2), "utf-8");
    } catch {
      // Intentionally ignored in read-only environments
    }

    return NextResponse.json({ success: true, sections: updatedSections });
  } catch (err) {
    console.error("POST /api/sections error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
