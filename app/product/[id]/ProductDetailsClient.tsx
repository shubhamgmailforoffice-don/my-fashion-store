"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { gooeyToast } from "goey-toast";

interface ProductDetailsClientProps {
  product: Product;
  allProducts?: Product[];
}

export default function ProductDetailsClient({ product, allProducts }: ProductDetailsClientProps) {
  // Gallery images with fallbacks for bento grid
  const galleryImages = [
    product.images[0] || "/images/products/black-nocturnal-hoodie.jpg",
    product.images[1] || product.images[0] || "/images/streetwear-model-2.jpg",
    product.images[2] || "/images/streetwear-model-cap.jpg",
    product.images[3] || "/images/hero-streetwear.jpg",
  ];

  const [activeImage, setActiveImage] = useState<string>(galleryImages[0]);
  const [selectedSize, setSelectedSize] = useState<string>("S");
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || "Black");
  const [isDescOpen, setIsDescOpen] = useState<boolean>(true);
  const [isShippingOpen, setIsShippingOpen] = useState<boolean>(true);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const isOutOfStock = product.inStock === false;
  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["S", "M", "L", "XL", "XXL"];

  // Color options representation
  const colorMap: Record<string, string> = {
    Black: "#171717",
    White: "#F3F4F6",
    Greenish: "#9EAA96",
    Grey: "#A8A29E",
    Logan: "#B4A8BF",
    Orange: "#EA580C",
    Red: "#DC2626",
    Brown: "#78350F",
    Navy: "#1E3A8A",
  };

  const productColors = product.colors && product.colors.length > 0 ? product.colors : ["Black", "White", "Greenish", "Grey"];

  // Wishlist persistence
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

  const toggleWishlist = () => {
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

  // Add to Bag / Buy Now
  const handleBuyNow = () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    try {
      const stored = localStorage.getItem("cart") || "[]";
      const cart = JSON.parse(stored);
      const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;

      const existing = cart.find((item: any) => item.id === cartItemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: cartItemId,
          name: product.name,
          price: product.price,
          image: activeImage,
          size: selectedSize,
          color: selectedColor,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));

      gooeyToast.success(`Added ${product.name} to bag`, {
        description: `Size: ${selectedSize} • Color: ${selectedColor} • ₹${product.price.toLocaleString()}`,
        action: {
          label: "View Bag",
          onClick: () => window.dispatchEvent(new Event("open-cart")),
        },
      });

      // Slide open cart drawer
      window.dispatchEvent(new Event("open-cart"));
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  // Recommendations: exclude current product
  const productPool = allProducts && allProducts.length > 0 ? allProducts : products;
  const recommendations = productPool.filter((p) => String(p.id) !== String(product.id)).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0c0d0e] text-[#171717] dark:text-[#ededed] transition-colors py-8 pb-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation (WiDK reference style) */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-5 select-none">
          <Link href="/" className="hover:text-black dark:hover:text-white flex items-center gap-1 font-medium">
            <span>&larr; Home</span>
          </Link>
          <span>&rsaquo;</span>
          <Link href="/shop" className="hover:text-black dark:hover:text-white font-medium">
            Shop
          </Link>
          <span>&rsaquo;</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </div>

        {/* Product Card Container (WiDK Bento Style) */}
        <div className="bg-white dark:bg-[#151618] rounded-[32px] p-4 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-neutral-200/60 dark:border-neutral-800/80">
          
          {/* Top Bento Gallery: 1 Big Left, 2 Top Right, 1 Wide Bottom Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 mb-7 select-none">
            
            {/* Left Big Feature Frame */}
            <div className="lg:col-span-6 relative aspect-[4/5] sm:aspect-[4/4.8] rounded-[24px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 group shadow-xs">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-102"
              />
              {/* Category Floating Pill Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-white/85 dark:bg-black/85 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-neutral-800 dark:text-neutral-100 rounded-full shadow-md border border-white/40 dark:border-neutral-700">
                  {product.subCategory || product.category || "Exclusive"}
                </span>
              </div>

              {isOutOfStock && (
                <div className="absolute left-4 top-4 z-10">
                  <span className="bg-black/80 text-white px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Right Bento Column */}
            <div className="lg:col-span-6 flex flex-col gap-3.5 sm:gap-4">
              
              {/* Top Pair: 2 Alternate Model Perspective Shots */}
              <div className="grid grid-cols-2 gap-3.5 sm:gap-4 flex-1">
                <button
                  type="button"
                  onClick={() => setActiveImage(galleryImages[1])}
                  className={`relative aspect-[4/5] sm:aspect-auto rounded-[22px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 group shadow-xs cursor-pointer border-2 transition-all ${
                    activeImage === galleryImages[1] ? "border-black dark:border-white" : "border-transparent"
                  }`}
                >
                  <Image
                    src={galleryImages[1]}
                    alt="Product perspective view 1"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveImage(galleryImages[2])}
                  className={`relative aspect-[4/5] sm:aspect-auto rounded-[22px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 group shadow-xs cursor-pointer border-2 transition-all ${
                    activeImage === galleryImages[2] ? "border-black dark:border-white" : "border-transparent"
                  }`}
                >
                  <Image
                    src={galleryImages[2]}
                    alt="Product perspective view 2"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </button>
              </div>

              {/* Bottom Wide Macro/Fabric Texture Shot */}
              <button
                type="button"
                onClick={() => setActiveImage(galleryImages[3])}
                className={`relative aspect-[16/9] sm:h-52 rounded-[22px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 group shadow-xs cursor-pointer border-2 transition-all ${
                  activeImage === galleryImages[3] ? "border-black dark:border-white" : "border-transparent"
                }`}
              >
                <Image
                  src={galleryImages[3]}
                  alt="Fabric texture and detail closeup"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-4">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full">
                    Atelier Grade &bull; Custom Milled
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Configuration: Left Specs & Accordions + Right Obsidian Buy Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
            
            {/* Left 7 Columns: Product Specs, Rating, Colors, Sizes, Accordions */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Title & Wishlist */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    {product.name}
                  </h1>
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
                  {productColors.map((colorName) => {
                    const isSelected = selectedColor.toLowerCase() === colorName.toLowerCase();
                    const hex = colorMap[colorName] || "#555555";
                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => setSelectedColor(colorName)}
                        className="flex flex-col items-center gap-1.5 group cursor-pointer"
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            isSelected ? "ring-2 ring-offset-2 ring-black dark:ring-white dark:ring-offset-neutral-900" : ""
                          }`}
                          style={{
                            backgroundColor: hex,
                            border: colorName.toLowerCase() === "white" ? "1px solid #d1d5db" : "none",
                          }}
                        />
                        <span className={`text-[10px] tracking-tight ${isSelected ? "font-bold text-black dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}>
                          {colorName}
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
                  {availableSizes.map((sz) => {
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
                    {product.description ||
                      "Architecturally drafted for an oversized, comfortable silhouette. Cut from heavy French Terry and ripstop fabric, tested for durable everyday wear with soft inner lining."}
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
                    <div className="flex items-center gap-2.5 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
                      <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs flex-shrink-0 font-bold">
                        %
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Discount</p>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">&gt; ₹3,000 Disc 15%</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
                      <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs flex-shrink-0 font-bold">
                        📦
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Package</p>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">Atelier Box Packaging</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
                      <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs flex-shrink-0 font-bold">
                        ⏱️
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Delivery Time</p>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">2-4 Working Days</p>
                      </div>
                    </div>

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

            {/* Right 5 Columns: Obsidian Black Card & Customer Reviews */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Obsidian Black Price & Buy Card */}
              <div className="bg-[#121212] text-white rounded-[26px] p-6 shadow-2xl border border-neutral-800 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest block">
                    Special Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight">
                      ₹ {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-neutral-500 line-through">
                        ₹ {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`px-6 py-3.5 rounded-full text-xs sm:text-sm font-extrabold tracking-wide transition-all shadow-lg flex items-center gap-2 whitespace-nowrap ${
                    isOutOfStock
                      ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                      : "bg-white hover:bg-neutral-200 text-black hover:scale-105 active:scale-95"
                  }`}
                >
                  <span>{isOutOfStock ? "Sold Out" : "Buy Now"}</span>
                  {!isOutOfStock && <span className="text-sm">&rarr;</span>}
                </button>
              </div>

              {/* Customer Reviews Panel */}
              <div className="bg-neutral-50 dark:bg-[#1b1c1e] rounded-[26px] p-5 border border-neutral-200/80 dark:border-neutral-800/80">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                    Reviews (41)
                  </h3>
                  <button
                    type="button"
                    onClick={() => gooeyToast("Opening customer reviews")}
                    className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                  >
                    See more
                  </button>
                </div>

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
                    &ldquo;Goddamn!, this piece makes me feel soooooo comfortable and genuinely warm af, I love the drape and fabric weight, make sure you buy it guys, love it!&rdquo;
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    {[galleryImages[1], galleryImages[2], galleryImages[0]].map((img, i) => (
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

        {/* Bottom Section: "More All You Needs." Recommendations */}
        <section className="mt-16 sm:mt-24">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                More All You Needs.
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Complementary garments tested for layering, drape, and daily rotation.
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {recommendations.map((rec) => (
              <ProductCard key={rec.id} product={rec} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
