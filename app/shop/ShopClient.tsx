"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { colors, Product } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

interface ShopClientProps {
  initialProducts: Product[];
}

function ShopContent({ initialProducts }: ShopClientProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialColor = searchParams.get("color") || "All";

  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [sortBy, setSortBy] = useState("default");

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

  const categories = ["All", "Tops", "Bottoms", "Special"];

  // Filter products
  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesColor =
        selectedColor === "All" ||
        product.colors.some(
          (c) => c.toLowerCase() === selectedColor.toLowerCase()
        );

      return matchesCategory && matchesColor;
    });
  }, [productsList, selectedCategory, selectedColor]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "price-asc") {
        return a.price - b.price;
      }
      if (sortBy === "price-desc") {
        return b.price - a.price;
      }
      return 0; // default order
    });
  }, [filteredProducts, sortBy]);

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-gray-100 pb-8 mb-10 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-3">
          MY FASHION STORE CATALOGUE
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-widest text-black uppercase">
          Shop All
        </h1>
        <p className="text-xs text-gray-500 tracking-widest uppercase mt-2">
          Explore our seasonal drops, heavyweight essentials, and limited concepts.
        </p>
      </div>

      {/* Interactive Controls Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-6 mb-10 gap-6">
        {/* Left Side: Filters */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Category Filter */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-400 uppercase block">
              Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 border transition-all ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:border-black text-gray-600 bg-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-400 uppercase block">
              Color
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedColor("All")}
                className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 border transition-all ${
                  selectedColor === "All"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 hover:border-black text-gray-600 bg-white"
                }`}
              >
                All
              </button>
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 border transition-all flex items-center gap-1.5 ${
                    selectedColor.toLowerCase() === c.name.toLowerCase()
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:border-black text-gray-600 bg-white"
                  }`}
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Sort Selection */}
        <div className="space-y-2 self-start md:self-end">
          <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-400 uppercase block">
            Sort By
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-[10px] font-bold tracking-widest uppercase border border-gray-200 px-3 py-2 bg-white text-gray-700 outline-none focus:border-black cursor-pointer"
          >
            <option value="default">Featured / Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-200">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">
            No products match the selected filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedColor("All");
              setSortBy("default");
            }}
            className="bg-black text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-orange-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-baseline mb-6">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Showing {sortedProducts.length} Product{sortedProducts.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-8">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopClient({ initialProducts }: ShopClientProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-screen py-24 text-center">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            Loading Fashion Store Catalogue...
          </p>
        </div>
      }
    >
      <ShopContent initialProducts={initialProducts} />
    </Suspense>
  );
}
