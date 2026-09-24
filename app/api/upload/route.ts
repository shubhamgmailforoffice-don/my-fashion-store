import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Try saving to local filesystem (works in local dev environments)
    try {
      const uploadDir = path.join(process.cwd(), "public", "images", "products");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Sanitize filename
      const ext = path.extname(file.name) || ".jpg";
      const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `${baseName}_${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/images/products/${fileName}`;
      return NextResponse.json({ success: true, url: publicUrl });
    } catch {
      // 2. Serverless fallback (e.g. Vercel read-only filesystem EROFS):
      // Return Base64 Data URI directly, which renders seamlessly across the site and stores in DB
      const mimeType = file.type || "image/jpeg";
      const base64Data = buffer.toString("base64");
      const dataUri = `data:${mimeType};base64,${base64Data}`;
      return NextResponse.json({ success: true, url: dataUri });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
