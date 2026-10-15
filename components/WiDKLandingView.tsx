"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/data";
import ProductCard from "./ProductCard";
import { gooeyToast } from "goey-toast";

interface WiDKLandingViewProps {
  products: Product[];
}

export default function WiDKLandingView({ products }: WiDKLandingViewProps) {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [outfitColor, setOutfitColor] = useState("Black");
  const [outfitSize, setOutfitSize] = useState("L");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const filterTabs = ["All", "Hoodies", "T-Shirts", "Jackets", "Pants", "Accessories"];

  // Filter products for the "More All You Needs" section
  const filteredProducts = products.filter((p) => {
    if (selectedFilter === "All") return true;
    const cat = (p.category || "").toLowerCase();
    const sub = (p.subCategory || "").toLowerCase();
    const name = (p.name || "").toLowerCase();
    const filter = selectedFilter.toLowerCase();

    if (filter === "hoodies") return cat.includes("hood") || sub.includes("hood") || name.includes("hood");
    if (filter === "t-shirts") return cat.includes("tee") || cat.includes("t-shirt") || sub.includes("tee") || name.includes("tee");
    if (filter === "jackets") return cat.includes("jacket") || sub.includes("jacket") || name.includes("jacket");
    if (filter === "pants") return cat.includes("bottom") || cat.includes("pant") || sub.includes("pant") || sub.includes("cargo") || name.includes("cargo");
    if (filter === "accessories") return cat.includes("accessor") || sub.includes("accessor") || name.includes("bag") || name.includes("cap");
    return true;
  });

  const featuredProduct = products[0] || {
    id: "prod-1",
    name: "Black Nocturnal Heavyweight Hoodie",
    price: 3499,
    images: ["/images/products/black-nocturnal-hoodie.jpg", "/images/hero-streetwear.jpg"],
    category: "Tops",
    subCategory: "Hoodie",
    description: "480 GSM custom-milled French Terry with architectural boxy drape.",
    colors: ["Black", "White", "Greenish", "Grey", "Logan"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  };

  // Add featured item directly to bag and slide open cart drawer
  const handleBuyNow = (prod: any, size = "L", color = "Black") => {
    try {
      const stored = localStorage.getItem("cart") || "[]";
      const cart = JSON.parse(stored);
      const cartItemId = `${prod.id}-${size}-${color}`;

      const existing = cart.find((item: any) => item.id === cartItemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: cartItemId,
          name: prod.name,
          price: prod.price,
          image: prod.images[0] || "/images/products/black-nocturnal-hoodie.jpg",
          size,
          color,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));

      gooeyToast.success(`Added ${prod.name} to bag`, {
        description: `Size: ${size} • Color: ${color} • ₹${prod.price.toLocaleString()}`,
        action: {
          label: "View Bag",
          onClick: () => window.dispatchEvent(new Event("open-cart")),
        },
      });

      // Slide open cart drawer
      window.dispatchEvent(new Event("open-cart"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      gooeyToast.success("Subscribed to DRIIVN Drops", {
        description: `Confirmation sent to ${newsletterEmail}`,
      });
      setNewsletterEmail("");
    }
  };

  const colorMap: Record<string, string> = {
    Black: "#171717",
    White: "#F3F4F6",
    Greenish: "#9EAA96",
    Grey: "#A8A29E",
    Logan: "#B4A8BF",
  };

  return (
    <div className="min-h-screen py-6 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* ========================================================================= */}
      {/* 1. HERO BENTO SECTION (Direct WiDK Streetwear Showcase)                   */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#151618] rounded-[32px] sm:rounded-[38px] p-5 sm:p-8 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.05)] border border-neutral-200/70 dark:border-neutral-800/80">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-100 dark:border-neutral-800">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-widest text-[#E8262A] uppercase border border-neutral-200 dark:border-neutral-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8262A] animate-pulse" />
              <span>DRIIVN ATELIER &bull; SPRING / SUMMER 2026</span>
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-[1.05]">
              ELEVATE YOUR <br className="hidden sm:inline" />
              EVERYDAY ESSENTIALS
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-xl">
              Engineered with 480 GSM custom-milled French Terry, architectural boxy fits, and automotive-inspired high-octane accents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black px-6 sm:px-7 py-3 rounded-full text-xs font-black tracking-widest uppercase transition-all shadow-md hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Shop Latest Drops &rarr;
            </Link>
            <Link
              href="/collections"
              className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-5 sm:px-6 py-3 rounded-full text-xs font-black tracking-widest uppercase transition-all border border-neutral-200 dark:border-neutral-700 whitespace-nowrap"
            >
              Collections
            </Link>
          </div>
        </div>

        {/* Hero Bento Grid (Matching WiDK Bento Gallery) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-6">
          
          {/* Big Featured Left Card (6 Cols) */}
          <div className="lg:col-span-6 relative aspect-[4/4.8] rounded-[26px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 group shadow-sm border border-neutral-200/60 dark:border-neutral-800">
            <Image
              src="/images/hero-streetwear.jpg"
              alt="Flagship Heavyweight Hoodie"
              fill
              priority
              className="object-cover object-top transition-transform duration-700 group-hover:scale-103"
            />
            {/* Category Floating Pill Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-white/85 dark:bg-black/85 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-neutral-800 dark:text-neutral-100 rounded-full shadow-md border border-white/40 dark:border-neutral-700">
                Flagship Hoodie
              </span>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-300">
                LOOK 01 / WINTER ATELIER
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1 mb-3">
                Nocturnal Boxy Hoodie
              </h3>
              <div className="flex items-center justify-between">
                <span className="bg-white text-black px-3.5 py-1 rounded-full text-xs font-black">
                  ₹ 3,499
                </span>
                <Link
                  href="/product/1"
                  className="bg-white/20 hover:bg-white hover:text-black text-white px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5"
                >
                  <span>View Details</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Bento Column (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            {/* Top Pair: 2 Perspective Model Cards */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              <Link
                href="/shop?category=Tops"
                className="relative aspect-[4/4.5] sm:aspect-auto rounded-[22px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 group shadow-xs border border-neutral-200/60 dark:border-neutral-800 block"
              >
                <Image
                  src="/images/streetwear-model-2.jpg"
                  alt="Men's Streetwear Capsule"
                  fill
                  className="object-cover group-hover:scale-106 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-300">
                    MEN&apos;S DROP
                  </span>
                  <h4 className="text-sm font-black uppercase tracking-tight">
                    Tactical Runner Suit
                  </h4>
                </div>
              </Link>

              <Link
                href="/shop?category=Bottoms"
                className="relative aspect-[4/4.5] sm:aspect-auto rounded-[22px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 group shadow-xs border border-neutral-200/60 dark:border-neutral-800 block"
              >
                <Image
                  src="/images/streetwear-model-cap.jpg"
                  alt="Tactical Bottoms Capsule"
                  fill
                  className="object-cover group-hover:scale-106 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-300">
                    TACTICAL
                  </span>
                  <h4 className="text-sm font-black uppercase tracking-tight">
                    Articulated Cargos
                  </h4>
                </div>
              </Link>
            </div>

            {/* Bottom Card: The WiDK Obsidian Black Buy Card */}
            <div className="bg-[#111215] text-white rounded-[24px] p-6 shadow-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#E8262A] uppercase font-bold">
                    ATELIER PROMOTION
                  </span>
                  <span className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    30% OFF
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight">
                    ₹ 3,499
                  </span>
                  <span className="text-xs text-neutral-400 line-through">
                    ₹ 4,999
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Black Nocturnal Heavyweight &bull; Size L &bull; Free Express Delivery
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleBuyNow(featuredProduct, "L", "Black")}
                className="bg-white hover:bg-neutral-200 text-black px-7 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Buy Now</span>
                <span>&rarr;</span>
              </button>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. "MORE ALL YOU NEEDS." SECTION (Exact WiDK Product Grid)                 */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#151618] rounded-[32px] sm:rounded-[38px] p-5 sm:p-8 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.05)] border border-neutral-200/70 dark:border-neutral-800/80">
        
        {/* Section Header with WiDK Filter Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-6 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white uppercase">
              More All You Needs.
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Curated limited edition garments crafted with custom-milled textiles.
            </p>
          </div>

          {/* WiDK Horizontal Pill Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {filterTabs.map((tab) => {
              const isActive = selectedFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedFilter(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-md scale-102"
                      : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* 8-Card WiDK Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-black hover:text-white dark:bg-neutral-800 dark:hover:bg-white dark:hover:text-black text-neutral-900 dark:text-white px-8 py-3 rounded-full text-xs font-black tracking-widest uppercase transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <span>Explore Entire Catalogue ({products.length} Drops)</span>
            <span>&rarr;</span>
          </Link>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. 2-COLUMN BENTO EDITORIAL ("The Collection Edit")                        */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: 01 / CORE DROP */}
        <div className="bg-white dark:bg-[#151618] rounded-[32px] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] border border-neutral-200/70 dark:border-neutral-800/80 flex flex-col justify-between">
          <div className="relative aspect-[16/10] rounded-[22px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 mb-6 group">
            <Image
              src="/images/leather-bag.jpg"
              alt="Hoodies and Sweaters"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-3.5 left-3.5 bg-black/80 text-white px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase backdrop-blur-md">
              01 / CORE DROP
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
              Hoodies &amp; Sweatshirts
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Custom-milled heavyweight French Terry fabrics engineered with boxy unisex silhouettes and automotive graphics.
            </p>
            <div className="pt-3">
              <Link
                href="/shop?category=Tops"
                className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md"
              >
                <span>Shop Tops</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: 02 / TACTICAL SERIES */}
        <div className="bg-white dark:bg-[#151618] rounded-[32px] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] border border-neutral-200/70 dark:border-neutral-800/80 flex flex-col justify-between">
          <div className="relative aspect-[16/10] rounded-[22px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 mb-6 group">
            <Image
              src="/images/products/tactical-cargo-pants.jpg"
              alt="Tactical Cargos and Runner Pants"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-3.5 left-3.5 bg-black/80 text-white px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase backdrop-blur-md">
              02 / TACTICAL SERIES
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
              Cargos &amp; Runner Pants
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Tactical pockets, waterproof YKK zippers, articulated knee gussets, and adjustable shock-cord ankle hems.
            </p>
            <div className="pt-3">
              <Link
                href="/shop?category=Bottoms"
                className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md"
              >
                <span>Shop Bottoms</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE LOOKBOOK & PDP CARD PREVIEW (WiDK Details Replica)         */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#151618] rounded-[32px] sm:rounded-[38px] p-5 sm:p-8 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.05)] border border-neutral-200/70 dark:border-neutral-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Model Visual */}
          <div className="lg:col-span-6 relative aspect-[4/4.8] rounded-[24px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 shadow-sm border border-neutral-200/60 dark:border-neutral-800">
            <Image
              src="/images/streetwear-model-2.jpg"
              alt="Interactive Outfit Drop"
              fill
              className="object-cover"
            />
            <div className="absolute top-4 right-4">
              <span className="bg-white/85 dark:bg-black/85 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-neutral-800 dark:text-neutral-100 rounded-full shadow-md border border-white/40 dark:border-neutral-700">
                Atelier Look
              </span>
            </div>
          </div>

          {/* Right Product Specs & Customizer Card */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 uppercase tracking-widest font-semibold mb-2">
                <span>EXCLUSIVE CAPSULE</span>
                <span>&bull;</span>
                <span className="text-[#E8262A]">RESTOCK READY</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">
                Tactical Aviator &amp; Heavyweight Thermal
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-amber-500 font-bold text-sm">★</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">4.9</span>
                <span className="text-xs text-neutral-400">(41 Verified Reviews)</span>
              </div>
            </div>

            {/* Color Swatch Picker */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
                Color: <span className="text-black dark:text-white">{outfitColor}</span>
              </p>
              <div className="flex items-center gap-3">
                {["Black", "White", "Greenish", "Grey", "Logan"].map((cName) => {
                  const isSelected = outfitColor.toLowerCase() === cName.toLowerCase();
                  return (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => setOutfitColor(cName)}
                      className={`flex flex-col items-center gap-1 cursor-pointer transition-transform ${
                        isSelected ? "scale-110" : "hover:scale-105 opacity-80"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          isSelected
                            ? "border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20 shadow-sm"
                            : "border-neutral-300 dark:border-neutral-700"
                        }`}
                        style={{ backgroundColor: colorMap[cName] || "#333" }}
                      />
                      <span className="text-[9px] font-bold text-neutral-600 dark:text-neutral-400">
                        {cName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Pill Picker */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
                Size
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {["S", "M", "L", "XL", "XXL"].map((sz) => {
                  const isSelected = outfitSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setOutfitSize(sz)}
                      className={`w-11 h-9 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-black text-white dark:bg-white dark:text-black shadow-md scale-105"
                          : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buy Action Box */}
            <div className="bg-[#111215] text-white rounded-[22px] p-5 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase block">
                  DROP PRICE
                </span>
                <span className="text-2xl font-black tracking-tight">
                  ₹ 3,499
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleBuyNow(featuredProduct, outfitSize, outfitColor)}
                className="bg-white hover:bg-neutral-200 text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Add to Bag</span>
                <span>&rarr;</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CUSTOMER REVIEWS & 2x2 SERVICE GUARANTEE BENTO (WiDK Replica)          */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: WiDK Customer Reviews (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#151618] rounded-[32px] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] border border-neutral-200/70 dark:border-neutral-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-6">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-white">
                Reviews (41)
              </h3>
              <span className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer transition-colors">
                See more &rarr;
              </span>
            </div>

            {/* Review 1: Alexander Stewart */}
            <div className="space-y-3 pb-6 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                  AS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Alexander Stewart</h4>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                    <span>13/12/2026</span>
                    <span className="text-amber-500 font-bold">★★★★★</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed italic">
                &ldquo;Goddamn!, this hoodie makes me feel soooooo much comfortable and genuinely warm af, I love this hoodie, make sure you buy it guys, love it!&rdquo;
              </p>
              {/* Review Photos Row */}
              <div className="flex items-center gap-2 pt-1">
                <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                  <Image src="/images/streetwear-model-2.jpg" alt="Review photo 1" fill className="object-cover" />
                </div>
                <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                  <Image src="/images/streetwear-model-cap.jpg" alt="Review photo 2" fill className="object-cover" />
                </div>
                <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                  <Image src="/images/hero-streetwear.jpg" alt="Review photo 3" fill className="object-cover" />
                </div>
              </div>
            </div>

            {/* Review 2: Simson Will */}
            <div className="space-y-3 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-xs">
                  SW
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Simson Will</h4>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                    <span>13/12/2026</span>
                    <span className="text-amber-500 font-bold">★★★★★</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed italic">
                &ldquo;Very quick and easy! Great service, thanks! The fabric weight is genuinely luxurious.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: WiDK 2x2 Service Guarantee Bento (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#151618] rounded-[32px] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] border border-neutral-200/70 dark:border-neutral-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-6">
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-white">
              Shipping &amp; Guarantee
            </h3>
            <span className="text-[10px] font-bold text-[#E8262A] tracking-wider uppercase">
              INDIA ATELIER
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Guarantee 1: Discount */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
              <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center flex-shrink-0 text-xs font-bold">
                %
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Free Delivery</h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  &gt; ₹1,999 Express Free
                </p>
              </div>
            </div>

            {/* Guarantee 2: Package */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
              <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center flex-shrink-0 text-xs font-bold">
                📦
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Matte Packaging</h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Collector&apos;s Edition Box
                </p>
              </div>
            </div>

            {/* Guarantee 3: Delivery Time */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
              <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center flex-shrink-0 text-xs font-bold">
                ⏱
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">2-4 Days Dispatch</h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Fast Metro Courier
                </p>
              </div>
            </div>

            {/* Guarantee 4: Estimation Arrive */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
              <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center flex-shrink-0 text-xs font-bold">
                ✓
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Easy Returns</h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  7-Day Hassle-Free
                </p>
              </div>
            </div>

          </div>

          <div className="mt-6 p-4 rounded-2xl bg-neutral-900 text-white text-center">
            <span className="text-[10px] font-bold tracking-widest text-[#E8262A] uppercase block">
              AUTHENTICITY VERIFIED
            </span>
            <p className="text-xs text-neutral-300 mt-0.5">
              Every drop includes NFC authentication and numbered atelier serial tag.
            </p>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. NEWSLETTER & PRIVATE DROP ACCESS (WiDK Card)                           */}
      {/* ========================================================================= */}
      <section className="bg-black text-white rounded-[32px] sm:rounded-[38px] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#E8262A] uppercase">
            VIP MEMBERSHIP
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Gain Early Access to Private Capsules
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 tracking-wide max-w-lg mx-auto">
            Our limited edition drops sell out in minutes. Join our private ledger for SMS and email allocations.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="ENTER YOUR EMAIL..."
              required
              className="bg-neutral-900 border border-neutral-700 px-4 py-3 rounded-full text-xs text-white placeholder-neutral-500 flex-1 focus:outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              className="bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Get Access &rarr;
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
