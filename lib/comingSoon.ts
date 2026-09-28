import {
  ComingSoonData,
  ComingSoonCategoryConfig,
  ComingSoonSubscriber,
  defaultComingSoonConfigs,
} from "./comingSoonTypes";

export * from "./comingSoonTypes";

function getComingSoonPath() {
  const path = require("path");
  return path.join(process.cwd(), "data", "coming_soon.json");
}

export function getFallbackComingSoonData(): ComingSoonData {
  try {
    const fs = require("fs");
    const filePath = getComingSoonPath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read coming_soon.json fallback:", err);
  }
  return {
    categories: defaultComingSoonConfigs,
    subscribers: [],
  };
}

export async function getAsyncComingSoonData(): Promise<ComingSoonData> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const record = await prisma.siteConfig.findUnique({
      where: { key: "coming_soon_config" },
    });
    if (record && typeof record.value === "object" && record.value !== null) {
      const val = record.value as any;
      return {
        categories: { ...defaultComingSoonConfigs, ...(val.categories || {}) },
        subscribers: val.subscribers || [],
      };
    }
  } catch (err) {
    console.error("Failed to query coming_soon_config from database, using fallback:", err);
  }
  return getFallbackComingSoonData();
}

export async function saveAsyncComingSoonData(data: ComingSoonData): Promise<boolean> {
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.siteConfig.upsert({
      where: { key: "coming_soon_config" },
      update: { value: data as any },
      create: { key: "coming_soon_config", value: data as any },
    });

    try {
      const fs = require("fs");
      const path = require("path");
      const filePath = getComingSoonPath();
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch {
      // Ignored on read-only serverless environments
    }
    return true;
  } catch (err) {
    console.error("Failed to save coming_soon_config:", err);
    return false;
  }
}
