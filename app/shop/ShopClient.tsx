"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { colors, Product } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { ComingSoonData, ComingSoonCategoryConfig, defaultComingSoonConfigs } from "@/lib/comingSoonTypes";
import ComingSoonView from "@/components/ComingSoonView";

interface ShopClientProps {
  initialProducts: Product[];
  initialComingSoon?: ComingSoonData;
}

function ShopContent({ initialProducts, initialComingSoon }: ShopClientProps) {
  const searchParams = useSearchParams();
  const paramCat = searchParams.get("category");
  const paramSub = searchParams.get("subCategory");
  const initialCategory = paramSub || paramCat || "View all";
  const initialColor = searchParams.get("color") || "All";

  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [comingSoonData, setComingSoonData] = useState<ComingSoonData>(
    initialComingSoon || { categories: defaultComingSoonConfigs, subscribers: [] }
  );
  const [selectedPill, setSelectedPill] = useState(initialCategory);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [sortBy, setSortBy] = useState("default");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterPills, setFilterPills] = useState<string[]>([
    "View all",
    "T-shirts",
    "Jackets",
    "Shirts",
    "Sweatshirt",
    "Hoodies",
    "Bottoms",
    "Accessories",
  ]);

  // Sync categories and subcategories from backend
  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.accordions)) {
          const pills = ["View all"];
          const seen = new Set(["view all"]);
          for (const acc of data.accordions) {
            if (acc.subCategories && Array.isArray(acc.subCategories)) {
              for (const sub of acc.subCategories) {
                const s = sub.trim();
                const sLower = s.toLowerCase();
                if (!seen.has(sLower)) {
                  seen.add(sLower);
                  pills.push(s);
                }
              }
            }
          }
          for (const acc of data.accordions) {
            const accName = (acc.name || "").trim();
            if (accName && !seen.has(accName.toLowerCase()) && acc.type !== "color" && !acc.links) {
              seen.add(accName.toLowerCase());
              pills.push(accName);
            }
          }
          if (pills.length > 1) {
            setFilterPills(pills);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Sync coming soon data from live backend
  useEffect(() => {
    fetch("/api/coming-soon", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d && d.categories) setComingSoonData(d);
      })
      .catch(() => {});
  }, []);

  // Sync with live backend database
  useEffect(() => {
    let isMounted = true;
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProductsList(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen to URL searchParams changes immediately (e.g. mobile drawer navigation)
  useEffect(() => {
    const currentSub = searchParams.get("subCategory");
    const currentCat = searchParams.get("category");
    const currentColor = searchParams.get("color");

    if (currentSub) {
      const matched = filterPills.find((p) => p.toLowerCase() === currentSub.toLowerCase()) || currentSub;
      setSelectedPill(matched);
    } else if (currentCat) {
      const matched = filterPills.find((p) => p.toLowerCase() === currentCat.toLowerCase()) || currentCat;
      setSelectedPill(matched);
    } else {
      setSelectedPill("View all");
    }

    if (currentColor) {
      setSelectedColor(currentColor);
    }
  }, [searchParams, filterPills]);

  // Handle category pill click with smooth URL updating
  const handlePillClick = (pill: string) => {
    setSelectedPill(pill);
    try {
      const url = new URL(window.location.href);
      if (pill === "View all") {
        url.searchParams.delete("category");
        url.searchParams.delete("subCategory");
      } else {
        const lower = pill.toLowerCase();
        if (lower === "tops" || lower === "bottoms" || lower === "accessories" || lower === "special") {
          url.searchParams.set("category", pill);
          url.searchParams.delete("subCategory");
        } else {
          url.searchParams.set("subCategory", pill);
          url.searchParams.delete("category");
        }
      }
      window.history.pushState({}, "", url.toString());
    } catch {}
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      // Category / SubCategory matching
      let matchesCategory = true;
      if (selectedPill && selectedPill !== "View all") {
        const pLower = selectedPill.trim().toLowerCase();
        const catLower = (product.category || "").trim().toLowerCase();
        const subLower = (product.subCategory || "").trim().toLowerCase();
        const nameLower = (product.name || "").trim().toLowerCase();

        // 1. T-Shirts / T-shirt filter (Must NOT match hoodies, sweatshirts, or jackets)
        if (pLower === "t-shirts" || pLower === "t-shirt" || pLower === "tshirt" || pLower === "tshirts") {
          if (subLower.includes("hoodie") || subLower.includes("jacket") || subLower.includes("sweatshirt")) {
            matchesCategory = false;
          } else {
            matchesCategory =
              subLower.includes("t-shirt") ||
              subLower.includes("tshirt") ||
              subLower === "t-shirts" ||
              (!subLower && (nameLower.includes("t-shirt") || nameLower.includes("tshirt") || nameLower.includes("tee")));
          }
        }
        // 2. Hoodies filter
        else if (pLower === "hoodies" || pLower === "hoodie") {
          matchesCategory = subLower.includes("hoodie") || (!subLower && nameLower.includes("hoodie"));
        }
        // 3. Shirts filter (Button-down shirts / collared shirts - NOT t-shirts or sweatshirts)
        else if (pLower === "shirts" || pLower === "shirt") {
          if (subLower.includes("t-shirt") || subLower.includes("tshirt") || subLower.includes("sweatshirt")) {
            matchesCategory = false;
          } else {
            matchesCategory =
              subLower.includes("shirt") ||
              (!subLower && nameLower.includes("shirt") && !nameLower.includes("t-shirt") && !nameLower.includes("tshirt"));
          }
        }
        // 4. Sweatshirts filter
        else if (pLower === "sweatshirt" || pLower === "sweatshirts") {
          matchesCategory = subLower.includes("sweatshirt") || (!subLower && nameLower.includes("sweatshirt"));
        }
        // 5. Jackets filter
        else if (pLower === "jackets" || pLower === "jacket") {
          matchesCategory = subLower.includes("jacket") || (!subLower && nameLower.includes("jacket"));
        }
        // 6. Polos filter
        else if (pLower === "polos" || pLower === "polo") {
          matchesCategory = subLower.includes("polo") || (!subLower && nameLower.includes("polo"));
        }
        // 7. Cargos filter
        else if (pLower === "cargos" || pLower === "cargo") {
          matchesCategory = subLower.includes("cargo") || (!subLower && nameLower.includes("cargo"));
        }
        // 8. Jeans filter
        else if (pLower === "jeans" || pLower === "denim") {
          matchesCategory =
            subLower.includes("jean") ||
            subLower.includes("denim") ||
            (!subLower && (nameLower.includes("jean") || nameLower.includes("denim")));
        }
        // 9. Pants filter
        else if (pLower === "pants" || pLower === "joggers" || pLower === "trackpants") {
          matchesCategory =
            subLower.includes("pant") ||
            subLower.includes("jogger") ||
            subLower.includes("trackpant") ||
            (!subLower && (nameLower.includes("pant") || nameLower.includes("jogger")));
        }
        // 10. Shorts filter
        else if (pLower === "shorts" || pLower === "short") {
          matchesCategory = subLower.includes("short") || (!subLower && nameLower.includes("short"));
        }
        // 11. Top-level categories: "Tops", "Bottoms", "Accessories", "Special"
        else if (pLower === "tops" || pLower === "top") {
          matchesCategory = catLower === "tops" || catLower === "top";
        } else if (pLower === "bottoms" || pLower === "bottom") {
          matchesCategory = catLower === "bottoms" || catLower === "bottom";
        } else if (pLower === "accessories") {
          matchesCategory = catLower === "accessories";
        } else if (pLower === "special") {
          matchesCategory = catLower === "special";
        }
        // 12. Generic / Custom subcategories or categories
        else {
          matchesCategory =
            subLower === pLower ||
            subLower.includes(pLower) ||
            pLower.includes(subLower) ||
            catLower === pLower ||
            nameLower.includes(pLower);
        }
      }

      // Color matching
      const matchesColor =
        selectedColor === "All" ||
        product.colors.some(
          (c) => c.toLowerCase() === selectedColor.toLowerCase()
        );

      // In stock only filter
      const matchesStock = inStockOnly ? product.inStock !== false : true;

      return matchesCategory && matchesColor && matchesStock;
    });
  }, [productsList, selectedPill, selectedColor, inStockOnly]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "price-asc") {
        return a.price - b.price;
      }
      if (sortBy === "price-desc") {
        return b.price - a.price;
      }
      if (sortBy === "newest") {
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      }
      return 0; // default order
    });
  }, [filteredProducts, sortBy]);

  // Check if active category has Coming Soon enabled or 0 products with autoWhenEmpty
  const activeComingSoonConfig = useMemo<ComingSoonCategoryConfig | null>(() => {
    if (selectedPill === "View all") return null;

    const pLower = selectedPill.toLowerCase();
    const categoriesList = Object.values(comingSoonData?.categories || defaultComingSoonConfigs);

    // Direct match by ID or Name
    let matched = categoriesList.find(
      (c) => c.id.toLowerCase() === pLower || c.name.toLowerCase() === pLower
    );

    // Fallback mapping based on typical subcategories
    if (!matched) {
      if (["t-shirts", "hoodies", "sweatshirt", "jackets", "shirts", "polos", "top", "tops"].includes(pLower)) {
        matched = categoriesList.find((c) => c.id.toLowerCase() === "tops" || c.name.toLowerCase().includes("top"));
      } else if (["bottoms", "bottom", "cargos", "jeans", "pants", "shorts", "trackpants", "joggers"].includes(pLower)) {
        matched = categoriesList.find((c) => c.id.toLowerCase() === "bottoms" || c.name.toLowerCase().includes("bottom"));
      } else if (["accessories", "bags", "wallets", "caps", "socks"].includes(pLower)) {
        matched = categoriesList.find((c) => c.id.toLowerCase() === "accessories" || c.name.toLowerCase().includes("accessories"));
      } else if (["special", "archive", "drops"].includes(pLower)) {
        matched = categoriesList.find((c) => c.id.toLowerCase() === "special");
      }
    }

    if (!matched) return null;

    // 1. Manually enabled by admin
    if (matched.enabled) return matched;

    // 2. Auto-enabled when empty and there are 0 products in this category
    if (matched.autoWhenEmpty && filteredProducts.length === 0) {
      return matched;
    }

    return null;
  }, [selectedPill, comingSoonData, filteredProducts]);

  return (
    <div className="min-h-screen pt-4 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header Row with "All Products" and "Advance Filters" (Screenshot 4) */}
      <div className="flex items-center justify-between pt-2 pb-3">
        <h1 className="font-inter font-medium text-base sm:text-lg text-neutral-900">
          All Products
        </h1>

        {/* Advance Filters Button (Screenshot 4 Style with toggle/flashlight icon) */}
        <button
          type="button"
          onClick={() => setIsFiltersOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-800 hover:text-black bg-white/70 hover:bg-white border border-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full transition-all active:scale-95 shadow-2xs"
          aria-label="Open advance filters"
        >
          {/* Filter / Flashlight Icon */}
          <svg className="w-3.5 h-3.5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="text-[11px] font-medium tracking-tight">Advance Filters</span>
          {(selectedColor !== "All" || sortBy !== "default" || inStockOnly) && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8262A]" />
          )}
        </button>
      </div>

      {/* Horizontal Scrollable Category Filter Pills (Exact Screenshot 4 Style) */}
      <div className="flex gap-2 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
        {filterPills.map((pill) => {
          const isActive = selectedPill.toLowerCase() === pill.toLowerCase();
          return (
            <button
              key={pill}
              type="button"
              onClick={() => handlePillClick(pill)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-inter transition-all duration-200 whitespace-nowrap active:scale-95 ${
                isActive
                  ? "bg-white/95 text-black font-semibold border border-[#2C2A29] shadow-xs backdrop-blur-md"
                  : "bg-white/65 hover:bg-white text-neutral-700 hover:text-black border border-white/80 backdrop-blur-md shadow-2xs"
              }`}
            >
              {pill}
            </button>
          );
        })}
      </div>

      {/* Active Filter Tags */}
      {(selectedColor !== "All" || inStockOnly || sortBy !== "default") && (
        <div className="flex flex-wrap items-center gap-2 pb-4 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Active:
          </span>
          {selectedColor !== "All" && (
            <span className="text-[10px] font-bold uppercase bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              Color: {selectedColor}
              <button onClick={() => setSelectedColor("All")} className="hover:text-red-600">
                &times;
              </button>
            </span>
          )}
          {inStockOnly && (
            <span className="text-[10px] font-bold uppercase bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              In Stock Only
              <button onClick={() => setInStockOnly(false)} className="hover:text-red-600">
                &times;
              </button>
            </span>
          )}
          {sortBy !== "default" && (
            <span className="text-[10px] font-bold uppercase bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              Sorted: {sortBy}
              <button onClick={() => setSortBy("default")} className="hover:text-red-600">
                &times;
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSelectedColor("All");
              setSortBy("default");
              setInStockOnly(false);
              setSelectedPill("View all");
            }}
            className="text-[10px] font-bold text-orange-600 underline uppercase ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Product Grid or Coming Soon Showcase */}
      {activeComingSoonConfig ? (
        <ComingSoonView
          config={activeComingSoonConfig}
          onExploreAll={() => {
            setSelectedPill("View all");
            setSelectedColor("All");
            setInStockOnly(false);
          }}
        />
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-neutral-300 rounded-3xl mt-4 space-y-3">
          <p className="text-3xl">🔍</p>
          <h3 className="text-sm font-black uppercase tracking-wider text-black">
            No drops found in this filter
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your category selection or resetting your advance filters to view our full collection.
          </p>
          <button
            onClick={() => {
              setSelectedPill("View all");
              setSelectedColor("All");
              setInStockOnly(false);
            }}
            className="mt-2 bg-[#2C2A29] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#E8262A] transition-colors border border-white/20"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-10 mt-2">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Advance Filters Drawer / Modal */}
      {isFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
            onClick={() => setIsFiltersOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-[#E8E6DF]/92 backdrop-blur-2xl border-l border-white/60 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-black/5 bg-white/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h3 className="text-sm font-black uppercase tracking-wider text-black">
                  Advance Filters
                </h3>
              </div>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="text-neutral-500 hover:text-black p-1 text-xl leading-none"
                aria-label="Close filters"
              >
                &times;
              </button>
            </div>

            {/* Filter Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Sort By */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-neutral-500 block mb-2">
                  Sort By
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: "Featured / Default", val: "default" },
                    { label: "Newest Drops", val: "newest" },
                    { label: "Price: Low to High", val: "price-asc" },
                    { label: "Price: High to Low", val: "price-desc" },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => setSortBy(s.val)}
                      className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        sortBy === s.val
                          ? "bg-[#2C2A29] text-white border-[#2C2A29] shadow-md"
                          : "bg-white/70 text-neutral-800 border-white/80 hover:bg-white backdrop-blur-sm shadow-2xs"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-neutral-500 block mb-2">
                  Color Palette
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedColor("All")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border uppercase transition-all ${
                      selectedColor === "All"
                        ? "bg-[#2C2A29] text-white border-[#2C2A29] shadow-md"
                        : "bg-white/70 text-neutral-800 border-white/80 hover:bg-white backdrop-blur-sm shadow-2xs"
                    }`}
                  >
                    All Colors
                  </button>
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        selectedColor === c.name
                          ? "bg-[#2C2A29] text-white border-[#2C2A29] shadow-md"
                          : "bg-white/70 text-neutral-800 border-white/80 hover:bg-white backdrop-blur-sm shadow-2xs"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="border-t border-black/5 pt-5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    In Stock Drops Only
                  </span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 accent-black rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-5 border-t border-black/5 bg-white/75 backdrop-blur-md flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedColor("All");
                  setSortBy("default");
                  setInStockOnly(false);
                }}
                className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-neutral-600 hover:text-black border border-white/80 rounded-xl bg-white/70 backdrop-blur-sm transition-colors shadow-2xs"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFiltersOpen(false)}
                className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-white bg-[#2C2A29] hover:bg-[#E8262A] rounded-xl transition-colors shadow-lg active:scale-98 border border-white/10"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopClient({ initialProducts, initialComingSoon }: ShopClientProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#2C2A29] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent initialProducts={initialProducts} initialComingSoon={initialComingSoon} />
    </Suspense>
  );
}
