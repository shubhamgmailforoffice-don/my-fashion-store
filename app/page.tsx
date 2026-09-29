import { Product } from "@/lib/data";
import { getAsyncProducts } from "@/lib/store";
import { getAsyncSections, HomepageSection } from "@/lib/sections";
import ProductGrid from "@/components/ProductGrid";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FEATURED_CATEGORIES = [
  {
    id: "Tops",
    name: "Tops & Hoodies",
    subText: "Oversized Tees, Hoodies, Polos & Sweatshirts",
    href: "/shop?category=Tops",
    image: "/images/products/oversized-tshirt.jpg",
    tag: "Essential Fits",
  },
  {
    id: "Bottoms",
    name: "Bottoms & Pants",
    subText: "Cargo Pants, Parachute Joggers, Shorts",
    href: "/shop?category=Bottoms",
    image: "/images/products/tactical-cargo-pants.jpg",
    tag: "Tactical & Utility",
  },
  {
    id: "Accessories",
    name: "Accessories",
    subText: "Caps, Bags, Wallets, Socks & Utility Gear",
    href: "/shop?category=Accessories",
    image: "/images/leather-bag.jpg",
    tag: "Accent Pieces",
  },
  {
    id: "Special",
    name: "Special / Drops",
    subText: "Mystery Box, Archive Edition, Limited Series",
    href: "/shop?category=Special",
    image: "/images/hero-streetwear.jpg",
    tag: "Limited Release",
  },
];

