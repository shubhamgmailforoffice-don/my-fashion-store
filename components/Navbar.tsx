"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import { products, Product } from "@/lib/data";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

// React 19 external store subscriber for localStorage synchronization
const cartSubscribe = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("cart-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("cart-updated", callback);
    window.removeEventListener("storage", callback);
  };
};

const getCartSnapshot = (): string => {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem("cart") || "[]";
};

const getCartServerSnapshot = (): string => "[]";

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>(products);

  // Sync products when search is opened
  useEffect(() => {
    if (isSearchOpen) {
      fetch("/api/products", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setProductsList(data);
          }
        })
        .catch(() => {});
    }
  }, [isSearchOpen]);

  // Subscribe to cart changes cleanly without cascading setState in effects
  const cartRaw = useSyncExternalStore(
    cartSubscribe,
    getCartSnapshot,
    getCartServerSnapshot
  );

  const cartItems: CartItem[] = useMemo(() => {
    try {
      return JSON.parse(cartRaw);
    } catch {
      return [];
    }
  }, [cartRaw]);

  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );

  // Free shipping progress bar (Free shipping at ₹5,000)
  const freeShippingThreshold = 5000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Helper to update localStorage and emit event
  const saveCart = (items: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleUpdateQuantity = (id: string, size: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id && item.size === size) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    saveCart(updated);
  };

  const handleRemoveItem = (id: string, size: string) => {
    const updated = cartItems.filter(
      (item) => !(item.id === id && item.size === size)
    );
    saveCart(updated);
  };

  // Search results filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return productsList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.colors.some((c) => c.toLowerCase().includes(q)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q))
    );
  }, [searchQuery, productsList]);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-black text-white text-[10px] font-bold tracking-[0.25em] py-2 px-4 text-center uppercase border-b border-neutral-800 flex items-center justify-center gap-4 select-none">
        <span className="hidden sm:inline">COMPLIMENTARY SHIPPING ON ORDERS OVER RS. 5,000</span>
        <span className="hidden sm:inline text-orange-500">•</span>
        <span>FALL-WINTER 2026 DROPS LIVE</span>
        <span className="hidden md:inline text-orange-500">•</span>
        <span className="hidden md:inline">FLAGSHIP STORES: DELHI • MUMBAI • HYDERABAD</span>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Mobile Hamburger Button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-black hover:text-orange-600 focus:outline-none"
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Left: Desktop Navigation */}
          <nav className="hidden lg:flex lg:gap-x-7 items-center">
            <Link
              href="/shop"
              className="text-xs font-bold tracking-widest text-gray-900 hover:text-orange-600 transition-colors uppercase"
            >
              Shop All
            </Link>
            <Link
              href="/collections"
              className="text-xs font-bold tracking-widest text-gray-900 hover:text-orange-600 transition-colors uppercase"
            >
              Collections
            </Link>
            <Link
              href="/shop?category=Tops"
              className="text-xs font-bold tracking-widest text-gray-900 hover:text-orange-600 transition-colors uppercase"
            >
              Tops
            </Link>
            <Link
              href="/shop?category=Bottoms"
              className="text-xs font-bold tracking-widest text-gray-900 hover:text-orange-600 transition-colors uppercase"
            >
              Bottoms
            </Link>
            <Link
              href="/shop-by-color"
              className="text-xs font-bold tracking-widest text-gray-900 hover:text-orange-600 transition-colors uppercase"
            >
              Shop by Color
            </Link>
          </nav>

          {/* Center: Iconic DRIVEN Logo */}
          <div className="flex lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <Link
              href="/"
              className="text-2xl font-black tracking-[0.25em] text-black uppercase transition-transform hover:scale-[1.02]"
            >
              DRIVEN
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-x-5">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-xs font-bold tracking-widest text-gray-900 hover:text-orange-600 transition-colors uppercase flex items-center gap-1.5"
              aria-label="Search catalogue"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Search</span>
            </button>

            <Link
              href="/stores"
              className="hidden text-xs font-bold tracking-widest text-gray-900 hover:text-orange-600 transition-colors uppercase md:block"
            >
              Stores
            </Link>

            <Link
              href="/account"
              className="hidden text-xs font-bold tracking-widest text-gray-900 hover:text-orange-600 transition-colors uppercase sm:block"
            >
              Account
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="text-xs font-bold tracking-widest text-gray-900 hover:text-orange-600 transition-colors uppercase flex items-center gap-1.5"
              aria-label="Open shopping bag"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Bag ({cartCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <span className="text-xl font-black tracking-[0.2em] uppercase">DRIVEN</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-gray-500 hover:text-black"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-4">
                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-black tracking-widest uppercase text-gray-900 hover:text-orange-600 py-1"
                >
                  Shop All
                </Link>
                <Link
                  href="/collections"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-black tracking-widest uppercase text-gray-900 hover:text-orange-600 py-1"
                >
                  Collections
                </Link>
                <Link
                  href="/shop?category=Tops"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-bold tracking-widest uppercase text-gray-700 hover:text-orange-600 py-1"
                >
                  Tops & Hoodies
                </Link>
                <Link
                  href="/shop?category=Bottoms"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-bold tracking-widest uppercase text-gray-700 hover:text-orange-600 py-1"
                >
                  Bottoms & Cargos
                </Link>
                <Link
                  href="/shop-by-color"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-bold tracking-widest uppercase text-gray-700 hover:text-orange-600 py-1"
                >
                  Shop by Color
                </Link>
                <Link
                  href="/stores"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-bold tracking-widest uppercase text-gray-700 hover:text-orange-600 py-1"
                >
                  Flagship Stores
                </Link>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-bold tracking-widest uppercase text-gray-700 hover:text-orange-600 py-1"
                >
                  Account / Order Tracking
                </Link>
              </nav>
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-2">
              <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                India’s Premier Streetwear Brand
              </p>
              <p className="text-[9px] font-bold tracking-widest text-black uppercase">
                DRIVEN DESIGN ARCHIVES
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Search Modal Drawer */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery("");
            }}
          />
          <div className="fixed inset-x-0 top-0 bg-white shadow-2xl z-50 max-h-[85vh] flex flex-col animate-in slide-in-from-top duration-200">
            <div className="max-w-4xl w-full mx-auto p-6 sm:p-8 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b-2 border-black pb-4">
                <div className="flex items-center gap-3 flex-1">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="SEARCH OVERSIZED TEES, HOODIES, CARGOS, COLLECTIONS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full text-sm sm:text-base font-bold tracking-widest text-black uppercase outline-none placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-xs font-bold tracking-widest text-gray-500 hover:text-black uppercase ml-4"
                >
                  Close [ESC]
                </button>
              </div>

              {/* Quick Suggestion Tags */}
              {!searchQuery && (
                <div className="py-6">
                  <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase block mb-3">
                    Popular Searches
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["Racing Club", "Hoodies", "Cargos", "Blind Box", "Oversized", "Winter 2026"].map(
                      (tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 border border-gray-200 hover:border-black transition-colors"
                        >
                          {tag}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Results List */}
              {searchQuery && (
                <div className="mt-6 flex-1 overflow-y-auto max-h-[50vh] pr-2">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                        No drop pieces found for &ldquo;{searchQuery}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {searchResults.map((item) => (
                        <Link
                          key={item.id}
                          href={`/product/${item.id}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-4 p-3 border border-gray-100 hover:border-black transition-all bg-zinc-50/60"
                        >
                          <div className="w-16 h-20 relative flex-shrink-0 bg-gray-100 overflow-hidden">
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="text-[8px] font-bold tracking-widest text-orange-500 uppercase block">
                              {item.category} • {item.subCategory || "Streetwear"}
                            </span>
                            <h4 className="text-xs font-black tracking-wider text-black uppercase line-clamp-1">
                              {item.name}
                            </h4>
                            <p className="text-xs font-bold text-gray-700 tracking-wider mt-1">
                              RS. {item.price.toLocaleString()}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sliding Bag / Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
            <div className="pointer-events-auto w-screen max-w-md transform bg-white shadow-2xl transition-all duration-300 flex flex-col">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-sm font-black tracking-widest uppercase text-gray-900">
                    Shopping Bag ({cartCount})
                  </h2>
                  <span className="text-[9px] font-bold tracking-widest text-orange-500 uppercase">
                    DRIVEN OFFICIAL STORE
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-xs font-bold tracking-widest text-gray-500 hover:text-black uppercase"
                >
                  Close &times;
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="bg-zinc-50 border-b border-gray-100 px-6 py-3">
                <div className="flex justify-between items-center text-[9px] font-black tracking-widest uppercase mb-1.5">
                  <span>
                    {remainingForFreeShipping === 0
                      ? "✓ FREE EXPRESS SHIPPING UNLOCKED"
                      : `ADD RS. ${remainingForFreeShipping.toLocaleString()} MORE FOR FREE SHIPPING`}
                  </span>
                  <span className="text-gray-400">RS. {subtotal.toLocaleString()} / 5,000</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 overflow-hidden">
                  <div
                    className="bg-black h-full transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Drawer Cart Items */}
              <div className="flex-1 overflow-y-auto py-6 px-6 divide-y divide-gray-100">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-16">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-widest uppercase text-black">
                        Your bag is currently empty
                      </p>
                      <p className="text-[10px] text-gray-400 tracking-wider uppercase mt-1">
                        Explore our latest limited releases and core uniforms.
                      </p>
                    </div>
                    <Link
                      href="/shop"
                      onClick={() => setIsCartOpen(false)}
                      className="bg-black text-white text-xs font-black tracking-widest uppercase px-8 py-3.5 hover:bg-orange-600 transition-colors"
                    >
                      Shop New Drops
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div key={`${item.id}-${item.size}`} className="flex pt-4 first:pt-0">
                        {/* Item Image */}
                        <div className="h-28 w-20 flex-shrink-0 overflow-hidden bg-gray-50 relative border border-gray-100">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Item Info */}
                        <div className="ml-4 flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex justify-between text-xs font-black tracking-wider text-gray-950 uppercase">
                              <h3 className="line-clamp-1 pr-2">{item.name}</h3>
                              <p className="ml-2 flex-shrink-0">RS. {(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                            <p className="mt-1 text-[9px] font-bold tracking-wider text-zinc-400 uppercase">
                              SIZE: {item.size} • COLOR: {item.color}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-xs mt-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-200">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.id, item.size, -1)}
                                className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-500 hover:text-black transition-colors"
                              >
                                -
                              </button>
                              <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.id, item.size, 1)}
                                className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-500 hover:text-black transition-colors"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id, item.size)}
                              className="text-[10px] font-black text-orange-600 hover:text-black uppercase tracking-widest transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer Summary */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-100 py-6 px-6 bg-zinc-50 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-black tracking-widest text-gray-900 uppercase">
                      <p>Estimated Total</p>
                      <p>RS. {subtotal.toLocaleString()}</p>
                    </div>
                    <p className="text-[9px] text-gray-400 tracking-wider uppercase">
                      Taxes included. Free shipping calculated automatically at checkout.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => alert("Connecting to DRIVEN Secure Checkout...")}
                      className="w-full bg-black text-white hover:bg-orange-600 py-4 text-xs font-black tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Checkout</span>
                      <span>•</span>
                      <span>RS. {subtotal.toLocaleString()}</span>
                    </button>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-full bg-transparent hover:bg-white text-gray-700 hover:text-black border border-gray-200 py-3 text-[10px] font-bold tracking-widest uppercase transition-all"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Matching official DRIVEN mobile app experience) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 px-6 flex items-center justify-around">
        <Link
          href="/shop"
          className="flex flex-col items-center text-gray-700 hover:text-black"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-[8px] font-bold tracking-widest uppercase mt-1">Explore</span>
        </Link>

        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center text-gray-700 hover:text-black"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[8px] font-bold tracking-widest uppercase mt-1">Search</span>
        </button>

        <Link
          href="/stores"
          className="flex flex-col items-center text-gray-700 hover:text-black"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[8px] font-bold tracking-widest uppercase mt-1">Stores</span>
        </Link>

        <Link
          href="/account"
          className="flex flex-col items-center text-gray-700 hover:text-black"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[8px] font-bold tracking-widest uppercase mt-1">Account</span>
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center text-gray-700 hover:text-orange-600 relative"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 right-2 bg-orange-600 text-white rounded-full text-[8px] font-bold w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[8px] font-bold tracking-widest uppercase mt-1">Bag</span>
        </button>
      </div>
    </>
  );
}
