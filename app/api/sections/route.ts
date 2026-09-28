import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sectionsPath = path.join(process.cwd(), "data", "sections.json");

export async function GET() {
  try {
    if (!fs.existsSync(sectionsPath)) {
      return NextResponse.json([]);
    }
    const raw = fs.readFileSync(sectionsPath, "utf-8");
    const sections = JSON.parse(raw);
    return NextResponse.json(sections, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
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
    fs.writeFileSync(sectionsPath, JSON.stringify(updatedSections, null, 2), "utf-8");
    return NextResponse.json({ success: true, sections: updatedSections });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
