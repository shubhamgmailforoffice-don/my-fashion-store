"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product } from "@/lib/data";
import QuickAddModal from "./QuickAddModal";

interface ProductCardProps {
  product: Product;
  onQuickAdd?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const isOutOfStock = product.inStock === false;

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
        className="group relative flex flex-col select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/product/${product.id}`} className="block relative">
          {/* Card Media Container with Rounded Corners (Screenshot 2 & 4 style) */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#2C2A29] border border-white/40 shadow-xs backdrop-blur-md">
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

            {/* Badges on Top Left - Only show Sold Out to keep image clean like Screenshot 4 */}
            {isOutOfStock && (
              <div className="absolute left-2.5 top-2.5 z-10 pointer-events-none">
                <span className="bg-white/85 text-black px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full border border-white/70 shadow-xs backdrop-blur-md">
                  Sold Out
                </span>
              </div>
            )}

            {/* Pagination Dots at Bottom Center - Frosted Glass Capsule */}
            <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="flex items-center gap-1 bg-[#2C2A29]/60 backdrop-blur-xl px-2 py-0.5 rounded-full border border-white/30 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-xs" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-xs" />
              </div>
            </div>
          </div>
        </Link>

        {/* Product Details & Plus Button Row */}
        <div className="mt-2.5 flex items-start justify-between gap-1.5 px-0.5">
          <Link href={`/product/${product.id}`} className="min-w-0 flex-1 block">
            <h3 className="font-inter font-medium text-xs sm:text-[13px] tracking-normal text-neutral-900 truncate leading-snug">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="font-inter text-xs font-normal text-neutral-600">
                RS. {product.price.toLocaleString()}
              </p>
              {product.originalPrice && (
                <p className="font-inter text-[10px] text-neutral-400 line-through">
                  RS. {product.originalPrice.toLocaleString()}
                </p>
              )}
              {product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                <span className="text-[10px] font-bold text-[#E8262A] tracking-wider uppercase ml-auto">
                  Only {product.stockQuantity} left
                </span>
              )}
            </div>
          </Link>

          {/* Minimalist Plus Button with Frosted Glass Styling */}
          <button
            type="button"
            onClick={handlePlusClick}
            disabled={isOutOfStock}
            className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full transition-all leading-none ${
              isOutOfStock
                ? "text-neutral-300 cursor-not-allowed border border-transparent"
                : "text-neutral-600 hover:text-white bg-white/70 hover:bg-[#2C2A29] border border-white/80 backdrop-blur-xs shadow-2xs active:scale-90"
            }`}
            aria-label={`Quick add ${product.name} to bag`}
            title={isOutOfStock ? "Out of stock" : "Quick Add to Bag"}
          >
            <span className="text-xl font-light leading-none">+</span>
          </button>
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
