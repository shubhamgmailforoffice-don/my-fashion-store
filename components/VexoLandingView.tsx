"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";

interface VexoLandingViewProps {
  products: Product[];
}

export default function VexoLandingView({ products }: VexoLandingViewProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeLookIndex, setActiveLookIndex] = useState(0);

  // Auto-cycle through lookbook outfits every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLookIndex((prev) => (prev + 1) % lookbookOutfits.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const lookbookOutfits = [
    {
      title: "Tactical Aviator & Thermal Cowl",
      season: "FALL / WINTER 2026",
      tag: "Look 01",
      image: "/images/streetwear-model-2.jpg",
      leftSpec: "T-SHIRT & SHORT RUNNER / THERMAL",
      rightSpec: "10-15 DAYS DELIVERY",
      subTitle: "CARGO RUNNER & REFLECTIVE ACCENTS",
      delivery: "SHOCK PROOF SOLE",
    },
    {
      title: "Nocturnal Heavyweight Hoodie",
      season: "WINTER 2026 ATELIER",
      tag: "Look 02",
      image: "/images/streetwear-model-cap.jpg",
      leftSpec: "100% COMBED FRENCH TERRY",
      rightSpec: "EXPRESS DISPATCH",
      subTitle: "DOUBLE LINED HOOD / ZERO DRAWSTRING",
      delivery: "WEATHER SHIELD",
    },
    {
      title: "Black Tiger Bonsai Heavy Tee",
      season: "SPRING / DROP 03",
      tag: "Look 03",
      image: "/images/streetwear-tiger.jpg",
      leftSpec: "300 GSM ARCHITECTURAL COTTON",
      rightSpec: "RESTOCK READY",
      subTitle: "BOX CUT DROPPED SHOULDERS",
      delivery: "TACTICAL FINISH",
    },
    {
      title: "Crimson Betta Tactical Polo",
      season: "AUTUMN / CORE",
      tag: "Look 04",
      image: "/images/streetwear-betta.jpg",
      leftSpec: "INTERLOCK KNITTED PIQUE",
      rightSpec: "EXCLUSIVE RUN",
      subTitle: "MILITARY GRADE HARDWARE",
      delivery: "PREMIUM KNIT",
    },
  ];

  const currentLook = lookbookOutfits[activeLookIndex];

  return (
    <div className="min-h-screen bg-[#BAC2CB] dark:bg-[#060709] text-[#111111] dark:text-[#f3f4f6] transition-colors py-4 sm:py-8 px-2 sm:px-6 lg:px-10">
      
      {/* Outer Showcase Window (Exact Match to Reference Video Canvas) */}
      <div className="max-w-[1360px] mx-auto bg-[#ECEEF1] dark:bg-[#121316] rounded-[38px] sm:rounded-[46px] shadow-[0_25px_80px_rgba(0,0,0,0.18)] border border-white/60 dark:border-neutral-800 overflow-hidden">
        
        {/* ========================================================================= */}
        {/* IN-CARD TOP NAVBAR (Video 00:00 - 00:04 Replica)                         */}
        {/* ========================================================================= */}
        <header className="px-6 sm:px-10 pt-6 sm:pt-8 pb-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 select-none">
          {/* Left Links */}
          <nav className="hidden md:flex items-center gap-6 text-[11px] font-bold tracking-widest text-neutral-700 dark:text-neutral-300 uppercase">
            <Link href="/shop" className="hover:text-black dark:hover:text-white transition-colors">SHOP</Link>
            <Link href="/shop?category=Tops" className="hover:text-black dark:hover:text-white transition-colors">MEN</Link>
            <Link href="/shop?category=Bottoms" className="hover:text-black dark:hover:text-white transition-colors">WOMEN</Link>
            <Link href="/collections" className="hover:text-black dark:hover:text-white transition-colors">TRENDING</Link>
          </nav>

          {/* Center Brand Logo (VEXO / DRIIVN Stylized Monogram) */}
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-xl sm:text-2xl font-black tracking-[0.25em] text-neutral-900 dark:text-white font-mono uppercase">
                DRIIVN
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8262A] group-hover:scale-150 transition-transform" />
            </Link>
          </div>

          {/* Right Links & Action Pill */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden lg:flex items-center gap-6 text-[11px] font-bold tracking-widest text-neutral-700 dark:text-neutral-300 uppercase">
              <Link href="/collections" className="hover:text-black dark:hover:text-white transition-colors">SEASONAL</Link>
              <Link href="/shop?category=Accessories" className="hover:text-black dark:hover:text-white transition-colors">ACCESSORIES</Link>
            </div>

            {/* Sign In / Up Pill Button (Direct match to video 00:00 top right) */}
            <Link
              href="/account"
              className="bg-black hover:bg-neutral-800 text-white px-4 sm:px-5 py-2 rounded-full text-[11px] font-extrabold tracking-wider uppercase transition-all shadow-md active:scale-95"
            >
              SIGN IN / UP
            </Link>

            {/* Shopping Bag Button in Circle */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-cart"))}
              className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:scale-105 transition-all shadow-xs"
              aria-label="Open Cart Bag"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Video 00:00 - 00:04 Replica)                             */}
        {/* ========================================================================= */}
        <section className="relative px-6 sm:px-12 pt-8 sm:pt-14 pb-12 sm:pb-24 overflow-hidden select-none">
          
          {/* Centered Kinetic Headline */}
          <div className="text-center max-w-4xl mx-auto space-y-2 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-[1.05]">
                GEAR UP EVERY SEASON <br />
                <span className="tracking-wide">EVERY WORKOUT!</span>
              </h1>
            </motion.div>

            {/* Action Buttons Directly Below Headline (Matching Video Layout) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex items-center justify-center gap-4 pt-3 sm:pt-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/shop"
                  className="bg-black text-white px-6 py-2.5 rounded-full text-[11px] font-black tracking-widest uppercase transition-shadow shadow-md hover:shadow-xl"
                >
                  SHOP NOW
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/collections"
                  className="text-[11px] font-bold tracking-widest uppercase text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  EXPLORE ALL
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Hero Visual Area: Center Model + Left Avatar Card + Right Video Card */}
          <div className="relative mt-8 sm:mt-12 flex flex-col lg:flex-row items-center justify-center">
            
            {/* Left Floating Card: 3 Avatar Stack & Editorial Blurb (Video 00:00) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="lg:absolute lg:left-2 lg:bottom-8 z-20 max-w-xs mb-6 lg:mb-0"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white/90 dark:bg-[#18191c]/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/80 dark:border-neutral-700/60 shadow-xl"
              >
                <div className="flex items-center -space-x-2 mb-2.5">
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-800 bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    D1
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-800 bg-neutral-700 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    D2
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-800 bg-neutral-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    D3
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400 font-medium">
                  Stay cozy without compromising your range of motion. Our season&apos;s winter range is perfect for those chilly outdoor workouts.
                </p>
              </motion.div>
            </motion.div>

            {/* Central Model Presentation (Exact Silhouette from Video 00:01) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md aspect-[4/5] rounded-[34px] overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-2xl border-4 border-white dark:border-neutral-800 group"
            >
              <Image
                src="/images/hero-streetwear.jpg"
                alt="Tactical Streetwear Silhouette"
                fill
                priority
                className="object-cover object-top transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </motion.div>

            {/* Right Floating Card: Watch Campaign Video with Sonar Pulse Ring (Video 00:00) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:absolute lg:right-2 lg:bottom-8 z-20 w-64 sm:w-72 mt-6 lg:mt-0"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                onClick={() => setIsVideoModalOpen(true)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="bg-black text-white p-3.5 rounded-3xl border border-neutral-800 shadow-2xl cursor-pointer group select-none"
              >
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-900 mb-2.5">
                  <Image
                    src="/images/streetwear-model-2.jpg"
                    alt="Campaign Film"
                    fill
                    className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="relative flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-white/40 absolute animate-ping" />
                      <div className="w-12 h-12 rounded-full bg-white/95 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative z-10">
                        <svg className="w-5 h-5 ml-0.5 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="text-[10px] font-bold text-[#E8262A] uppercase tracking-widest">Atelier Film</p>
                    <p className="text-xs font-bold text-white tracking-wide">Watch Campaign 2026</p>
                  </div>
                  <span className="text-neutral-400 group-hover:text-white group-hover:translate-x-1 transition-all text-xs font-bold">&rarr;</span>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. SECTION 2: SLIT-SCAN BLINDS REVEAL & "W O R K O U T" WATERMARK         */}
        {/* (Exact match to Video 00:05 - 00:07)                                      */}
        {/* ========================================================================= */}
        <section className="relative py-16 sm:py-24 px-6 sm:px-12 border-t border-black/5 dark:border-white/5 overflow-hidden">
          
          {/* Giant Outline Typography Watermark: "W O R K O U T" (Video 00:05) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.06] dark:opacity-[0.04]">
            <span className="text-[130px] sm:text-[230px] font-black tracking-[0.25em] uppercase text-neutral-900 dark:text-white">
              WORKOUT
            </span>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Card & Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="md:col-span-3 space-y-4"
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-md border border-white/60 dark:border-neutral-700 group">
                <Image
                  src="/images/streetwear-model-cap.jpg"
                  alt="Performance Driven Gear"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Performance-driven gear for men — built for summer heat and winter cold.
              </p>
            </motion.div>

            {/* Center Kinetic Slit-Scan Card (Dynamic Horizontal Blinds from Video 00:05-00:06) */}
            <div className="md:col-span-6 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-sm aspect-[3/4] rounded-[34px] overflow-hidden bg-neutral-900 border-2 border-black dark:border-neutral-700 shadow-2xl flex flex-col justify-between p-2 group"
              >
                <div className="relative flex-1 rounded-[26px] overflow-hidden flex flex-col justify-between">
                  
                  {/* Dynamic Blinds that Expand & Contract to Reveal Model */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none p-1">
                    {Array.from({ length: 11 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: [1, 0.05, 0.95, 0.15, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 4.5,
                          delay: i * 0.1,
                          ease: "easeInOut",
                        }}
                        className="h-2.5 w-full bg-black/90 origin-left rounded-full"
                      />
                    ))}
                  </div>

                  <Image
                    src="/images/streetwear-model-2.jpg"
                    alt="Center Slit-Scan Hero"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Floating Badge */}
                  <div className="absolute bottom-4 inset-x-4 z-20 bg-black/75 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center shadow-xl">
                    <span className="text-[9px] font-bold tracking-[0.3em] text-[#E8262A] uppercase block mb-0.5">
                      VEXO / DRIIVN
                    </span>
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      WITH THE LATEST IN WORKOUT WEAR
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Card & Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="md:col-span-3 space-y-4"
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-md border border-white/60 dark:border-neutral-700 group">
                <Image
                  src="/images/products/tactical-cargo-pants.jpg"
                  alt="Winter Workout Wear"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Stay warm, stay fit. Our winter workout wear blends insulation with flexibility to keep you going in the toughest conditions.
              </p>
            </motion.div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. SECTION 3: "TOP WORKOUT GEAR FOR PEAK PERFORMANCE!" (Video 00:08-00:10) */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-6 sm:px-12 border-t border-black/5 dark:border-white/5 bg-white/40 dark:bg-[#16171a]/40">
          <div className="max-w-6xl mx-auto">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase block mb-1">
                  OUR TOP PICKS
                </span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-tight">
                  TOP WORKOUT GEAR FOR <br />
                  PEAK PERFORMANCE!
                </h2>
              </div>
              <p className="max-w-xs text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Discover the best of our collection, designed to power your workouts all year round.
              </p>
            </div>

            {/* Two Large Bento Split Cards (Exact Replica of Video 00:08) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              
              {/* Card 1: Sling Bag 01 / WINTER 2025 */}
              <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3 }}>
                <Link
                  href="/shop?category=Accessories"
                  className="group relative aspect-[4/4.5] rounded-[34px] overflow-hidden bg-neutral-900 shadow-xl border border-neutral-800 block select-none"
                >
                  <Image
                    src="/images/leather-bag.jpg"
                    alt="Top Workout Gear"
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-between p-6 sm:p-8">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                        01 / WINTER 2025
                      </span>
                      <span className="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-bold text-white uppercase">
                        Core Gear
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4">
                        TOP WORKOUT GEAR FOR <br />
                        PEAK PERFORMANCE!
                      </h3>
                      <span className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider group-hover:bg-[#E8262A] group-hover:text-white transition-colors shadow-lg">
                        <span>TOP SELLERS</span>
                        <span>&rarr;</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Card 2: Technical Windbreaker 02 / WINTER 2025 */}
              <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3 }}>
                <Link
                  href="/shop?category=Tops"
                  className="group relative aspect-[4/4.5] rounded-[34px] overflow-hidden bg-neutral-900 shadow-xl border border-neutral-800 block select-none"
                >
                  <Image
                    src="/images/products/star-studded-brown-hoodie.jpg"
                    alt="Latest Styles and Innovations"
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-between p-6 sm:p-8">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                        02 / WINTER 2025
                      </span>
                      <span className="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-bold text-white uppercase">
                        Innovation
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4">
                        LATEST STYLES AND <br />
                        INNOVATIONS IN WORKOUT GEAR
                      </h3>
                      <span className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider group-hover:bg-[#E8262A] group-hover:text-white transition-colors shadow-lg">
                        <span>NEW ARRIVAL</span>
                        <span>&rarr;</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. SECTION 5: "FRESH FITS FOR YOUR NEXT WORKOUT!" 8-CARD GRID             */}
        {/* (Exact match to Video 00:14 - 00:18)                                      */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-6 sm:px-12 border-t border-black/5 dark:border-white/5">
          <div className="max-w-6xl mx-auto">
            
            {/* Header Bar with Tags */}
            <div className="flex items-center justify-between pb-8 select-none">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                NEW ARRIVAL
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight text-center">
                FRESH FITS FOR YOUR <br className="sm:hidden" /> NEXT WORKOUT!
              </h2>
              <Link href="/shop" className="text-[10px] font-bold text-neutral-500 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors">
                ALL BRANDS
              </Link>
            </div>

            {/* 8-Card Grid (4 Columns x 2 Rows, Matching Video 00:15) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {products.slice(0, 8).map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="group relative bg-[#1E2024] text-white rounded-[24px] p-2.5 shadow-lg border border-neutral-800 flex flex-col justify-between overflow-hidden"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/5] rounded-[18px] overflow-hidden bg-neutral-900 mb-3">
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-106 transition-transform duration-500 opacity-90"
                    />
                    
                    {/* Top Right: "View →" Pill Button (Direct Video Replica) */}
                    <Link
                      href={`/product/${p.id}`}
                      className="absolute top-2.5 right-2.5 z-10 bg-black/60 hover:bg-white hover:text-black text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <span>View</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>

                  {/* Card Bottom Meta (Title, Price, Arrow) */}
                  <div className="p-1 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-[140px] leading-snug">
                        {p.name}
                      </h3>
                      <p className="text-[11px] font-mono font-bold text-neutral-300 mt-0.5">
                        USD {(p.price / 80).toFixed(2)}
                      </p>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-neutral-300 group-hover:bg-white group-hover:text-black transition-colors text-xs font-bold">
                      &rarr;
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Button: SEE ALL BRANDS (Black Pill) */}
            <div className="text-center mt-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all shadow-xl"
                >
                  <span>SEE ALL BRANDS</span>
                  <span>&rarr;</span>
                </Link>
              </motion.div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. SECTION 6: INTERACTIVE LOOKBOOK OUTFITS CAROUSEL (Video 00:19 - 00:24) */}
        {/* ========================================================================= */}
        <section className="relative py-18 sm:py-28 px-6 sm:px-12 border-t border-black/5 dark:border-white/5 bg-neutral-100/70 dark:bg-[#0e0f12] overflow-hidden select-none">
          
          {/* Animated Watermark Background */}
          <div className="absolute inset-0 flex items-center pointer-events-none opacity-[0.04] dark:opacity-[0.03] overflow-hidden">
            <motion.div
              animate={{ x: [-1400, 0] }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="flex whitespace-nowrap text-[90px] sm:text-[180px] font-black uppercase tracking-widest gap-16 text-neutral-900 dark:text-white"
            >
              <span>FITS FOR YOU</span>
              <span>&bull;</span>
              <span>YOUR NEXT WORKOUT</span>
              <span>&bull;</span>
              <span>DRIIVN</span>
              <span>&bull;</span>
              <span>FITS FOR YOU</span>
              <span>&bull;</span>
              <span>YOUR NEXT WORKOUT</span>
            </motion.div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            
            {/* Look Selector Indicator Pills */}
            <div className="flex items-center gap-2 mb-8 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md p-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 shadow-sm">
              {lookbookOutfits.map((look, i) => (
                <button
                  key={look.tag}
                  type="button"
                  onClick={() => setActiveLookIndex(i)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeLookIndex === i
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-md scale-105"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {look.tag}
                </button>
              ))}
            </div>

            {/* Central Outfit Card with AnimatePresence Transitions (Video 00:20 Replica) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLookIndex}
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-md aspect-[3/4] rounded-[36px] overflow-hidden bg-neutral-900 border-4 border-white dark:border-neutral-800 shadow-2xl flex flex-col justify-between p-6 sm:p-8"
              >
                <Image
                  src={currentLook.image}
                  alt={currentLook.title}
                  fill
                  className="object-cover opacity-90 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />

                {/* Card Top Meta Specs */}
                <div className="relative z-10 flex justify-between items-start text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-widest">
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <p>{currentLook.leftSpec}</p>
                    <p className="text-[#E8262A] mt-0.5">{currentLook.season}</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-right">
                    <p>{currentLook.rightSpec}</p>
                    <p className="text-neutral-400 mt-0.5">{currentLook.delivery}</p>
                  </motion.div>
                </div>

                {/* Card Bottom Meta & CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="relative z-10 pt-8 text-center"
                >
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.25em] block mb-1">
                    {currentLook.subTitle}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mb-4">
                    {currentLook.title}
                  </h3>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                    <Link
                      href="/shop"
                      className="inline-block bg-white hover:bg-neutral-200 text-black px-7 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg"
                    >
                      Shop This Fit &rarr;
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* FULLSCREEN CAMPAIGN VIDEO MODAL                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-[28px] overflow-hidden shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src="/campaign.mp4"
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-black backdrop-blur-md flex items-center justify-center text-sm font-bold transition-all shadow-lg"
                aria-label="Close Campaign Video"
              >
                &times;
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
