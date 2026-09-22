import { collections, stores } from "@/lib/data";
import { getAsyncProducts } from "@/lib/store";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const products = await getAsyncProducts();
  const featuredProducts = products.slice(0, 8);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[88vh] w-full overflow-hidden bg-black flex items-center justify-center">
        {/* Background Gradient & Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-neutral-950 to-black opacity-85" />

        {/* Massive Streetwear Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[17vw] font-black text-zinc-900/40 tracking-[0.15em] uppercase leading-none select-none">
            DRIVEN
          </span>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
          <div className="inline-block border border-orange-500/40 bg-orange-500/10 px-4 py-1">
            <p className="text-[10px] font-black tracking-[0.35em] text-orange-500 uppercase">
              Autumn - Winter 2026 Drops Live
            </p>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white uppercase leading-none">
            REDEFINE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-white to-blue-500">
              STREETWEAR
            </span>
          </h1>

          <p className="text-xs sm:text-sm font-medium tracking-widest text-gray-300 max-w-lg mx-auto uppercase leading-relaxed">
            High-end unisex streetwear engineered in India. Heavyweight French Terry, bold graphic typography, and boxy silhouettes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto bg-white text-black hover:bg-orange-600 hover:text-white px-8 py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 text-center"
            >
              Shop New Drops
            </Link>
            <Link
              href="/collections"
              className="w-full sm:w-auto border border-white text-white hover:bg-white hover:text-black px-8 py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 text-center"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Products Grid */}
      <ProductGrid
        products={featuredProducts}
        title="New Arrivals"
        subtitle="Limited Seasonal Drops"
      />

      {/* Curated Collections Highlight */}
      <section className="bg-zinc-50 py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase mb-2">
                Curated Drops
              </p>
              <h2 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
                Featured Concepts
              </h2>
            </div>
            <Link
              href="/collections"
              className="text-xs font-black tracking-widest text-black hover:text-orange-600 uppercase border-b border-black hover:border-orange-600 pb-1 transition-all"
            >
              View All Collections &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((col, index) => (
              <Link
                key={col.slug}
                href={`/collections/${col.slug}`}
                className="relative group h-96 bg-black overflow-hidden flex flex-col justify-end p-6 border border-zinc-900 cursor-pointer block"
              >
                {/* Background Image */}
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  className="object-cover opacity-50 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />

                <div className="relative z-20 w-full space-y-2">
                  <span className="text-[9px] font-black tracking-[0.3em] text-orange-500 uppercase block">
                    Concept 0{index + 1} • {col.tag}
                  </span>
                  <h3 className="text-lg font-black tracking-wider text-white uppercase group-hover:text-orange-400 transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-[10px] text-gray-300 line-clamp-2 uppercase">
                    {col.description}
                  </p>
                  <span
                    className="inline-block text-[10px] font-bold tracking-widest text-white group-hover:text-orange-400 uppercase pt-2 transition-colors"
                  >
                    Discover Drops &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Philosophy Editorial Banner */}
      <section className="bg-black text-white py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-black tracking-[0.4em] text-orange-500 uppercase">
              Our Blueprint
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
              Crafted in India, <br />
              Worn Worldwide.
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 uppercase tracking-widest leading-relaxed">
              DRIVEN was born out of a desire to create unapologetic, high-octane luxury streetwear. Every garment is cut from custom-milled French Terry and ripstop cotton, tested for drape and durability, and finished with meticulous tactile printing techniques.
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

          <div className="lg:col-span-6 relative aspect-[4/3] bg-zinc-900 border border-zinc-800 overflow-hidden">
            <Image
              src="/images/products/black-nocturnal-hoodie.jpg"
              alt="DRIVEN Couture Process"
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
                className="bg-white text-black px-4 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-orange-500 hover:text-white transition-colors"
              >
                Shop Pieces
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Stores Section */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-2">
                Physical Spaces
              </p>
              <h2 className="text-3xl font-black tracking-tighter text-black uppercase">
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
                className="border border-gray-200 p-6 bg-zinc-50 hover:border-black transition-colors"
              >
                <span className="text-[8px] font-black tracking-widest uppercase bg-black text-white px-2 py-0.5">
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
    </main>
  );
}
