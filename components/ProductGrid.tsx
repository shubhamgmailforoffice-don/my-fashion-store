import { Product } from "@/lib/data";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export default function ProductGrid({ products, title, subtitle }: ProductGridProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {(title || subtitle) && (
        <div className="mb-12">
          {subtitle && (
            <p className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase mb-2">
              {subtitle}
            </p>
          )}
          {title && (
            <h2 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
              {title}
            </h2>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
