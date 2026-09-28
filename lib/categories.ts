export interface AdminCategory {
  id: string; // e.g. "Tops", "Bottoms", "Accessories", "Special", or custom
  rawId: string; // original accordion id e.g. "top", "bottom"
  name: string; // display name e.g. "Tops & Hoodies"
  subCategories: string[];
}

export const DEFAULT_ADMIN_CATEGORIES: AdminCategory[] = [
  {
    id: "Tops",
    rawId: "top",
    name: "Tops & Hoodies",
    subCategories: ["T-shirts", "Polos", "Shirts", "Sweatshirts", "Hoodies", "Jacket", "T-Shirts"],
  },
  {
    id: "Bottoms",
    rawId: "bottom",
    name: "Bottoms & Pants",
    subCategories: ["Cargos", "Jeans", "Pants", "Shorts"],
  },
  {
    id: "Accessories",
    rawId: "accessories",
    name: "Accessories",
    subCategories: ["Bags", "Wallets", "Caps", "Socks"],
  },
  {
    id: "Special",
    rawId: "special",
    name: "Special / Limited",
    subCategories: ["Mystery Box", "Archive Edition", "Speedway Drop"],
  },
];

export function parseCategoriesData(apiData: any): AdminCategory[] {
  if (!apiData || !Array.isArray(apiData.accordions)) {
    return DEFAULT_ADMIN_CATEGORIES;
  }

  const result: AdminCategory[] = [];
  const handled = new Set<string>();

  for (const acc of apiData.accordions) {
    if (!acc || acc.type === "color" || (acc.links && !acc.subCategories)) {
      continue;
    }

    const rawId = acc.id || "";
    const lowerId = rawId.toLowerCase();
    const lowerName = (acc.name || "").toLowerCase();

    let id = acc.name || acc.id || "Category";
    let name = acc.name || acc.id || "Category";

    if (lowerId === "top" || lowerId === "tops" || lowerName.includes("top")) {
      id = "Tops";
      name = acc.name && acc.name.length > 3 ? acc.name : "Tops & Hoodies";
    } else if (lowerId === "bottom" || lowerId === "bottoms" || lowerName.includes("bottom")) {
      id = "Bottoms";
      name = acc.name && acc.name.length > 3 ? acc.name : "Bottoms & Pants";
    } else if (lowerId === "accessories" || lowerName.includes("accessories")) {
      id = "Accessories";
      name = acc.name || "Accessories";
    }

    // Deduplicate and filter subcategories
    const subs: string[] = [];
    if (Array.isArray(acc.subCategories)) {
      for (const s of acc.subCategories) {
        if (typeof s === "string" && s.trim()) {
          const trimmed = s.trim();
          if (!subs.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
            subs.push(trimmed);
          }
        }
      }
    }

    result.push({
      id,
      rawId,
      name,
      subCategories: subs,
    });
    handled.add(id.toLowerCase());
  }

  // Ensure default core categories always exist
  for (const def of DEFAULT_ADMIN_CATEGORIES) {
    const existing = result.find((r) => r.id.toLowerCase() === def.id.toLowerCase());
    if (!existing) {
      result.push(def);
    } else {
      // Merge any missing default subcategories
      for (const defSub of def.subCategories) {
        if (!existing.subCategories.some((s) => s.toLowerCase() === defSub.toLowerCase())) {
          existing.subCategories.push(defSub);
        }
      }
    }
  }

  return result;
}
