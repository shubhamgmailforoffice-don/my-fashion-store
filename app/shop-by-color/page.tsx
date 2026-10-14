"use client";

import { useState, useEffect } from "react";
import { products, colors, Product } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default function ShopByColorPage() {
  const [productsList, setProductsList] = useState<Product[]>(products);
  const [selectedColor, setSelectedColor] = useState("Orange"); // Default to Orange for a vibrant start!

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

  // Filter products matching the active color
  const matchedProducts = productsList.filter((product) =>
    product.colors.some((c) => c.toLowerCase() === selectedColor.toLowerCase())
  );

  return (
    <div className="min-h-screen py-8 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* WiDK Style Rounded Container Card */}
      <div className="bg-white dark:bg-[#151618] rounded-[32px] p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.05)] border border-neutral-200/70 dark:border-neutral-800/80">
        
        {/* Header */}
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-8 mb-10 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] text-[#E8262A] uppercase mb-2">
            DRIIVN SPECTRUM
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-white uppercase">
            Shop by Color
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 tracking-wider uppercase mt-2 max-w-lg mx-auto">
            Select a core color capsule to filter our limited releases and seasonal palettes.
          </p>
        </div>

        {/* Visual Color Grid Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4 mb-12">
          {colors.map((color) => {
            const isActive = selectedColor.toLowerCase() === color.name.toLowerCase();
            const colorCount = productsList.filter((p) =>
              p.colors.some((c) => c.toLowerCase() === color.name.toLowerCase())
            ).length;

            return (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color.name)}
                className={`relative h-28 sm:h-32 flex flex-col justify-between p-4 rounded-[22px] border transition-all duration-300 text-left outline-none cursor-pointer ${
                  isActive
                    ? "border-black dark:border-white bg-neutral-100/80 dark:bg-neutral-800 ring-2 ring-black dark:ring-white shadow-md scale-102"
                    : "border-neutral-200/80 dark:border-neutral-800 hover:border-black dark:hover:border-white bg-neutral-50/60 dark:bg-neutral-900/40"
                }`}
              >
                {/* Color Dot Indicator */}
                <div 
                  className="w-6 h-6 rounded-full border border-black/10 dark:border-white/20 shadow-xs"
                  style={{ backgroundColor: color.hex }}
                />

                <div>
                  <h3 className="text-xs font-black tracking-widest uppercase text-neutral-900 dark:text-white">
                    {color.name}
                  </h3>
                  <p className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase mt-0.5">
                    {colorCount} Drop Item{colorCount !== 1 ? "s" : ""}
                  </p>
                </div>

                {isActive && (
                  <span className="absolute top-3.5 right-3.5 text-xs font-black text-black dark:text-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Products list heading */}
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-8 flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-black tracking-tight text-neutral-900 dark:text-white uppercase">
            {selectedColor} Capsule Drops
          </h2>
          <span className="text-xs font-semibold text-neutral-400 uppercase">
            ({matchedProducts.length} Item{matchedProducts.length !== 1 ? "s" : ""})
          </span>
        </div>

        {/* Matching garments grid */}
        {matchedProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
            <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
              No active drop garments are categorized under {selectedColor} at this moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-10">
            {matchedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
