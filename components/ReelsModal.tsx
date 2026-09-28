"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export interface ReelItem {
  id: string;
  title: string;
  subtitle: string;
  dropName: string;
  image: string;
  productId: string;
  productName: string;
  productPrice: number;
  likes: number;
  tags: string[];
}

const REELS_DATA: ReelItem[] = [
  {
    id: "reel-1",
    title: "NOCTURNAL RUNWAY 2026",
    subtitle: "Heavyweight 420 GSM French Terry Cut",
    dropName: "DROP 01 / TOKYO MIDNIGHT",
    image: "/images/hero-streetwear.jpg",
    productId: "2",
    productName: "BLACK NOCTURNAL HOODIE",
    productPrice: 6999,
    likes: 1420,
    tags: ["#Streetwear", "#Heavyweight", "#Editorial"],
  },
  {
    id: "reel-2",
    title: "SILENT RAGE & BONSAI GRAPHICS",
    subtitle: "Tactile High-Density Flock & Foil Print",
    dropName: "DROP 02 / ARCHIVE EMBROIDERY",
    image: "/images/streetwear-tiger.jpg",
    productId: "102",
    productName: "BLACK TIGER BONSAI T-SHIRT",
    productPrice: 8900,
    likes: 2180,
    tags: ["#BonsaiTiger", "#LuxuryStreetwear", "#Drops"],
  },
  {
    id: "reel-3",
    title: "PURPLE DRAGONFLY VIOLET DYE",
    subtitle: "Custom Garment Pigment Wash with Velvet Touch",
    dropName: "DROP 03 / CHROMATIC SERIES",
    image: "/images/streetwear-dragonfly.jpg",
    productId: "101",
    productName: "PURPLE DRAGONFLY NAVY T-SHIRT",
    productPrice: 4700,
    likes: 980,
    tags: ["#PigmentDye", "#VelvetTouch", "#DRIIVN"],
  },
  {
    id: "reel-4",
    title: "FULL GRAIN ARCHIVE LEATHER",
    subtitle: "Handcrafted Matte Hardware & Jacquard Weave",
    dropName: "ACCESSORIES / LEATHER ATELIER",
    image: "/images/leather-bag.jpg",
    productId: "104",
    productName: "NOCTURNAL LEATHER MESSENGER BAG",
    productPrice: 14500,
    likes: 3120,
    tags: ["#FullGrain", "#LeatherAtelier", "#SoldOutSoon"],
  },
  {
    id: "reel-5",
    title: "RACING CLUB SPEEDWAY HOODIE",
    subtitle: "Vintage Distressed Motorsport Typography",
    dropName: "DROP 05 / VINTAGE SPEED",
    image: "/images/streetwear-model-cap.jpg",
    productId: "1",
    productName: "RACING CLUB OVERSIZED T-SHIRT",
    productPrice: 4499,
    likes: 1850,
    tags: ["#Motorsport", "#Speedway", "#Oversized"],
  },
];

interface ReelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickAdd?: (product: { id: string; name: string; price: number; image: string }) => void;
}

