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
    <div className="min-h-screen bg-[#E5ECE7] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#7A531C] block">
              ✦ Exclusive Upcoming Drops ✦
            </span>
            <h1 className="text-3xl sm:text-4xl font-playfair font-bold tracking-tight text-[#2C2A29] mt-1">
              Coming Soon Drops
            </h1>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-white/85 hover:bg-white text-[#2C2A29] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full border border-white/90 shadow-sm backdrop-blur-md transition-all active:scale-95 w-fit"
          >
            <span>&larr; Shop Live Drops</span>
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {categoriesList.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#F2C078] text-[#2C2A29] font-bold shadow-md scale-105 border border-[#EAA958]"
                    : "bg-white/70 hover:bg-white text-[#2C2A29] font-medium border border-white/80 backdrop-blur-md shadow-2xs"
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
