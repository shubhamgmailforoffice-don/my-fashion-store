"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { defaultReels, ReelItem } from "@/lib/reelsTypes";

export type { ReelItem };

interface ReelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reels?: ReelItem[];
}

export default function ReelsModal({ isOpen, onClose, reels: propsReels }: ReelsModalProps) {
  const [reelsList, setReelsList] = useState<ReelItem[]>(propsReels || defaultReels);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch latest reels from API when modal opens or on reels-updated event
  useEffect(() => {
    if (propsReels && propsReels.length > 0) {
      setReelsList(propsReels);
      return;
    }

    const fetchReels = async () => {
      try {
        const res = await fetch("/api/reels", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const active = data.filter((r) => r.active !== false);
            setReelsList(active.length > 0 ? active : data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch reels:", err);
      }
    };

    if (isOpen) {
      fetchReels();
    }

    const handleUpdate = () => fetchReels();
    window.addEventListener("reels-updated", handleUpdate);
    return () => window.removeEventListener("reels-updated", handleUpdate);
  }, [isOpen, propsReels]);

  // ESC key listener to always guarantee closing
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentReel = reelsList[currentIndex] || reelsList[0] || defaultReels[0];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % reelsList.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + reelsList.length) % reelsList.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      {/* Background click to dismiss */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={onClose}
        aria-label="Close modal overlay"
      />

      {/* Reel Card Container */}
      <div className="relative z-20 w-full sm:max-w-md h-full sm:h-[88vh] sm:max-h-[820px] bg-[#2C2A29] sm:rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(44,42,41,0.6)] border border-white/20 flex flex-col justify-between">
        
        {/* Top Control Bar with Highly Visible Close Button */}
        <div className="absolute top-4 inset-x-0 z-50 px-4 flex items-center justify-between pointer-events-auto">
          {/* Reel Indicator Dots */}
          <div className="flex items-center gap-1.5 bg-[#2C2A29]/75 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/25 shadow-lg">
            {reelsList.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? "w-5 bg-[#E8262A]" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>

          {/* Prominent Red-Accent Close Button (Guaranteed to Close) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="w-11 h-11 rounded-full bg-[#2C2A29]/80 hover:bg-[#E8262A] backdrop-blur-md text-white border-2 border-white/50 hover:border-[#E8262A] shadow-2xl flex items-center justify-center text-xl font-bold transition-all active:scale-90 cursor-pointer"
            aria-label="Close Reels"
            title="Close"
          >
            &times;
          </button>
        </div>

        {/* Main Photo */}
        <div className="absolute inset-0 z-10">
          <Image
            src={currentReel.image}
            alt={currentReel.name}
            fill
            className="object-cover"
            priority
          />
          {/* Vignette Gradients for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2A29] via-[#2C2A29]/30 to-[#2C2A29]/60 pointer-events-none" />
        </div>

        {/* Previous / Next Arrow Clickers on Left & Right */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#2C2A29]/70 hover:bg-[#2C2A29] backdrop-blur-xl text-white border border-white/30 shadow-xl flex items-center justify-center text-xl active:scale-95 transition-all"
          aria-label="Previous reel"
        >
          &#8249;
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#2C2A29]/70 hover:bg-[#2C2A29] backdrop-blur-xl text-white border border-white/30 shadow-xl flex items-center justify-center text-xl active:scale-95 transition-all"
          aria-label="Next reel"
        >
          &#8250;
        </button>

        {/* Bottom Section: Just Name, Price & Shop Now Button */}
        <div className="relative z-30 mt-auto p-5 pb-8 space-y-3 bg-gradient-to-t from-[#2C2A29] via-[#2C2A29]/90 to-transparent">
          {/* Garment Name & Price */}
          <div className="space-y-1 text-left">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white font-anton drop-shadow">
              {currentReel.name}
            </h2>
            <p className="text-sm font-bold text-neutral-300">
              RS. {currentReel.price.toLocaleString()}
            </p>
          </div>

          {/* Shop Now Button on Down Side (Styled in #E8262A Primary Brand Red) */}
          <div className="pt-2">
            <Link
              href={`/product/${currentReel.productId}`}
              onClick={onClose}
              className="block w-full text-center py-3.5 px-6 rounded-2xl bg-[#E8262A] hover:bg-[#d01e22] text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-98 border border-white/20"
            >
              Shop Now &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
