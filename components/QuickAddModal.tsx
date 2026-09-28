"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/data";

interface QuickAddModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddedToCart?: () => void;
}

export default function QuickAddModal({
  product,
  isOpen,
  onClose,
  onAddedToCart,
}: QuickAddModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const availableSizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : ["S", "M", "L", "XL", "XXL"];

  const handleAddToCart = () => {
    try {
      const stored = localStorage.getItem("cart") || "[]";
      const cart = JSON.parse(stored);
      const cartItemId = `${product.id}-${selectedSize}-${product.colors[0] || "Black"}`;
      
      const existing = cart.find((item: any) => item.id === cartItemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: cartItemId,
          name: product.name,
          price: product.price,
          image: product.images[0] || "/images/products/oversized-tshirt.jpg",
          size: selectedSize,
          color: product.colors[0] || "Black",
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
      
      setIsSuccess(true);
      if (onAddedToCart) onAddedToCart();

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    } catch (e) {
      console.error("Failed to add to cart", e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <div className="w-full sm:max-w-md bg-white/92 backdrop-blur-2xl rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-white/70 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
            Quick Add to Bag
          </span>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-black p-1 text-lg leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="flex gap-4 py-4">
          <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-white/60 flex-shrink-0 border border-white/80 shadow-2xs">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-bold text-[#E8262A] uppercase tracking-wider block">
              {product.category} &bull; {product.subCategory || "Edition"}
            </span>
            <h3 className="text-sm font-bold tracking-tight text-neutral-900 truncate mt-0.5">
              {product.name}
            </h3>
            <p className="text-sm font-bold text-neutral-800 mt-1">
              RS. {product.price.toLocaleString()}
            </p>
            {product.originalPrice && (
              <p className="text-[11px] text-neutral-400 line-through">
                RS. {product.originalPrice.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Size Selection */}
        <div className="space-y-2 py-3 border-t border-black/5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-700 uppercase tracking-wider">
              Select Size: <strong className="text-black">{selectedSize}</strong>
            </span>
            <Link
              href={`/product/${product.id}`}
              onClick={onClose}
              className="text-[10px] text-neutral-500 hover:text-black underline uppercase"
            >
              Size Chart
            </Link>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {availableSizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize(sz)}
                className={`py-2 text-xs font-black uppercase rounded-lg border transition-all ${
                  selectedSize === sz
                    ? "bg-black text-white border-black shadow-md scale-102"
                    : "bg-white/70 hover:bg-white text-neutral-800 border-white/80 backdrop-blur-sm shadow-2xs hover:border-neutral-400"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSuccess}
            className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isSuccess
                ? "bg-emerald-600 text-white"
                : "bg-black text-white hover:bg-[#E8262A] active:scale-98 shadow-lg"
            }`}
          >
            {isSuccess ? "✓ Added to Bag!" : `Add to Bag • RS. ${product.price.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
