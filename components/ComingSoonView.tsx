"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ComingSoonCategoryConfig } from "@/lib/comingSoonTypes";

interface ComingSoonViewProps {
  config: ComingSoonCategoryConfig;
  onExploreAll?: () => void;
  showExploreButton?: boolean;
}

export default function ComingSoonView({
  config,
  onExploreAll,
  showExploreButton = true,
}: ComingSoonViewProps) {
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const res = await fetch("/api/coming-soon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe",
          category: config.name || config.id,
          contact: contact.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(data.error || "Unable to join priority list. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full rounded-[32px] sm:rounded-[44px] overflow-hidden my-6 shadow-[0_25px_70px_-15px_rgba(44,42,41,0.25)] border border-white/80 p-3 sm:p-6 lg:p-8 bg-[#DCE4DE]">
      {/* 1. Serene Out-of-Focus Scenic Nature Backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/images/nature-scenic-bg.jpg"
          alt="Scenic Nature"
          fill
          priority
          className="object-cover blur-[3px] scale-105 opacity-90"
        />
        {/* Warm Morning Sunlight Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-amber-100/40 mix-blend-soft-light" />
      </div>

      {/* 2. Floating Luminous Frosted Glass Card Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto rounded-[28px] sm:rounded-[38px] bg-[#E8EFEA]/75 backdrop-blur-2xl border border-white/90 shadow-[0_20px_50px_-10px_rgba(44,42,41,0.14)] overflow-hidden flex flex-col justify-between min-h-[580px] sm:min-h-[640px]">
        
        {/* Top-Left Decorative Sun & Radiating Rays (Direct match to reference) */}
        <div className="absolute -top-3 -left-3 sm:top-0 sm:left-0 z-10 pointer-events-none select-none">
          <svg
            viewBox="0 0 160 160"
            className="w-28 h-28 sm:w-44 sm:h-44 text-[#F2C078] opacity-90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Sun Arc */}
            <circle cx="20" cy="20" r="42" stroke="currentColor" strokeWidth="2.5" />
            
            {/* Radiating Light Beams */}
            <line x1="20" y1="72" x2="20" y2="108" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="72" y1="20" x2="108" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="56" y1="56" x2="88" y2="88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            
            <line x1="38" y1="68" x2="52" y2="100" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="68" y1="38" x2="100" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            
            <line x1="20" y1="118" x2="20" y2="136" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="118" y1="20" x2="136" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="94" y1="94" x2="114" y2="114" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            
            <line x1="8" y1="70" x2="2" y2="96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="70" y1="8" x2="96" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Content Body */}
        <div className="relative z-20 pt-10 sm:pt-14 px-6 sm:px-12 text-center flex flex-col items-center">
          
          {/* Top Center: Brand Logo / Tree Mark */}
          <div className="flex flex-col items-center justify-center gap-1.5 mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[#2C2A29]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                {/* Stylized Geometric Pine Tree Logo */}
                <path d="M12 2L7 9h3L5 16h5v6h4v-6h5l-5-7h3L12 2z" />
              </svg>
              <span className="font-playfair text-lg sm:text-xl font-bold tracking-tight text-[#2C2A29]">
                DRIIVN ATELIER
              </span>
            </div>
            
            {/* Category / Sub-identifier */}
            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-[#555E56]">
              {config.name || "NEW DROP"} &bull; {config.releaseDate || "LAUNCHING SHORTLY"}
            </span>
          </div>

          {/* Headline (Editorial High-Fashion Serif with Warm Sparkles) */}
          <h1 className="font-playfair text-3xl sm:text-5xl lg:text-[62px] text-[#2C2A29] font-normal tracking-tight leading-[1.12] max-w-3xl mx-auto">
            We <span className="text-[#F2C078] inline-block font-sans text-xl sm:text-3xl align-middle mx-1 select-none">✦</span> Are Almost
            <br />
            Ready to Launch<span className="text-[#F2C078] inline-block font-sans text-xl sm:text-3xl align-middle ml-1 select-none">✦</span>!
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 text-xs sm:text-[14px] text-[#555E56] max-w-xl mx-auto font-sans leading-relaxed">
            Subscribe to be the first to know about all the events and get a discount on your first order!
          </p>

          {/* Category Capsule Tag */}
          {config.name && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 border border-[#F2C078]/60 text-[#7A531C] text-[10px] font-bold uppercase tracking-wider shadow-2xs backdrop-blur-xs">
                <span>✦</span>
                <span>{config.name} Capsule Collection</span>
              </span>
            </div>
          )}

          {/* Email / Contact Subscription Form */}
          <div className="w-full max-w-md mt-6 sm:mt-8">
            {isSubmitted ? (
              <div className="bg-white/90 backdrop-blur-xl border border-emerald-500/40 rounded-full px-6 py-4 text-center shadow-lg animate-in fade-in zoom-in-95 duration-200">
                <p className="text-xs sm:text-sm font-playfair font-bold text-emerald-900">
                  ✓ You&apos;re on the priority list!
                </p>
                <p className="text-[11px] text-neutral-600 mt-0.5 font-sans">
                  We will send your VIP early launch code to <span className="font-bold text-black">{contact}</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                  <input
                    type="text"
                    required
                    placeholder="Please enter your e-mail adress"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full sm:flex-1 rounded-full bg-white/95 border border-neutral-300/80 focus:border-[#F2C078] px-5 py-3 sm:py-3.5 text-xs text-[#2C2A29] placeholder:text-neutral-400 font-sans shadow-inner outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !contact.trim()}
                    className="w-full sm:w-auto px-7 py-3 sm:py-3.5 rounded-full bg-[#F2C078] hover:bg-[#EAA958] active:scale-95 text-[#2C2A29] font-playfair font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>

                {errorMessage && (
                  <p className="text-[11px] font-bold text-red-600 font-sans">
                    {errorMessage}
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Optional Explorer Navigation Links */}
          {showExploreButton && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {onExploreAll ? (
                <button
                  type="button"
                  onClick={onExploreAll}
                  className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#3D453E] hover:text-[#2C2A29] underline transition-colors"
                >
                  &larr; Browse All In-Stock Categories
                </button>
              ) : (
                <Link
                  href="/shop"
                  className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#3D453E] hover:text-[#2C2A29] underline transition-colors"
                >
                  &larr; Explore Available Drops
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 3. Bottom Artistic Vector Landscape (Hills, Pines & Heron Bird - Exact Match to Screenshot) */}
        <div className="relative w-full mt-6 sm:mt-10 overflow-hidden pointer-events-none select-none leading-none">
          <svg
            viewBox="0 0 1000 240"
            className="w-full h-auto min-h-[140px] max-h-[240px] object-cover pointer-events-none select-none block"
            preserveAspectRatio="xMidYMax slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ground / Hills Base Fill in Warm Ochre */}
            <path
              d="M-20,240 L-20,130 C15,100 45,95 70,120 C95,95 135,95 160,118 C185,102 215,108 230,132 C255,122 285,128 305,152 C340,172 380,182 430,185 L1020,185 L1020,240 Z"
              fill="#F2BF7A"
              stroke="#2C2A29"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Left Shrubbery Contours */}
            <path d="M25,138 C40,120 70,124 85,148" stroke="#2C2A29" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M100,132 C122,114 150,122 162,148" stroke="#2C2A29" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M170,140 C190,128 212,138 222,162" stroke="#2C2A29" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M30,165 C55,145 80,152 95,178" stroke="#2C2A29" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Center Pine Tree Silhouettes */}
            {/* Pine 1 */}
            <g transform="translate(340, 110)">
              <path d="M18,0 L6,18 L12,18 L3,36 L9,36 L0,55 L36,55 L27,36 L33,36 L24,18 L30,18 Z" fill="#2C2A29" />
              <rect x="16" y="55" width="4" height="25" fill="#2C2A29" />
            </g>
            {/* Pine 2 (Taller) */}
            <g transform="translate(375, 85)">
              <path d="M22,0 L8,24 L15,24 L4,46 L12,46 L0,70 L44,70 L32,46 L40,46 L29,24 L36,24 Z" fill="#2C2A29" />
              <rect x="19.5" y="70" width="5" height="30" fill="#2C2A29" />
            </g>
            {/* Pine 3 */}
            <g transform="translate(420, 120)">
              <path d="M16,0 L5,16 L10,16 L2,32 L8,32 L0,48 L32,48 L24,32 L30,32 L22,16 L27,16 Z" fill="#2C2A29" />
              <rect x="14" y="48" width="4" height="20" fill="#2C2A29" />
            </g>
            {/* Pine 4 */}
            <g transform="translate(540, 115)">
              <path d="M18,0 L6,18 L12,18 L3,36 L9,36 L0,55 L36,55 L27,36 L33,36 L24,18 L30,18 Z" fill="#2C2A29" />
              <rect x="16" y="55" width="4" height="22" fill="#2C2A29" />
            </g>
            {/* Pine 5 (Taller) */}
            <g transform="translate(580, 80)">
              <path d="M24,0 L9,26 L16,26 L4,50 L13,50 L0,76 L48,76 L35,50 L44,50 L32,26 L39,26 Z" fill="#2C2A29" />
              <rect x="21" y="76" width="6" height="32" fill="#2C2A29" />
            </g>
            {/* Pine 6 */}
            <g transform="translate(635, 105)">
              <path d="M18,0 L6,20 L12,20 L3,40 L9,40 L0,62 L36,62 L27,40 L33,40 L24,20 L30,20 Z" fill="#2C2A29" />
              <rect x="16" y="62" width="4" height="25" fill="#2C2A29" />
            </g>
            {/* Pine 7 (Small) */}
            <g transform="translate(675, 130)">
              <path d="M14,0 L4,14 L9,14 L2,28 L7,28 L0,42 L28,42 L21,28 L26,28 L19,14 L24,14 Z" fill="#2C2A29" />
              <rect x="12" y="42" width="4" height="18" fill="#2C2A29" />
            </g>

            {/* Right Rocky Cliff & Outcropping */}
            <path
              d="M710,240 C730,210 750,195 780,185 C810,175 830,150 860,140 C890,128 920,85 960,78 C990,72 1010,85 1025,95 L1025,240 Z"
              fill="#F2BF7A"
              stroke="#2C2A29"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Cliff Contour Lines */}
            <path d="M805,190 C830,172 870,165 910,175" stroke="#2C2A29" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M865,150 C895,135 935,130 970,140" stroke="#2C2A29" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M920,105 C945,95 975,100 995,115" stroke="#2C2A29" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Elegant Heron / Crane Bird perched on the cliff */}
            <g transform="translate(760, 45)">
              {/* Legs */}
              <line x1="88" y1="125" x2="84" y2="155" stroke="#2C2A29" strokeWidth="3" strokeLinecap="round" />
              <line x1="84" y1="155" x2="72" y2="157" stroke="#2C2A29" strokeWidth="3" strokeLinecap="round" />
              <line x1="98" y1="125" x2="102" y2="154" stroke="#2C2A29" strokeWidth="3" strokeLinecap="round" />
              <line x1="102" y1="154" x2="92" y2="156" stroke="#2C2A29" strokeWidth="3" strokeLinecap="round" />

              {/* Body & Wing */}
              <path
                d="M55,30 C30,35 2,42 0,44 C12,47 28,47 42,44 C40,55 45,72 58,85 C72,98 90,105 110,105 C132,105 145,85 140,65 C135,45 118,35 95,34 C82,34 70,22 62,12 C58,6 50,0 45,2 C42,4 45,10 50,15 C55,20 62,24 55,30 Z"
                fill="#C5CED6"
                stroke="#2C2A29"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Wing Feather Line */}
              <path d="M68,55 C78,75 92,85 115,85 C128,85 135,75 132,60" stroke="#2C2A29" strokeWidth="2.5" fill="none" />
              <path d="M80,68 C90,82 105,88 122,85" stroke="#2C2A29" strokeWidth="2" fill="none" />

              {/* Eye */}
              <circle cx="48" cy="10" r="2" fill="#2C2A29" />

              {/* Beak */}
              <path d="M42,12 L0,22 L40,16 Z" fill="#2C2A29" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