export default async function Home() {
  const allProducts = await getAsyncProducts();
  const sections = await getAsyncSections();

  // Helper to resolve products for a section
  const getSectionProducts = (section: HomepageSection): Product[] => {
    if (section.productIds && section.productIds.length > 0) {
      const prods = section.productIds
        .map((id) => allProducts.find((p) => String(p.id) === String(id)))
        .filter(Boolean) as Product[];
      if (prods.length > 0) return prods;
    }
    // Fallback to category or first 4
    if (section.id.includes("bag")) {
      return allProducts.filter(
        (p) => p.category === "Accessories" || p.subCategory === "Bags" || p.subCategory === "Wallets"
      );
    }
    return allProducts.slice(0, 4);
  };

  return (
    <div className="min-h-screen bg-[#E8E6DF] text-[#121212]">
      {/* Editorial Streetwear Hero Section (Screenshot 1 Style) */}
      <section className="relative w-full h-[88vh] sm:h-[92vh] overflow-hidden bg-[#2C2A29] flex flex-col justify-between">
        {/* Background Editorial Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-streetwear.jpg"
            alt="DRIIVN Luxury Streetwear Editorial"
            fill
            priority
            className="object-cover object-top opacity-90 sm:opacity-85"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2C2A29]/40 via-transparent to-[#2C2A29]/80" />
        </div>

        {/* Top Spacer / Watermark */}
        <div className="relative z-10 p-6 flex justify-between items-start pointer-events-none">
          <span className="hidden sm:inline text-[10px] font-black tracking-[0.35em] text-white/90 uppercase bg-[#2C2A29]/75 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-lg">
            AUTUMN - WINTER 2026 DROP &bull; <span className="text-[#E8262A]">DRIIVN ATELIER</span>
          </span>
        </div>

        {/* Center Floating Emblem Disc (Circular badge on model in Screenshot 1) */}
        <div className="relative z-10 flex items-center justify-center select-none pointer-events-none">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#2C2A29]/85 backdrop-blur-2xl border border-white/25 shadow-2xl flex items-center justify-center p-3 animate-[spin_20s_linear_infinite]">
            <svg
              className="w-14 h-14 sm:w-20 sm:h-20 text-[#E8262A]"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="6 4" />
              <path d="M50 20 C35 20, 25 35, 25 50 C25 65, 35 80, 50 80 C65 80, 75 65, 75 50 C75 35, 65 20, 50 20 Z M50 32 C60 32, 65 40, 65 50 C65 60, 60 68, 50 68 C40 68, 35 60, 35 50 C35 40, 40 32, 50 32 Z" />
              <circle cx="50" cy="50" r="6" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Bottom Hero Callout: "Shop now" (Screenshot 1 Style) */}
        <div className="relative z-10 pb-12 sm:pb-16 text-center select-none">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#2C2A29]/80 hover:bg-[#E8262A] text-white border border-white/35 backdrop-blur-2xl px-8 py-3.5 rounded-full text-xs sm:text-sm font-black tracking-widest uppercase transition-all shadow-2xl hover:scale-105 active:scale-95"
          >
            <span>Shop Now</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </section>

      {/* Main Content Sheet with Curved Top (Overlapping the Hero, in #E8E6DF palette) */}
      <div className="-mt-8 sm:-mt-10 relative z-10 bg-[#E8E6DF] rounded-t-[32px] sm:rounded-t-[44px] pt-7 sm:pt-10 shadow-[0_-15px_45px_rgba(0,0,0,0.08)]">
        
        {/* Dynamic Sections from Admin Storefront Manager */}
        {sections.map((section) => {
          if (!section.enabled) return null;

          // 1. Grid Type Section (e.g. "Latest drop")
          if (section.type === "grid") {
            const prods = getSectionProducts(section);
            return (
              <div key={section.id}>
                <ProductGrid
                  products={prods}
                  title={section.title}
                  subtitle={section.subtitle}
                  actionButton={section.actionButton}
                />
              </div>
            );
          }

          // 2. Carousel Type Section (e.g. "DRIIVN Bags")
          if (section.type === "carousel") {
            const bagProds = getSectionProducts(section);
            return (
              <section key={section.id} className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-300/60">
                <div className="flex items-center justify-between pb-5 mb-1">
                  <div>
                    {section.subtitle && (
                      <p className="text-[10px] font-bold tracking-[0.25em] text-neutral-500 uppercase mb-1">
                        {section.subtitle}
                      </p>
                    )}
                    <h2 className="text-xl sm:text-3xl font-bold tracking-wide text-[#2C2A29] font-anton uppercase">
                      {section.title}
                    </h2>
                  </div>
                  {section.actionButton && (
                    <Link
                      href={section.actionButton.href}
                      className="rounded-full px-4 py-1.5 text-[11px] font-bold tracking-tight bg-[#2C2A29] hover:bg-[#E8262A] text-white transition-all active:scale-95 shadow-2xs whitespace-nowrap border border-white/20 backdrop-blur-md"
                    >
                      {section.actionButton.label}
                    </Link>
                  )}
                </div>

                {/* Horizontal Scrolling Card Reel for Accessories & Bags (Screenshot 2) */}
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                  {bagProds.map((bag) => (
                    <Link
                      key={bag.id}
                      href={`/product/${bag.id}`}
                      className="flex-shrink-0 w-64 sm:w-72 group block select-none"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#2C2A29] border border-white/20 shadow-md">
                        <Image
                          src={bag.images[0]}
                          alt={bag.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {bag.inStock === false && (
                          <span className="absolute top-3 left-3 bg-white/85 text-black border border-white/70 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-black tracking-wider uppercase rounded-full shadow-xs">
                            Sold Out
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5 flex items-start justify-between px-0.5">
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold tracking-tight text-neutral-900 truncate">
                            {bag.name}
                          </h3>
                          <p className="text-xs font-bold text-neutral-700 mt-0.5">
                            RS. {bag.price.toLocaleString()}
                          </p>
                        </div>
                        <span className="w-6 h-6 rounded-full bg-white/70 border border-white/80 backdrop-blur-xs flex items-center justify-center text-sm font-bold text-neutral-700 group-hover:bg-[#2C2A29] group-hover:text-white transition-colors shadow-2xs">
                          +
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Featured 3D Leather Bag Banner (Screenshot 3 Style) */}
                {section.featuredBag && (
                  <div className="mt-8 relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#091428] to-[#040812] border border-neutral-800 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[360px] sm:min-h-[460px] shadow-2xl group">
                    <div className="relative w-64 h-64 sm:w-80 sm:h-80 transition-transform duration-700 group-hover:scale-105">
                      <Image
                        src={section.featuredBag.image || "/images/leather-backpack.jpg"}
                        alt={section.featuredBag.title}
                        fill
                        className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
                      />
                    </div>

                    <div className="relative z-10 mt-4">
                      <span className="text-2xl sm:text-4xl font-bold uppercase tracking-wider text-white drop-shadow-lg font-anton">
                        {section.featuredBag.title}
                      </span>
                      <p className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase mt-1">
                        {section.featuredBag.subtitle}
                      </p>
                      <Link
                        href={section.featuredBag.href || "/shop?category=Accessories"}
                        className="mt-3 inline-block bg-[#E8262A] hover:bg-[#d01e22] text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-colors shadow-lg"
                      >
                        {section.featuredBag.buttonText || "Explore Atelier"} &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </section>
            );
          }

          // 3. Lookbook Type Section (e.g. "Headwear & Layering")
          if (section.type === "lookbook") {
            const items = section.items || [
              { title: "Tactical Winter Cap", tag: "Look 01", image: "/images/streetwear-model-cap.jpg", link: "/shop" },
              { title: "Sherpa Aviator Hood", tag: "Look 02", image: "/images/streetwear-model-2.jpg", link: "/shop" },
            ];
            return (
              <section key={section.id} className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-300/60">
                <div className="flex items-center justify-between pb-6">
                  <div>
                    {section.subtitle && (
                      <p className="text-[10px] font-bold tracking-[0.25em] text-neutral-500 uppercase mb-1">
                        {section.subtitle}
                      </p>
                    )}
                    <h2 className="text-xl sm:text-3xl font-bold tracking-wide text-[#2C2A29] font-anton uppercase">
                      {section.title}
                    </h2>
                  </div>
                  {section.actionButton && (
                    <Link
                      href={section.actionButton.href}
                      className="rounded-full px-4 py-1.5 text-[11px] font-bold tracking-tight bg-white hover:bg-neutral-200 text-neutral-900 border border-neutral-300 shadow-2xs"
                    >
                      {section.actionButton.label}
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3.5 sm:gap-6">
                  {items.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.link || "/shop"}
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#2C2A29] border border-white/20 shadow-md group cursor-pointer block"
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2C2A29]/90 via-transparent to-transparent flex flex-col justify-end p-4">
                        <span className="text-[9px] font-bold text-[#E8262A] uppercase tracking-widest">
                          {item.tag || `Look 0${idx + 1}`}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-anton">
                          {item.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          }

          return null;
        })}

        {/* Section 4: Shop by Category */}
        <section className="bg-[#DFDDD6] py-16 sm:py-24 border-t border-neutral-300/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] text-[#E8262A] uppercase mb-1">
                  Explore The Lineup
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-wide text-[#2C2A29] font-anton uppercase">
                  Shop by Category
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold tracking-widest text-[#2C2A29] hover:text-[#E8262A] uppercase border-b border-[#2C2A29] hover:border-[#E8262A] pb-1 transition-all"
              >
                View Full Catalog &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURED_CATEGORIES.map((cat, index) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="relative group h-80 sm:h-96 bg-[#2C2A29] rounded-3xl overflow-hidden flex flex-col justify-end p-5 border border-white/25 shadow-xl cursor-pointer block"
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover opacity-65 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C2A29]/90 via-[#2C2A29]/30 to-transparent z-10" />

                  <div className="relative z-20 w-full p-4 rounded-2xl bg-[#2C2A29]/65 backdrop-blur-xl border border-white/25 space-y-1.5 transition-all group-hover:bg-[#2C2A29]/80 group-hover:border-white/40 shadow-lg">
                    <span className="text-[9px] font-bold tracking-[0.3em] text-[#E8262A] uppercase block">
                      Category 0{index + 1} &bull; {cat.tag}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold tracking-wider text-white uppercase font-anton group-hover:text-[#E8262A] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-gray-200 line-clamp-2 uppercase font-medium">
                      {cat.subText}
                    </p>
                    <span className="inline-block text-[10px] font-bold tracking-widest text-white group-hover:text-[#E8262A] uppercase pt-1 transition-colors">
                      Explore {cat.name} &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Brand Blueprint */}
        <section className="bg-[#2C2A29] text-white py-20 px-4 sm:px-6 lg:px-8 border-t border-white/15">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-[10px] font-bold tracking-[0.4em] text-[#E8262A] uppercase">
                Our Blueprint
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-wide leading-tight font-anton">
                Crafted in India, <br />
                Worn Worldwide.
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 uppercase tracking-widest leading-relaxed">
                DRIIVN was born out of a desire to create unapologetic, high-octane luxury streetwear. Every garment is cut from custom-milled French Terry and ripstop cotton, tested for drape and durability, and finished with meticulous tactile printing techniques.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                <div className="bg-white/10 border border-white/20 backdrop-blur-xl p-3.5 rounded-2xl shadow-lg">
                  <p className="text-2xl font-bold text-white font-inter tracking-tight">420</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">GSM French Terry</p>
                </div>
                <div className="bg-white/10 border border-white/20 backdrop-blur-xl p-3.5 rounded-2xl shadow-lg">
                  <p className="text-2xl font-bold text-white font-inter tracking-tight">100%</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Combed Cotton</p>
                </div>
                <div className="bg-white/10 border border-white/20 backdrop-blur-xl p-3.5 rounded-2xl shadow-lg">
                  <p className="text-2xl font-bold text-white font-inter tracking-tight">PAN-INDIA</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Express Dispatch</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative aspect-[4/3] rounded-3xl bg-[#2C2A29] border border-white/20 overflow-hidden shadow-2xl">
              <Image
                src="/images/hero-streetwear.jpg"
                alt="DRIIVN Couture Process"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C2A29]/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end bg-[#2C2A29]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/25 shadow-xl">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[#E8262A] uppercase">Archive Series</p>
                  <p className="text-sm font-bold tracking-wider text-white uppercase font-anton">Seasonal Drops</p>
                </div>
                <Link
                  href="/shop"
                  className="bg-[#E8262A] hover:bg-white hover:text-black text-white px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-colors rounded-xl shadow-lg"
                >
                  Shop Pieces
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
