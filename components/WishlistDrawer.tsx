"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/data";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  onOpenCart,
}: WishlistDrawerProps) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    const loadWishlist = () => {
      try {
        const stored = localStorage.getItem("my_wishlist");
        if (stored) {
          setWishlist(JSON.parse(stored));
        } else {
          // Pre-populate with 2 default wishlist favorites if empty for immediate rich experience
          const defaultItems: Product[] = [
            {
              id: "102",
              name: "BLACK TIGER BONSAI T-SHIRT",
              price: 8900,
              originalPrice: 9900,
              images: ["/images/streetwear-tiger.jpg"],
              category: "Tops",
              colors: ["Black"],
              collectionSlug: "racing-club",
            },
            {
              id: "104",
              name: "NOCTURNAL LEATHER MESSENGER BAG",
              price: 14500,
              images: ["/images/leather-bag.jpg"],
              category: "Accessories",
              colors: ["Black"],
              collectionSlug: "winter-collection",
            },
          ];
          setWishlist(defaultItems);
          localStorage.setItem("my_wishlist", JSON.stringify(defaultItems));
        }
      } catch {
        setWishlist([]);
      }
    };

    if (isOpen) {
      loadWishlist();
    }
  }, [isOpen]);

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter((item) => item.id !== id);
    setWishlist(updated);
    localStorage.setItem("my_wishlist", JSON.stringify(updated));
  };

  const moveToCart = (item: Product) => {
    try {
      const stored = localStorage.getItem("cart") || "[]";
      const cart = JSON.parse(stored);
      const cartItemId = `${item.id}-M-${item.colors[0] || "Black"}`;
      const existing = cart.find((i: any) => i.id === cartItemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: cartItemId,
          name: item.name,
          price: item.price,
          image: item.images[0],
          size: "M",
          color: item.colors[0] || "Black",
          quantity: 1,
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
      removeFromWishlist(item.id);
      if (onOpenCart) {
        onClose();
        onOpenCart();
      }
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl z-50 flex flex-col justify-between">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h2 className="text-sm font-black uppercase tracking-wider text-black">
              Wishlist / Saved Items ({wishlist.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-black text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-3xl">🔖</p>
              <h3 className="text-sm font-black uppercase tracking-wider text-black">
                Your wishlist is empty
              </h3>
              <p className="text-xs text-neutral-500">
                Explore drops and bookmark pieces you want to save for later.
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                className="inline-block mt-3 bg-black text-white text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-[#E8262A] transition-colors"
              >
                Explore Catalogue
              </Link>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 pb-4 border-b border-neutral-100"
              >
                <div className="relative w-18 h-22 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold tracking-tight text-neutral-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs font-bold text-neutral-700 mt-0.5">
                      RS. {item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => moveToCart(item)}
                      className="bg-black text-white hover:bg-[#E8262A] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Move to Bag
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-[10px] font-bold text-neutral-400 hover:text-red-600 uppercase"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-100 bg-neutral-50">
          <Link
            href="/shop"
            onClick={onClose}
            className="block text-center w-full py-3 bg-neutral-200 hover:bg-neutral-300 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
