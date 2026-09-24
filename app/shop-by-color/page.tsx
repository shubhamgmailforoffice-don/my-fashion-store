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
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 pb-8 mb-12 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-3">
          DRIIVN SPECTRUM
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-widest text-black uppercase">
          Shop by Color
        </h1>
        <p className="text-xs text-gray-500 tracking-widest uppercase mt-2">
          Select a core color capsule to filter our limited releases.
        </p>
      </div>

      {/* Visual Color Grid Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
        {colors.map((color) => {
          const isActive = selectedColor.toLowerCase() === color.name.toLowerCase();
          const colorCount = productsList.filter((p) =>
            p.colors.some((c) => c.toLowerCase() === color.name.toLowerCase())
          ).length;

          return (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              className={`relative h-32 flex flex-col justify-between p-4 border transition-all duration-300 text-left outline-none ${
                isActive
                  ? "border-black bg-zinc-50 ring-2 ring-black"
                  : "border-gray-100 hover:border-gray-300 bg-white"
              }`}
            >
              {/* Color Dot Indicator */}
              <div 
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: color.hex }}
              />

              <div>
                <h3 className="text-xs font-black tracking-widest uppercase text-gray-950">
                  {color.name}
                </h3>
                <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mt-0.5">
                  {colorCount} Drop Item{colorCount !== 1 ? "s" : ""}
                </p>
              </div>

              {isActive && (
                <span className="absolute top-4 right-4 text-xs font-black text-black">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Products list heading */}
      <div className="border-b border-gray-100 pb-4 mb-10 flex justify-between items-baseline">
        <h2 className="text-xl font-black tracking-widest text-black uppercase">
          {selectedColor} Capsule Drops
        </h2>
        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          ({matchedProducts.length} Item{matchedProducts.length !== 1 ? "s" : ""} found)
        </span>
      </div>

      {/* Matching garments grid */}
      {matchedProducts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-200">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            No active drop garments are categorized under {selectedColor} at this moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-8">
          {matchedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