export default function ReelsModal({ isOpen, onClose, onQuickAdd }: ReelsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    REELS_DATA.forEach((r) => {
      init[r.id] = r.likes;
    });
    return init;
  });
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  const currentReel = REELS_DATA[currentIndex];

  // Auto-advance reels every 6 seconds when playing
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REELS_DATA.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, currentIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % REELS_DATA.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + REELS_DATA.length) % REELS_DATA.length);
  };

  const toggleLike = (reelId: string) => {
    const liked = isLiked[reelId];
    setIsLiked((prev) => ({ ...prev, [reelId]: !liked }));
    setLikeCounts((prev) => ({
      ...prev,
      [reelId]: prev[reelId] + (liked ? -1 : 1),
    }));
    if (!liked) {
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 900);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Background click to dismiss on desktop */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Reel Phone Container */}
      <div className="relative w-full sm:max-w-md h-full sm:h-[88vh] sm:max-h-[820px] bg-black sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
        
        {/* Progress Bar Header */}
        <div className="absolute top-0 inset-x-0 z-30 pt-3 px-3 flex gap-1.5 pointer-events-none">
          {REELS_DATA.map((reel, idx) => (
            <div
              key={reel.id}
              className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  idx < currentIndex
                    ? "w-full"
                    : idx === currentIndex
                    ? "w-full animate-[pulse_1.5s_infinite]"
                    : "w-0"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Top Controls Bar */}
        <div className="absolute top-6 inset-x-0 z-30 px-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              DRIIVN REELS &bull; {currentReel.dropName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white border border-white/20 text-xs"
              aria-label="Toggle Sound"
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white border border-white/20 text-base"
              aria-label="Close Reels"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Main Media Background */}
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <Image
            src={currentReel.image}
            alt={currentReel.title}
            fill
            className="object-cover"
            priority
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

          {/* Big Heart Animation on Double Tap / Like */}
          {showHeartAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
              <span className="text-7xl">❤️</span>
            </div>
          )}

          {/* Pause overlay icon */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white text-2xl">
                ▶
              </div>
            </div>
          )}
        </div>

        {/* Tap areas for Prev & Next Navigation */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-0 inset-y-20 w-1/4 z-20 cursor-w-resize"
          title="Previous drop"
        />
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-0 inset-y-20 w-1/4 z-20 cursor-e-resize"
          title="Next drop"
        />

        {/* Right Floating Actions (Like, Share, Sound) */}
        <div className="absolute right-3 bottom-32 z-30 flex flex-col items-center gap-4 text-white">
          {/* Like Heart */}
          <button
            onClick={() => toggleLike(currentReel.id)}
            className="flex flex-col items-center gap-1 group active:scale-125 transition-transform"
          >
            <div
              className={`w-11 h-11 rounded-full backdrop-blur-xl border border-white/20 flex items-center justify-center transition-colors ${
                isLiked[currentReel.id]
                  ? "bg-red-600 text-white border-red-500"
                  : "bg-black/50 text-white group-hover:bg-black/80"
              }`}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <span className="text-[10px] font-black tracking-wider text-white drop-shadow">
              {likeCounts[currentReel.id]?.toLocaleString()}
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.origin + `/product/${currentReel.productId}`);
                alert("Lookbook reel link copied to clipboard!");
              }
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white group-hover:bg-black/80 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <span className="text-[10px] font-black tracking-wider text-white drop-shadow">
              Share
            </span>
          </button>

          {/* Lookbook Badge */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 flex items-center justify-center text-xs font-black">
              {currentIndex + 1}/{REELS_DATA.length}
            </div>
            <span className="text-[9px] font-bold text-neutral-300">Look</span>
          </div>
        </div>

        {/* Bottom Drawer Overlay: Product Details & Shop CTA */}
        <div className="relative z-30 p-4 pb-6 bg-gradient-to-t from-black via-black/95 to-transparent space-y-3">
          {/* Reel Caption */}
          <div>
            <h2 className="text-base font-black tracking-tight text-white uppercase drop-shadow">
              {currentReel.title}
            </h2>
            <p className="text-xs text-neutral-300 font-medium tracking-wide">
              {currentReel.subtitle}
            </p>
            <div className="flex gap-2 mt-1">
              {currentReel.tags.map((tag) => (
                <span key={tag} className="text-[10px] text-blue-400 font-bold">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Attached Product Card Overlay */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-2xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0 border border-white/20">
                <Image
                  src={currentReel.image}
                  alt={currentReel.productName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">
                  Featured Garment
                </p>
                <h4 className="text-xs font-black text-white uppercase truncate tracking-wider">
                  {currentReel.productName}
                </h4>
                <p className="text-xs font-bold text-neutral-200">
                  RS. {currentReel.productPrice.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Link
                href={`/product/${currentReel.productId}`}
                onClick={onClose}
                className="bg-white text-black hover:bg-orange-500 hover:text-white px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-lg"
              >
                Shop Now &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
