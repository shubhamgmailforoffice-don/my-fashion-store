import { collections } from "@/lib/data";
import { getAsyncProducts } from "@/lib/store";
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

  const products = await getAsyncProducts();
  const matchingProducts = products.filter(
    (p) => (p.collectionSlug || "").toLowerCase() === collection.slug.toLowerCase()
  );

  return (
    <div className="min-h-screen py-8 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Editorial Collection Hero Banner (WiDK Rounded Card Style) */}
      <section className="relative rounded-[32px] overflow-hidden bg-neutral-900 text-white py-16 sm:py-20 px-6 sm:px-12 border border-neutral-800 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-black opacity-90" />
        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#E8262A] uppercase">
              {collection.concept}
            </span>
            <span className="text-neutral-500">•</span>
            <span className="bg-white/10 px-3 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase">
              {collection.tag}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            {collection.name}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto tracking-wide leading-relaxed">
            {collection.description}
          </p>

          <div className="pt-3 flex items-center justify-center gap-4 text-xs font-bold tracking-wider uppercase">
            <Link
              href="/collections"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              &larr; All Collections
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-[#E8262A]">{matchingProducts.length} Drop Pieces</span>
          </div>
        </div>
      </section>

      {/* Products Grid in WiDK Container Card */}
      <div className="bg-white dark:bg-[#151618] rounded-[32px] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] border border-neutral-200/70 dark:border-neutral-800/80">
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-8 flex justify-between items-center">
          <h2 className="text-sm font-black tracking-wider text-neutral-900 dark:text-white uppercase">
            Drop Catalog
          </h2>
          <span className="text-xs font-semibold text-neutral-400 uppercase">
            Showing {matchingProducts.length} Item{matchingProducts.length !== 1 ? "s" : ""}
          </span>
        </div>

        {matchingProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
            <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase mb-4">
              More pieces arriving soon for {collection.name}.
            </p>
            <Link
              href="/shop"
              className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all shadow-md inline-block"
            >
              Explore All Drops &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-10">
            {matchingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
