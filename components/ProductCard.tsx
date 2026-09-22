"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product } from "@/lib/data";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isOutOfStock = product.inStock === false;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 border border-gray-100">
        <Image
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
            isOutOfStock ? "opacity-70 grayscale-[25%]" : ""
          }`}
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
          {isOutOfStock ? (
            <span className="bg-red-600 px-2 py-0.5 text-[8px] font-black tracking-widest text-white uppercase shadow-sm">
              Sold Out
            </span>
          ) : (
            <>
              {product.isNew && (
                <span className="bg-black px-2 py-0.5 text-[8px] font-bold tracking-widest text-white uppercase">
                  New
                </span>
              )}
              {product.isSale && (
                <span className="bg-orange-600 px-2 py-0.5 text-[8px] font-bold tracking-widest text-white uppercase">
                  Sale
                </span>
              )}
              {product.isBlindBox && (
                <span className="bg-blue-600 px-2 py-0.5 text-[8px] font-bold tracking-widest text-white uppercase">
                  Blind Box
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-[10px] font-black tracking-widest text-gray-900 uppercase">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold tracking-widest text-gray-600">
            RS. {product.price.toLocaleString()}
          </p>
          {product.originalPrice && (
            <p className="text-[10px] font-medium tracking-widest text-gray-400 line-through">
              RS. {product.originalPrice.toLocaleString()}
            </p>
          )}
        </div>

        {isOutOfStock && (
          <p className="text-[9px] font-bold text-red-600 tracking-wider uppercase">
            Out of Stock
          </p>
        )}
      </div>
    </Link>
  );
}
