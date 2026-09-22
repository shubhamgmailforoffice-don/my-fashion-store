import { collections } from "@/lib/data";
import { getDB } from "@/lib/store";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CollectionsPage() {
  const db = getDB();

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 pb-8 mb-14 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-3">
          BLUORNG DESIGN ARCHIVES
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-widest text-black uppercase">
          Collections
        </h1>
        <p className="text-xs text-gray-500 tracking-widest uppercase mt-2">
          Discover our conceptual drops, seasonal streetwear programs, and limited capsules.
        </p>
      </div>

      {/* Grid of Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {collections.map((col) => {
          const matchingCount = db.products.filter(
            (p) => p.collectionSlug?.toLowerCase() === col.slug.toLowerCase()
          ).length;

          return (
            <div
              key={col.slug}
              className="border border-gray-100 flex flex-col justify-between p-8 bg-zinc-50 hover:bg-zinc-100/60 transition-all duration-300 group"
            >
              {/* Concept Image Preview */}
              <div className="relative aspect-[16/9] w-full mb-6 overflow-hidden bg-gray-200">
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-3 left-3 bg-black text-white px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase">
                  {col.tag}
                </div>
              </div>

              {/* Concept Meta */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-[9px] font-black tracking-widest text-orange-500 uppercase">
                    {col.concept}
                  </span>
                  <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                    {matchingCount} DROP PIECES
                  </span>
                </div>

                <h2 className="text-2xl font-black tracking-widest text-black uppercase">
                  {col.name}
                </h2>

                <p className="text-xs text-gray-500 tracking-wide leading-relaxed uppercase">
                  {col.description}
                </p>
              </div>

              {/* Action */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                <Link
                  href={`/collections/${col.slug}`}
                  className="bg-black text-white hover:bg-orange-600 px-6 py-3 text-xs font-bold tracking-widest uppercase text-center transition-colors inline-block"
                >
                  View Collection Drops &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign Banner */}
      <section className="mt-20 relative h-[45vh] bg-black overflow-hidden flex items-center justify-center p-8 border border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-neutral-950 to-black opacity-80" />

        <div className="relative z-20 text-center space-y-4 max-w-2xl">
          <p className="text-[10px] font-black tracking-[0.4em] text-orange-500 uppercase">
            Special Drop Vault
          </p>
          <h3 className="text-3xl font-black tracking-widest text-white uppercase">
            BLIND BOX 26 SERIES
          </h3>
          <p className="text-xs text-gray-300 tracking-wider uppercase leading-relaxed">
            Unbox the unexpected. Containing serialized premium garments, rare sample archive pieces, and exclusive collectible prints.
          </p>
          <div className="pt-2">
            <Link
              href="/product/5"
              className="bg-white text-black hover:bg-orange-600 hover:text-white px-8 py-3.5 text-xs font-black tracking-widest uppercase transition-colors inline-block"
            >
              Order Blind Box
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
