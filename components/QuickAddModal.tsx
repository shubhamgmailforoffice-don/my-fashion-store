"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/data";
import { gooeyToast } from "goey-toast";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and notify other components that modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.dispatchEvent(
        new CustomEvent("modal-state-change", { detail: { open: true } })
      );
    } else {
      document.body.style.overflow = "";
      window.dispatchEvent(
        new CustomEvent("modal-state-change", { detail: { open: false } })
      );
    }
    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(
        new CustomEvent("modal-state-change", { detail: { open: false } })
      );
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !product) return null;

  const availableSizes =
    product.sizes && product.sizes.length > 0
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

      gooeyToast.success(`Added ${product.name} to bag`, {
        description: `Size: ${selectedSize} • Rs. ${product.price.toLocaleString()}`,
        action: {
          label: "View Bag",
          onClick: () => window.dispatchEvent(new Event("open-cart")),
        },
      });

      setIsSuccess(true);
      if (onAddedToCart) onAddedToCart();

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 700);
    } catch (e) {
      console.error("Failed to add to cart", e);
      gooeyToast.error("Failed to add item to bag");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full sm:max-w-md bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-2xl p-5 pb-8 sm:pb-6 shadow-2xl border border-white/70 dark:border-white/10 animate-in slide-in-from-bottom duration-250 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Quick Add to Bag
          </span>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white p-1 text-lg leading-none transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="flex gap-4 py-4">
          <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 border border-white/80 dark:border-white/10 shadow-2xs">
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
            <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white truncate mt-0.5">
              {product.name}
            </h3>
            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-1">
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
        <div className="space-y-2 py-3 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider text-[11px]">
              Select Size: <strong className="text-black dark:text-white">{selectedSize}</strong>
            </span>
            <Link
              href={`/product/${product.id}`}
              onClick={onClose}
              className="text-[10px] text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white underline uppercase"
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
                className={`py-2.5 text-xs font-black uppercase rounded-xl border transition-all ${
                  selectedSize === sz
                    ? "bg-[#2C2A29] dark:bg-white text-white dark:text-black border-[#2C2A29] dark:border-white shadow-md scale-102"
                    : "bg-white/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:border-black dark:hover:border-white shadow-2xs"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSuccess}
            className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isSuccess
                ? "bg-emerald-600 text-white"
                : "bg-[#2C2A29] dark:bg-white text-white dark:text-black hover:bg-[#E8262A] dark:hover:bg-[#E8262A] dark:hover:text-white active:scale-98 shadow-lg border border-white/10"
            }`}
          >
            {isSuccess ? "✓ Added to Bag!" : `Add to Bag • RS. ${product.price.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
