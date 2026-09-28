import Link from "next/link";
import { Product } from "@/lib/data";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    href: string;
    theme?: "light" | "dark";
  };
}

export default function ProductGrid({
  products,
  title,
  subtitle,
  actionButton,
}: ProductGridProps) {
  return (
    <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {(title || subtitle || actionButton) && (
        <div className="flex items-center justify-between pb-6 mb-2">
          <div>
            {subtitle && (
              <p className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-neutral-900">
                {title}
              </h2>
            )}
          </div>

          {actionButton && (
            <Link
              href={actionButton.href}
              className={`rounded-full px-4 py-1.5 text-[11px] font-bold tracking-tight transition-all active:scale-95 shadow-2xs whitespace-nowrap backdrop-blur-md ${
                actionButton.theme === "dark"
                  ? "bg-black/90 text-white hover:bg-[#E8262A] border border-white/20"
                  : "bg-white/70 hover:bg-white text-neutral-900 border border-white/80"
              }`}
            >
              {actionButton.label}
            </Link>
          )}
        </div>
      )}

      {/* 2-column mobile grid matching Screenshot 2 & 4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
