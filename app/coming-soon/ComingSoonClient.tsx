"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ComingSoonData, ComingSoonCategoryConfig, defaultComingSoonConfigs } from "@/lib/comingSoonTypes";
import ComingSoonView from "@/components/ComingSoonView";
import Link from "next/link";

interface ComingSoonClientProps {
  initialData: ComingSoonData;
}

export default function ComingSoonClient({ initialData }: ComingSoonClientProps) {
  const searchParams = useSearchParams();
  const requestedCat = searchParams.get("category");

  const categoriesMap = initialData?.categories || defaultComingSoonConfigs;
  const categoriesList = Object.values(categoriesMap);

  // Determine active category config
  const matched = requestedCat
    ? categoriesList.find(
        (c) => c.id.toLowerCase() === requestedCat.toLowerCase() || c.name.toLowerCase() === requestedCat.toLowerCase()
      )
    : null;

  const [activeCategory, setActiveCategory] = useState<string>(
    matched ? matched.id : categoriesList[0]?.id || "Tops"
  );

  const currentConfig: ComingSoonCategoryConfig =
    categoriesMap[activeCategory] ||
    defaultComingSoonConfigs[activeCategory] || {
      id: activeCategory,
      name: activeCategory,
      enabled: true,
      autoWhenEmpty: true,
      title: `${activeCategory.toUpperCase()} DROP COMING SOON`,
      subtitle: "NEW CAPSULE COLLECTION IN PRODUCTION",
      description: "Our atelier is currently manufacturing pieces for this category. Register below for early VIP access.",
      releaseDate: "DROPPING SHORTLY",
      bannerImage: "/images/hero-streetwear.jpg",
      badge: "PRODUCTION IN PROGRESS",
    };

  return (
    <div className="min-h-screen bg-[#E8E6DF] py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-300 pb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E8262A] block font-inter">
              Upcoming Atelier Releases
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black font-anton mt-0.5">
              Coming Soon Drops
            </h1>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-black hover:bg-[#E8262A] text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full transition-colors w-fit"
          >
            <span>&larr; Shop Live Drops</span>
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {categoriesList.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  isSelected
                    ? "bg-[#E8262A] text-white shadow-md scale-102"
                    : "bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Showcase Component */}
        <ComingSoonView config={currentConfig} showExploreButton={true} />
      </div>
    </div>
  );
}
