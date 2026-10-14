"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/data";
import { gooeyToast } from "goey-toast";
import QuickAddModal from "./QuickAddModal";

interface ModernLandingViewProps {
  products: Product[];
}

export default function ModernLandingView({ products }: ModernLandingViewProps) {
  // Hero spotlight product state
  const heroProduct = products.find((p) => p.name.toLowerCase().includes("hoodie")) || products[0] || {
    id: "hero-hoodie",
    name: "DRIIVN Forward Hoodie",
    price: 8900,
    originalPrice: 9900,
    images: [
      "/images/products/black-nocturnal-hoodie.jpg",
      "/images/streetwear-model-2.jpg",
      "/images/streetwear-model-cap.jpg",
      "/images/products/star-studded-brown-hoodie.jpg",
    ],
    category: "Tops",
    colors: ["Black", "White", "Greenish", "Grey", "Logan"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    collectionSlug: "winter-collection",
    description:
      "DRIIVN Forward catapults your classic hoodie into the future. Unlike traditional knit fabrics, Forward combines multi-thin layers of select fibres for an exceptionally lightweight feel that's effortlessly warm and comfortable. Plus, this first iteration of DRIIVN Forward reduces the carbon footprint by an average of 75% when used instead of traditional knit fleece materials.",
  };

  const heroImages = [
    heroProduct.images[0] || "/images/products/black-nocturnal-hoodie.jpg",
    heroProduct.images[1] || "/images/streetwear-model-2.jpg",
    "/images/streetwear-model-cap.jpg",
    "/images/hero-streetwear.jpg",
  ];

  const [activeHeroImg, setActiveHeroImg] = useState<string>(heroImages[0]);
  const [selectedColor, setSelectedColor] = useState<string>("Greenish");
  const [selectedSize, setSelectedSize] = useState<string>("S");
  const [isDescOpen, setIsDescOpen] = useState<boolean>(true);
  const [isShippingOpen, setIsShippingOpen] = useState<boolean>(true);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

  // Available colors with hex representations
  const colorOptions = [
    { name: "Black", hex: "#171717" },
    { name: "White", hex: "#F3F4F6", border: true },
    { name: "Greenish", hex: "#9EAA96" },
    { name: "Grey", hex: "#A8A29E" },
    { name: "Logan", hex: "#B4A8BF" },
  ];

  const sizeOptions = ["S", "M", "L", "XL", "XXL"];

  // Filter products for "More All You Needs"
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (selectedCategory === "Clothing" && (p.category === "Tops" || p.category === "Bottoms")) ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Check wishlist state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("my_wishlist");
      if (stored) {
        const list: Product[] = JSON.parse(stored);
        if (list.some((item) => item.id === heroProduct.id)) {
          setIsWishlisted(true);
        }
      }
    } catch {}
  }, [heroProduct.id]);

  // Toggle wishlist for hero product
  const toggleWishlist = () => {
    try {
      const stored = localStorage.getItem("my_wishlist") || "[]";
      let list: Product[] = JSON.parse(stored);
      if (isWishlisted) {
        list = list.filter((item) => item.id !== heroProduct.id);
        setIsWishlisted(false);
        gooeyToast("Removed from Wishlist");
      } else {
        list.push(heroProduct);
        setIsWishlisted(true);
        gooeyToast.success("Saved to Wishlist", {
          description: heroProduct.name,
        });
      }
      localStorage.setItem("my_wishlist", JSON.stringify(list));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch {}
  };

  // Add to Bag / Buy Now handler
  const handleBuyNow = () => {
    try {
      const stored = localStorage.getItem("cart") || "[]";
      const cart = JSON.parse(stored);
      const cartItemId = `${heroProduct.id}-${selectedSize}-${selectedColor}`;

      const existing = cart.find((item: any) => item.id === cartItemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: cartItemId,
          name: heroProduct.name,
          price: heroProduct.price,
          image: activeHeroImg,
          size: selectedSize,
          color: selectedColor,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));

      gooeyToast.success(`Added ${heroProduct.name} to bag`, {
        description: `Size: ${selectedSize} • Color: ${selectedColor} • ₹${heroProduct.price.toLocaleString()}`,
        action: {
          label: "View Bag",
          onClick: () => window.dispatchEvent(new Event("open-cart")),
        },
      });

      // Open cart drawer immediately for fast Buy Now checkout flow
      window.dispatchEvent(new Event("open-cart"));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0c0d0e] text-[#171717] dark:text-[#ededed] transition-colors pb-24">
      {/* 1. Sub-Header Pill Strip (Matching Screenshot 1 & 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Pill Dropdown & Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === "Clothing" ? "All" : "Clothing")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs ${
                selectedCategory === "Clothing"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-white dark:bg-[#18191c] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#222]"
              }`}
            >
              <span>Clothing</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs ${
                selectedCategory === "All"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-white dark:bg-[#18191c] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#222]"
              }`}
            >
              New Arrivals
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("Special")}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs ${
                selectedCategory === "Special"
                  ? "bg-[#E8262A] text-white"
                  : "bg-white dark:bg-[#18191c] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#222]"
              }`}
            >
              Sale
            </button>

            {/* Rounded Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search drops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 sm:w-56 pl-8 pr-3 py-2 bg-white dark:bg-[#18191c] border border-neutral-200 dark:border-neutral-800 rounded-full text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-xs"
              />
              <svg
                className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right: Quick Subcategory Pills */}
          <div className="hidden lg:flex items-center gap-2">
            {["Men", "Women", "Tops", "Bottoms", "Accessories"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "text-black dark:text-white font-bold bg-neutral-200 dark:bg-neutral-800"
                    : "text-neutral-500 hover:text-black dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Spotlight Product Showcase Hero (Direct WiDK Reference UI Replica) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-4 select-none">
          <Link href="/" className="hover:text-black dark:hover:text-white flex items-center gap-1 font-medium">
            <span>&larr; Home</span>
          </Link>
          <span>&rsaquo;</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">Product details</span>
        </div>

        {/* Hero Bento Grid Gallery & Configurations */}
        <div className="bg-white dark:bg-[#151618] rounded-[32px] p-4 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-neutral-200/60 dark:border-neutral-800/80">
          
          {/* Top Section: Bento Gallery (Left Big, Right Top 2, Right Bottom Wide) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 mb-7 select-none">
            
            {/* Left Column: Big Feature Image Frame with "Hoodie" Pill */}
            <div className="lg:col-span-6 relative aspect-[4/5] sm:aspect-[4/4.8] rounded-[24px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 group shadow-xs">
              <Image
                src={activeHeroImg}
                alt={heroProduct.name}
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-102"
              />
              {/* Floating Pill Badge (Screenshot 1 top right of main photo) */}
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-white/85 dark:bg-black/85 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-neutral-800 dark:text-neutral-100 rounded-full shadow-md border border-white/40 dark:border-neutral-700">
                  Hoodie
                </span>
              </div>
            </div>

            {/* Right Column: 2 Perspective Shots + 1 Wide Fabric Macro Shot */}
            <div className="lg:col-span-6 flex flex-col gap-3.5 sm:gap-4">
              
              {/* Top Pair: 2 Alternate Model Perspective Shots */}
              <div className="grid grid-cols-2 gap-3.5 sm:gap-4 flex-1">
                <button
                  type="button"
                  onClick={() => setActiveHeroImg(heroImages[1])}
                  className={`relative aspect-[4/5] sm:aspect-auto rounded-[22px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 group shadow-xs cursor-pointer border-2 transition-all ${
                    activeHeroImg === heroImages[1] ? "border-black dark:border-white" : "border-transparent"
                  }`}
                >
                  <Image
                    src={heroImages[1]}
                    alt="Model front view"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveHeroImg(heroImages[2])}
                  className={`relative aspect-[4/5] sm:aspect-auto rounded-[22px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 group shadow-xs cursor-pointer border-2 transition-all ${
                    activeHeroImg === heroImages[2] ? "border-black dark:border-white" : "border-transparent"
                  }`}
                >
                  <Image
                    src={heroImages[2]}
                    alt="Model side profile"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </button>
              </div>

              {/* Bottom Pair: 1 Wide Landscape Texture / Fabric Zoom Shot */}
              <button
                type="button"
                onClick={() => setActiveHeroImg(heroImages[3])}
                className={`relative aspect-[16/9] sm:h-52 rounded-[22px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 group shadow-xs cursor-pointer border-2 transition-all ${
                  activeHeroImg === heroImages[3] ? "border-black dark:border-white" : "border-transparent"
                }`}
              >
                <Image
                  src={heroImages[3]}
                  alt="Fabric texture and detail closeup"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-4">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full">
                    Macro Detail &bull; 420 GSM
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Section: Left (Product Specs & Accordions) + Right (Obsidian Black Buy Card) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
            
            {/* Left 7 Columns: Product Specs, Rating, Colors, Sizes, Accordions */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Title & Wishlist Row */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    {heroProduct.name}
                  </h1>
                  {/* Star Rating Badge */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-amber-500 font-bold text-xs sm:text-sm">★</span>
                    <span className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200">
                      4.9
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      (41) New Reviews
                    </span>
                  </div>
                </div>

                {/* Heart / Wishlist Button */}
                <button
                  type="button"
                  onClick={toggleWishlist}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xs border ${
                    isWishlisted
                      ? "bg-red-50 text-red-500 border-red-200"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:scale-105"
                  }`}
                  aria-label="Save to Wishlist"
                >
                  <svg
                    className={`w-5 h-5 ${isWishlisted ? "fill-red-500 stroke-red-500" : "fill-none stroke-currentColor"}`}
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
              </div>

              {/* Color Selector */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
                  Color
                </p>
                <div className="flex items-center gap-4">
                  {colorOptions.map((c) => {
                    const isSelected = selectedColor.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className="flex flex-col items-center gap-1.5 group cursor-pointer"
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            isSelected ? "ring-2 ring-offset-2 ring-black dark:ring-white dark:ring-offset-neutral-900" : ""
                          }`}
                          style={{
                            backgroundColor: c.hex,
                            border: c.border ? "1px solid #d1d5db" : "none",
                          }}
                        />
                        <span className={`text-[10px] tracking-tight ${isSelected ? "font-bold text-black dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}>
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
                  Size
                </p>
                <div className="flex items-center gap-2">
                  {sizeOptions.map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`w-11 h-9 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                          isSelected
                            ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expandable Accordion: Description */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDescOpen(!isDescOpen)}
                  className="w-full flex items-center justify-between text-left py-1 text-sm font-bold text-neutral-900 dark:text-white"
                >
                  <span>Description</span>
                  <svg
                    className={`w-4 h-4 text-neutral-500 transition-transform ${isDescOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDescOpen && (
                  <p className="mt-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {heroProduct.description}
                  </p>
                )}
              </div>

              {/* Expandable Accordion: Shipping 2x2 Grid */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 pb-2">
                <button
                  type="button"
                  onClick={() => setIsShippingOpen(!isShippingOpen)}
                  className="w-full flex items-center justify-between text-left py-1 text-sm font-bold text-neutral-900 dark:text-white"
                >
                  <span>Shipping</span>
                  <svg
                    className={`w-4 h-4 text-neutral-500 transition-transform ${isShippingOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isShippingOpen && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {/* Item 1: Discount */}
                    <div className="flex items-center gap-2.5 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
                      <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs flex-shrink-0 font-bold">
                        %
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Discount</p>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">&gt; ₹3,000 Disc 15%</p>
                      </div>
                    </div>

                    {/* Item 2: Package */}
                    <div className="flex items-center gap-2.5 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
                      <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs flex-shrink-0 font-bold">
                        📦
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Package</p>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">Atelier Box Packaging</p>
                      </div>
                    </div>

                    {/* Item 3: Delivery Time */}
                    <div className="flex items-center gap-2.5 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
                      <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs flex-shrink-0 font-bold">
                        ⏱️
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Delivery Time</p>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">2-4 Working Days</p>
                      </div>
                    </div>

                    {/* Item 4: Estimation Arrive */}
                    <div className="flex items-center gap-2.5 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
                      <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs flex-shrink-0 font-bold">
                        🚀
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Estimation Arrive</p>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">Express Pan-India</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Signature Obsidian Black Card + Reviews Block */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* 1. Black High-Contrast Price & CTA Card (Direct WiDK Screenshot Replica) */}
              <div className="bg-[#121212] text-white rounded-[26px] p-6 shadow-2xl border border-neutral-800 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest block">
                    Special Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight">
                      ₹ {heroProduct.price.toLocaleString()}
                    </span>
                    {heroProduct.originalPrice && (
                      <span className="text-xs text-neutral-500 line-through">
                        ₹ {heroProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="bg-white hover:bg-neutral-200 text-black px-6 py-3.5 rounded-full text-xs sm:text-sm font-extrabold tracking-wide transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Buy Now</span>
                  <span className="text-sm">&rarr;</span>
                </button>
              </div>

              {/* 2. Customer Reviews Block with Verified Feedback & Photo Strip */}
              <div className="bg-neutral-50 dark:bg-[#1b1c1e] rounded-[26px] p-5 border border-neutral-200/80 dark:border-neutral-800/80">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                    Reviews (41)
                  </h3>
                  <button
                    type="button"
                    onClick={() => gooeyToast("Opening all 41 customer reviews")}
                    className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                  >
                    See more
                  </button>
                </div>

                {/* Review Card */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-800 text-white flex items-center justify-center text-xs font-bold">
                      AS
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white leading-snug">
                        Alexander Stewart
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <span>13/12/2026</span>
                        <div className="flex text-amber-500">★★★★★</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                    &ldquo;Goddamn!, this hoodie makes me feel soooooo comfortable and genuinely warm af, I love this hoodie, make sure you buy it guys, love it!&rdquo;
                  </p>

                  {/* Customer Fit Thumbnail Strip (3 mini photos) */}
                  <div className="flex items-center gap-2 pt-1">
                    {[heroImages[1], heroImages[2], heroImages[0]].map((img, i) => (
                      <div
                        key={i}
                        className="relative w-12 h-14 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shadow-2xs"
                      >
                        <Image src={img} alt="Customer fit photo" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* 3. "More All You Needs." Section (Exact WiDK UI Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              More All You Needs.
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Curated luxury streetwear drops, crafted for boxy draping & comfort.
            </p>
          </div>

          <Link
            href="/shop"
            className="text-xs font-bold text-neutral-900 dark:text-white hover:text-[#E8262A] dark:hover:text-[#E8262A] flex items-center gap-1 transition-colors"
          >
            <span>Explore All</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* 4-Column Rounded Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {filteredProducts.slice(0, 8).map((prod) => (
            <div
              key={prod.id}
              className="bg-white dark:bg-[#151618] rounded-[24px] p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all border border-neutral-200/70 dark:border-neutral-800/80 flex flex-col justify-between group"
            >
              <Link href={`/product/${prod.id}`} className="block relative aspect-[4/5] rounded-[18px] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                <Image
                  src={prod.images[0]}
                  alt={prod.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {prod.inStock === false && (
                  <span className="absolute top-2.5 left-2.5 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                    Sold Out
                  </span>
                )}
              </Link>

              <div className="pt-3 px-1 flex flex-col justify-between flex-1">
                <div>
                  <Link href={`/product/${prod.id}`} className="block">
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate hover:text-[#E8262A] transition-colors">
                      {prod.name}
                    </h3>
                  </Link>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                    {prod.description || "Heavyweight combed cotton with boxy oversized cut"}
                  </p>
                </div>

                {/* Price Pill & Quick Action Buttons */}
                <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="bg-black text-white dark:bg-white dark:text-black px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-tight shadow-xs">
                    ₹ {prod.price.toLocaleString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Quick Add Bag Button */}
                    <button
                      type="button"
                      onClick={() => setQuickAddProduct(prod)}
                      className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center text-xs transition-colors shadow-2xs"
                      aria-label="Quick Add to Bag"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Add Modal */}
      {quickAddProduct && (
        <QuickAddModal
          product={quickAddProduct}
          isOpen={!!quickAddProduct}
          onClose={() => setQuickAddProduct(null)}
        />
      )}
    </div>
  );
}
