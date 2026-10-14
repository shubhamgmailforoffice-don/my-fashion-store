"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Product } from "@/lib/data";
import QuickAddModal from "./QuickAddModal";
import { gooeyToast } from "goey-toast";

interface ProductCardProps {
  product: Product;
  onQuickAdd?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const isOutOfStock = product.inStock === false;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("my_wishlist");
      if (stored) {
        const list: Product[] = JSON.parse(stored);
        if (list.some((item) => String(item.id) === String(product.id))) {
          setIsWishlisted(true);
        }
      }
    } catch {}
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = localStorage.getItem("my_wishlist") || "[]";
      let list: Product[] = JSON.parse(stored);
      if (isWishlisted) {
        list = list.filter((item) => String(item.id) !== String(product.id));
        setIsWishlisted(false);
        gooeyToast("Removed from Wishlist");
      } else {
        list.push(product);
        setIsWishlisted(true);
        gooeyToast.success("Saved to Wishlist", {
          description: product.name,
        });
      }
      localStorage.setItem("my_wishlist", JSON.stringify(list));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch {}
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (onQuickAdd) {
      onQuickAdd(product);
    } else {
      setIsQuickAddOpen(true);
    }
  };

  return (
    <>
      <div
        className="group relative flex flex-col justify-between bg-white dark:bg-[#151618] rounded-[24px] p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all border border-neutral-200/70 dark:border-neutral-800/80 select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Media Container with Rounded Corners (WiDK / Screenshot style) */}
        <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] rounded-[18px] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          <Image
            src={
              isHovered && product.images[1] ? product.images[1] : product.images[0]
            }
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
              isOutOfStock ? "opacity-75 grayscale-[20%]" : ""
            }`}
          />

          {/* Badges on Top Left */}
          {isOutOfStock ? (
            <div className="absolute left-2.5 top-2.5 z-10 pointer-events-none">
              <span className="bg-black/80 text-white px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full backdrop-blur-md shadow-xs">
                Sold Out
              </span>
            </div>
          ) : (
            product.isNew && (
              <div className="absolute left-2.5 top-2.5 z-10 pointer-events-none">
                <span className="bg-white/90 dark:bg-black/90 text-neutral-900 dark:text-white px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full border border-white/60 dark:border-neutral-700 backdrop-blur-md shadow-2xs">
                  New
                </span>
              </div>
            )
          )}

          {/* Top Right: Wishlist Heart Button */}
          <button
            type="button"
            onClick={toggleWishlist}
            className={`absolute right-2.5 top-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-xs ${
              isWishlisted
                ? "bg-white text-red-500 shadow-md scale-105"
                : "bg-white/80 dark:bg-black/70 text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-black hover:scale-105 opacity-0 group-hover:opacity-100 sm:opacity-100"
            }`}
            aria-label="Save to Wishlist"
          >
            <svg
              className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500 stroke-red-500" : "fill-none stroke-currentColor"}`}
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </Link>

        {/* Product Info & Action Row */}
        <div className="pt-3 px-1 flex flex-col justify-between flex-1">
          <div>
            <Link href={`/product/${product.id}`} className="block">
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate hover:text-[#E8262A] transition-colors leading-snug">
                {product.name}
              </h3>
            </Link>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
              {product.description || "Heavyweight combed cotton with boxy oversized cut"}
            </p>
          </div>

          {/* Bottom Row: Price Pill & Quick Add Bag Button */}
          <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="bg-black text-white dark:bg-white dark:text-black px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-tight shadow-xs">
              ₹ {product.price.toLocaleString()}
            </span>

            <button
              type="button"
              onClick={handlePlusClick}
              disabled={isOutOfStock}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-2xs ${
                isOutOfStock
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                  : "bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-700 dark:text-neutral-300 active:scale-95"
              }`}
              aria-label={`Quick add ${product.name} to bag`}
              title={isOutOfStock ? "Out of stock" : "Quick Add to Bag"}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Internal Quick Add Modal if onQuickAdd wasn't provided */}
      {!onQuickAdd && (
        <QuickAddModal
          product={product}
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
        />
      )}
    </>
  );
}
