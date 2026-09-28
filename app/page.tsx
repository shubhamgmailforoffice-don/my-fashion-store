import { collections, stores } from "@/lib/data";
import { getAsyncProducts } from "@/lib/store";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const allProducts = await getAsyncProducts();

  // Curated segments for the screenshot layout
  const latestDrops = allProducts.slice(0, 4);
  const bagProducts = allProducts.filter(
    (p) => p.category === "Accessories" || p.subCategory === "Bags" || p.subCategory === "Wallets"
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Streetwear Hero Section (Screenshot 1 Style) */}
      <section className="relative w-full h-[88vh] sm:h-[92vh] overflow-hidden bg-neutral-950 flex flex-col justify-between">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75" />
        </div>

        {/* Top Spacer / Watermark */}
        <div className="relative z-10 p-6 flex justify-between items-start pointer-events-none">
          <span className="hidden sm:inline text-[10px] font-black tracking-[0.35em] text-white/80 uppercase bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            AUTUMN - WINTER 2026 DROP
          </span>
        </div>

        {/* Center Floating Emblem Disc (Exact replica of circular badge on model in Screenshot 1) */}
        <div className="relative z-10 flex items-center justify-center select-none pointer-events-none">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-black/85 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center p-3 animate-[spin_20s_linear_infinite]">
            <svg
              className="w-14 h-14 sm:w-20 sm:h-20 text-white"
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
            className="inline-block text-white text-sm sm:text-base font-medium tracking-widest uppercase border-b-2 border-white pb-1 hover:text-orange-400 hover:border-orange-400 transition-colors drop-shadow-md"
          >
            Shop now
          </Link>
        </div>
      </section>

      {/* Main Content Sheet with Curved Top (Overlapping the Hero, Screenshot 1 & 2 Style) */}
      <div className="-mt-8 sm:-mt-10 relative z-10 bg-white rounded-t-[32px] sm:rounded-t-[44px] pt-7 sm:pt-10 shadow-[0_-15px_45px_rgba(0,0,0,0.08)]">
        
        {/* Section 1: "Latest drop" with "Discover more" Pill (Screenshot 1 & 2) */}
        <ProductGrid
          products={latestDrops}
          title="Latest drop"
          actionButton={{
            label: "Discover more",
            href: "/shop",
            theme: "light",
          }}
        />

        {/* Section 2: "DRIIVN Bags" Showcase (Screenshot 2 & 3) */}
        <section className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-100">
          <div className="flex items-center justify-between pb-5 mb-1">
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-neutral-900">
              DRIIVN Bags
            </h2>
            <Link
              href="/shop?category=Accessories"
              className="rounded-full px-4 py-1.5 text-[11px] font-bold tracking-tight bg-black text-white hover:bg-neutral-800 transition-all active:scale-95 shadow-2xs whitespace-nowrap"
            >
              Discover more
            </Link>
          </div>

          {/* Horizontal Scrolling Card Reel for Accessories & Bags (Screenshot 2) */}
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
            {bagProducts.map((bag) => (
              <Link
                key={bag.id}
                href={`/product/${bag.id}`}
                className="flex-shrink-0 w-64 sm:w-72 group block select-none"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-100/70 shadow-xs">
                  <Image
                    src={bag.images[0]}
                    alt={bag.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {bag.inStock === false && (
                    <span className="absolute top-3 left-3 bg-white/95 text-black px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full shadow-xs">
                      Sold Out
                    </span>
                  )}
                </div>
                <div className="mt-2.5 flex items-start justify-between px-0.5">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-neutral-900 truncate">
                      {bag.name}
                    </h3>
                    <p className="text-xs font-bold text-neutral-700 mt-0.5">
                      RS. {bag.price.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xl font-light text-neutral-500 group-hover:text-black">
                    +
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Featured 3D Leather Bag Banner (Screenshot 3 Style) */}
          <div className="mt-8 relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#091428] to-[#040812] border border-neutral-800 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[360px] sm:min-h-[460px] shadow-2xl group">
            {/* Centered Large Backpack Image */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 transition-transform duration-700 group-hover:scale-105">
              <Image
                src="/images/leather-backpack.jpg"
                alt="DRIIVN Leather Backpack"
                fill
                className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Bold Overlaid Label (Screenshot 3: "Bags") */}
            <div className="relative z-10 mt-4">
              <span className="text-2xl sm:text-4xl font-black uppercase tracking-widest text-white drop-shadow-lg">
                Bags
              </span>
              <p className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase mt-1">
                Full-Grain Architectural Leather Series
              </p>
              <Link
                href="/shop?category=Accessories"
                className="mt-3 inline-block bg-white text-black hover:bg-orange-500 hover:text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-colors shadow-lg"
              >
                Explore Atelier &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Section 3: Lookbook Headwear & Cap Models (Screenshot 3 Style) */}
        <section className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-100">
          <div className="flex items-center justify-between pb-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">
                Editorial Showcase
              </p>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-neutral-900">
                Headwear & Layering
              </h2>
            </div>
            <Link
              href="/collections"
              className="rounded-full px-4 py-1.5 text-[11px] font-bold tracking-tight bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-200"
            >
              View Concepts
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:gap-6">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-100 shadow-xs group cursor-pointer">
              <Image
                src="/images/streetwear-model-cap.jpg"
                alt="Headwear Drop 01"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">
                  Look 01
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Tactical Winter Cap
                </h4>
              </div>
            </div>

            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-100 shadow-xs group cursor-pointer">
              <Image
                src="/images/streetwear-model-2.jpg"
                alt="Headwear Drop 02"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">
                  Look 02
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Sherpa Aviator Hood
                </h4>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Curated Drops & Concepts */}
        <section className="bg-neutral-50 py-16 sm:py-24 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase mb-1">
                  Curated Drops
                </p>
                <h2 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                  Featured Concepts
                </h2>
              </div>
              <Link
                href="/collections"
                className="text-xs font-black tracking-widest text-black hover:text-orange-600 uppercase border-b border-black pb-1 transition-all"
              >
                View All Collections &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {collections.map((col, index) => (
                <Link
                  key={col.slug}
                  href={`/collections/${col.slug}`}
                  className="relative group h-80 sm:h-96 bg-black rounded-2xl overflow-hidden flex flex-col justify-end p-6 border border-zinc-900 cursor-pointer block"
                >
                  <Image
                    src={col.image}
                    alt={col.name}
                    fill
                    className="object-cover opacity-50 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />

                  <div className="relative z-20 w-full space-y-1.5">
                    <span className="text-[9px] font-black tracking-[0.3em] text-orange-500 uppercase block">
                      Concept 0{index + 1} &bull; {col.tag}
                    </span>
                    <h3 className="text-base sm:text-lg font-black tracking-wider text-white uppercase group-hover:text-orange-400 transition-colors">
                      {col.name}
                    </h3>
                    <p className="text-[10px] text-gray-300 line-clamp-2 uppercase">
                      {col.description}
                    </p>
                    <span className="inline-block text-[10px] font-bold tracking-widest text-white group-hover:text-orange-400 uppercase pt-1 transition-colors">
                      Discover Drops &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Brand Blueprint */}
        <section className="bg-black text-white py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-[10px] font-black tracking-[0.4em] text-orange-500 uppercase">
                Our Blueprint
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
                Crafted in India, <br />
                Worn Worldwide.
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 uppercase tracking-widest leading-relaxed">
                DRIIVN was born out of a desire to create unapologetic, high-octane luxury streetwear. Every garment is cut from custom-milled French Terry and ripstop cotton, tested for drape and durability, and finished with meticulous tactile printing techniques.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                <div>
                  <p className="text-2xl font-black text-white">420</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">GSM French Terry</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">100%</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Combed Cotton</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">03</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Flagship Stores</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative aspect-[4/3] rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <Image
                src="/images/hero-streetwear.jpg"
                alt="DRIIVN Couture Process"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">Archive Series</p>
                  <p className="text-sm font-black tracking-widest text-white uppercase">Nocturnal Collection</p>
                </div>
                <Link
                  href="/shop"
                  className="bg-white text-black px-4 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-orange-500 hover:text-white transition-colors rounded-lg"
                >
                  Shop Pieces
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Flagship Stores */}
        <section className="bg-white py-16 sm:py-20 border-t border-gray-100 pb-28 sm:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-1">
                  Physical Spaces
                </p>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black uppercase">
                  Flagship Retail Experience
                </h2>
              </div>
              <Link
                href="/stores"
                className="text-xs font-black tracking-widest text-black hover:text-orange-600 uppercase border-b border-black hover:border-orange-600 pb-1 transition-all"
              >
                All Store Details &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stores.map((store) => (
                <div
                  key={store.name}
                  className="border border-gray-200 p-6 rounded-2xl bg-zinc-50 hover:border-black transition-colors"
                >
                  <span className="text-[8px] font-black tracking-widest uppercase bg-black text-white px-2 py-0.5 rounded-xs">
                    {store.status}
                  </span>
                  <h3 className="text-base font-black tracking-wider uppercase mt-4 mb-2">
                    {store.city}
                  </h3>
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-4 leading-relaxed">
                    {store.address}
                  </p>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest space-y-1">
                    <p>Hours: {store.timing}</p>
                    <p>Tel: {store.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
