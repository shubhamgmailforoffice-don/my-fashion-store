import fs from "fs";
import path from "path";
import { ReelItem, defaultReels } from "@/lib/reelsTypes";

export type { ReelItem };
export { defaultReels };

const reelsPath = path.join(process.cwd(), "data", "reels.json");

export function getFallbackReels(): ReelItem[] {
  try {
    if (fs.existsSync(reelsPath)) {
      const raw = fs.readFileSync(reelsPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading reels.json fallback:", err);
  }
  return defaultReels;
}

export async function getAsyncReels(): Promise<ReelItem[]> {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const record = await prisma.siteConfig.findUnique({
        where: { key: "storefront_reels" },
      });
      if (record && Array.isArray(record.value) && record.value.length > 0) {
        return record.value as unknown as ReelItem[];
      }
    } catch (err) {
      console.error("Error reading reels from DB:", err);
    }
  }
  return getFallbackReels();
}

export async function saveAsyncReels(reels: ReelItem[]): Promise<boolean> {
  // 1. Write to local file fallback
  try {
    const dir = path.dirname(reelsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(reelsPath, JSON.stringify(reels, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing reels.json:", err);
  }

  // 2. Persist to Neon DB
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.siteConfig.upsert({
        where: { key: "storefront_reels" },
        update: { value: reels as any },
        create: { key: "storefront_reels", value: reels as any },
      });
      return true;
    } catch (err) {
      console.error("Error saving reels to DB:", err);
    }
  }

  return true;
}
