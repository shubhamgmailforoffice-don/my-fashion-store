import { collections } from "@/lib/data";
import { getDB } from "@/lib/store";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) {
    notFound();
  }

  const db = getDB();
  const matchingProducts = db.products.filter(
    (p) => p.collectionSlug.toLowerCase() === collection.slug.toLowerCase()
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Editorial Collection Hero Banner */}
      <section className="relative bg-black text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-neutral-950 to-black opacity-80" />
        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[10px] font-black tracking-[0.3em] text-orange-500 uppercase">
              {collection.concept}
            </span>
            <span className="text-gray-500">•</span>
            <span className="bg-white/10 px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase">
              {collection.tag}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase">
            {collection.name}
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto uppercase tracking-widest leading-relaxed">
            {collection.description}
          </p>

          <div className="pt-4 flex items-center justify-center gap-4 text-[10px] font-bold tracking-widest uppercase">
            <Link
              href="/collections"
              className="text-gray-400 hover:text-white transition-colors"
            >
              &larr; All Collections
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-orange-500">{matchingProducts.length} Drop Pieces</span>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-100 pb-4 mb-10 flex justify-between items-baseline">
          <h2 className="text-xs font-black tracking-widest text-black uppercase">
            Drop Catalog
          </h2>
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Showing {matchingProducts.length} Item{matchingProducts.length !== 1 ? "s" : ""}
          </span>
        </div>

        {matchingProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">
              More pieces arriving soon for {collection.name}.
            </p>
            <Link
              href="/shop"
              className="bg-black text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-orange-600 transition-colors inline-block"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-8">
            {matchingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
