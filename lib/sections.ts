import fs from "fs";
import path from "path";

export interface HomepageSection {
  id: string;
  title: string;
  subtitle?: string;
  enabled: boolean;
  type: "grid" | "carousel" | "lookbook" | "banner";
  actionButton?: {
    label: string;
    href: string;
    theme?: "light" | "dark";
  };
  productIds?: string[];
  featuredBag?: {
    title: string;
    subtitle: string;
    image: string;
    buttonText: string;
    href: string;
  };
  items?: Array<{
    title: string;
    tag: string;
    image: string;
    link: string;
  }>;
}

const defaultSections: HomepageSection[] = [
  {
    id: "latest-drop",
    title: "Latest drop",
    subtitle: "Limited Seasonal Drops",
    enabled: true,
    type: "grid",
    actionButton: {
      label: "Discover more",
      href: "/shop",
    },
    productIds: ["101", "102", "103", "104"],
  },
  {
    id: "bags-showcase",
    title: "DRIIVN Bags",
    subtitle: "Architectural Leather Atelier",
    enabled: true,
    type: "carousel",
    actionButton: {
      label: "Discover more",
      href: "/shop?category=Accessories",
    },
    productIds: ["107", "108", "109"],
    featuredBag: {
      title: "Bags",
      subtitle: "Full-Grain Architectural Leather Series",
      image: "/images/leather-backpack.jpg",
      buttonText: "Explore Atelier",
      href: "/shop?category=Accessories",
    },
  },
  {
    id: "headwear-layering",
    title: "Headwear & Layering",
    subtitle: "Editorial Showcase",
    enabled: true,
    type: "lookbook",
    actionButton: {
      label: "View Concepts",
      href: "/collections",
    },
    items: [
      {
        title: "Tactical Winter Cap",
        tag: "Look 01",
        image: "/images/streetwear-model-cap.jpg",
        link: "/shop",
      },
      {
        title: "Sherpa Aviator Hood",
        tag: "Look 02",
        image: "/images/streetwear-model-2.jpg",
        link: "/shop",
      },
    ],
  },
];

export function getSections(): HomepageSection[] {
  try {
    const sectionsPath = path.join(process.cwd(), "data", "sections.json");
    if (!fs.existsSync(sectionsPath)) {
      return defaultSections;
    }
    const raw = fs.readFileSync(sectionsPath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read sections.json, using defaults:", err);
    return defaultSections;
  }
}

export async function getAsyncSections(): Promise<HomepageSection[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const record = await prisma.siteConfig.findUnique({
      where: { key: "storefront_sections" },
    });
    if (record && Array.isArray(record.value)) {
      return record.value as unknown as HomepageSection[];
    }
  } catch (err) {
    console.error("Failed to query sections from database, using fallback:", err);
  }
  return getSections();
}
