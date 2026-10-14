import { collections } from "@/lib/data";
import { getAsyncProducts } from "@/lib/store";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CollectionsPage() {
  const products = await getAsyncProducts();

  return (
    <div className="min-h-screen py-8 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* WiDK Style Rounded Container Card */}
      <div className="bg-white dark:bg-[#151618] rounded-[32px] p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.05)] border border-neutral-200/70 dark:border-neutral-800/80">
        
        {/* Header */}
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-8 mb-10 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] text-[#E8262A] uppercase mb-2">
            DRIIVN DESIGN ARCHIVES
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-white uppercase">
            Collections
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 tracking-wider uppercase mt-2 max-w-xl mx-auto">
            Discover our conceptual drops, seasonal streetwear programs, and collectible limited capsules.
          </p>
        </div>

        {/* Grid of Concept Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((col) => {
            const matchingCount = products.filter(
              (p) => p.collectionSlug?.toLowerCase() === col.slug.toLowerCase()
            ).length;

            return (
              <Link
                key={col.slug}
                href={`/collections/${col.slug}`}
                className="rounded-[28px] border border-neutral-200/70 dark:border-neutral-800 flex flex-col justify-between p-6 sm:p-7 bg-neutral-50/70 dark:bg-[#1A1C20] hover:shadow-xl transition-all duration-300 group cursor-pointer block select-none"
              >
                {/* Concept Image Preview */}
                <div className="relative aspect-[16/9] w-full mb-6 overflow-hidden rounded-[20px] bg-neutral-200 dark:bg-neutral-800">
                  <Image
                    src={col.image}
                    alt={col.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />
                  <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase rounded-full backdrop-blur-md">
                    {col.tag}
                  </div>
                </div>

                {/* Concept Meta */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-200/60 dark:border-neutral-700 pb-2">
                    <span className="text-[10px] font-black tracking-widest text-[#E8262A] uppercase">
                      {col.concept}
                    </span>
                    <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                      {matchingCount} DROP PIECES
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white uppercase group-hover:text-[#E8262A] transition-colors">
                    {col.name}
                  </h2>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 tracking-wide leading-relaxed">
                    {col.description}
                  </p>
                </div>

                {/* Action */}
                <div className="mt-6 pt-5 border-t border-neutral-200/60 dark:border-neutral-700 flex items-center justify-between">
                  <span className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black px-6 py-2.5 text-xs font-black tracking-widest uppercase rounded-full transition-all shadow-md inline-block">
                    View Drops &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Campaign Banner */}
        <div className="mt-12 rounded-[28px] overflow-hidden bg-black text-white p-8 sm:p-12 relative flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl text-center md:text-left z-10">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#E8262A] uppercase">
              NEW CAMPAIGN
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
              Heavyweight Atelier 2026
            </h3>
            <p className="text-xs text-neutral-400 tracking-wider">
              Engineered with 480 GSM organic cotton, reinforced double needle seams, and architectural boxy silhouettes.
            </p>
          </div>
          <Link
            href="/shop"
            className="z-10 bg-white text-black hover:bg-[#E8262A] hover:text-white px-7 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg whitespace-nowrap"
          >
            Shop The Capsule &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
