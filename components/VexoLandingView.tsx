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

  // Auto-cycle through lookbook outfits every 4.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLookIndex((prev) => (prev + 1) % lookbookOutfits.length);
    }, 4200);
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
    <div className="h-screen w-full bg-[#BAC2CB] dark:bg-[#060709] text-[#111111] dark:text-[#f3f4f6] transition-colors p-2 sm:p-5 lg:p-7 overflow-hidden select-none">
      
      {/* Scroll-Snap Container (Exact Screen-by-Screen Scroll Matching the Video) */}
      <div className="h-full w-full max-w-[1360px] mx-auto bg-[#ECEEF1] dark:bg-[#121316] rounded-[34px] sm:rounded-[46px] shadow-[0_25px_80px_rgba(0,0,0,0.18)] border border-white/60 dark:border-neutral-800 overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar">
        
        {/* ========================================================================= */}
        {/* SCREEN 1: HERO SECTION (Video 00:00 - 00:04)                              */}
        {/* ========================================================================= */}
        <section className="min-h-full w-full snap-start snap-always flex flex-col justify-between px-6 sm:px-12 pt-6 sm:pt-8 pb-10 sm:pb-12 relative overflow-hidden">
          
          {/* Top In-Card Navbar */}
          <header className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
            <nav className="hidden md:flex items-center gap-6 text-[11px] font-bold tracking-widest text-neutral-700 dark:text-neutral-300 uppercase">
              <Link href="/shop" className="hover:text-black dark:hover:text-white transition-colors">SHOP</Link>
              <Link href="/shop?category=Tops" className="hover:text-black dark:hover:text-white transition-colors">MEN</Link>
              <Link href="/shop?category=Bottoms" className="hover:text-black dark:hover:text-white transition-colors">WOMEN</Link>
              <Link href="/collections" className="hover:text-black dark:hover:text-white transition-colors">TRENDING</Link>
            </nav>

            {/* Center Brand Monogram */}
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-xl sm:text-2xl font-black tracking-[0.25em] text-neutral-900 dark:text-white font-mono uppercase">
                DRIIVN
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8262A] group-hover:scale-150 transition-transform" />
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden lg:flex items-center gap-6 text-[11px] font-bold tracking-widest text-neutral-700 dark:text-neutral-300 uppercase">
                <Link href="/collections" className="hover:text-black dark:hover:text-white transition-colors">SEASONAL</Link>
                <Link href="/shop?category=Accessories" className="hover:text-black dark:hover:text-white transition-colors">ACCESSORIES</Link>
              </div>

              <Link
                href="/account"
                className="bg-black hover:bg-neutral-800 text-white px-4 sm:px-5 py-2 rounded-full text-[11px] font-extrabold tracking-wider uppercase transition-all shadow-md active:scale-95"
              >
                SIGN IN / UP
              </Link>

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

          {/* Center Kinetic Headline */}
          <div className="text-center max-w-4xl mx-auto space-y-2 pt-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-[1.05]"
            >
              GEAR UP EVERY SEASON <br />
              <span className="tracking-wide text-neutral-900 dark:text-white">
                EVERY WORKOUT!
              </span>
            </motion.h1>

            {/* Small Action Buttons Directly Below Headline */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                <Link
                  href="/shop"
                  className="bg-black text-white px-5 py-2 rounded-full text-[10px] sm:text-[11px] font-black tracking-widest uppercase transition-shadow shadow-md hover:shadow-xl"
                >
                  SHOP NOW
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                <Link
                  href="/collections"
                  className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  EXPLORE ALL
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Hero Visual Area: Center Model + Left Floating Social Proof + Right Campaign Video Card */}
          <div className="relative mt-4 flex flex-col lg:flex-row items-center justify-center">
            
            {/* Left Floating Card: 3 Avatars + Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:absolute lg:left-2 lg:bottom-4 z-20 max-w-[270px] hidden sm:block"
            >
              <div className="bg-white/90 dark:bg-[#18191c]/90 backdrop-blur-xl p-3.5 sm:p-4 rounded-3xl border border-white/80 dark:border-neutral-700/60 shadow-xl">
                <div className="flex items-center -space-x-2 mb-2">
                  <div className="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-800 bg-neutral-900 text-white flex items-center justify-center text-[9px] font-bold">D1</div>
                  <div className="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-800 bg-neutral-700 text-white flex items-center justify-center text-[9px] font-bold">D2</div>
                  <div className="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-800 bg-neutral-500 text-white flex items-center justify-center text-[9px] font-bold">D3</div>
                </div>
                <p className="text-[10px] leading-relaxed text-neutral-600 dark:text-neutral-400 font-medium">
                  Stay cozy without compromising your range of motion. Our season&apos;s winter range is perfect for those chilly outdoor workouts.
                </p>
              </div>
            </motion.div>

            {/* Central Model Presentation (Smooth Dynamic Zoom Matching Video) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: [0.95, 1.03, 0.98, 1] }}
              transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="relative w-full max-w-[340px] sm:max-w-md aspect-[4/4.6] rounded-[32px] overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-2xl border-4 border-white dark:border-neutral-800 group"
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

            {/* Right Floating Card: Watch Campaign Video Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:absolute lg:right-2 lg:bottom-4 z-20 w-60 sm:w-68 mt-4 lg:mt-0"
            >
              <div
                onClick={() => setIsVideoModalOpen(true)}
                className="bg-black text-white p-3 rounded-3xl border border-neutral-800 shadow-2xl cursor-pointer group hover:scale-105 transition-all select-none"
              >
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-900 mb-2">
                  <Image
                    src="/images/streetwear-model-2.jpg"
                    alt="Campaign Film"
                    fill
                    className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="relative flex items-center justify-center">
                      <span className="w-10 h-10 rounded-full bg-white/40 absolute animate-ping" />
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg relative z-10">
                        <svg className="w-4 h-4 ml-0.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="text-[9px] font-bold text-[#E8262A] uppercase tracking-widest">Atelier Film</p>
                    <p className="text-[11px] font-bold text-white tracking-wide">Watch Campaign 2026</p>
                  </div>
                  <span className="text-neutral-400 group-hover:text-white transition-colors text-xs font-bold">&rarr;</span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Scroll Down Indicator */}
          <div className="text-center pt-2 text-[10px] font-bold text-neutral-400 tracking-widest uppercase flex items-center justify-center gap-1.5 animate-bounce">
            <span>Scroll Down to Explore</span>
            <span>&darr;</span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SCREEN 2: 1ST SCROLL - SLIT-SCAN BLINDS & "WORKOUT" (Video 00:05 - 00:07) */}
        {/* ========================================================================= */}
        <section className="min-h-full w-full snap-start snap-always flex flex-col justify-center px-6 sm:px-12 py-12 relative overflow-hidden border-t border-black/5 dark:border-white/5">
          
          {/* Giant Outline Typography Watermark: "W O R K O U T" (Exact Video Replica) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.06] dark:opacity-[0.04]">
            <motion.span
              animate={{ letterSpacing: ["0.2em", "0.28em", "0.2em"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="text-[110px] sm:text-[210px] font-black uppercase text-neutral-900 dark:text-white"
            >
              WORKOUT
            </motion.span>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            {/* Left Card & Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7 }}
              className="md:col-span-3 space-y-3"
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-md border border-white/60 dark:border-neutral-700 group">
                <Image
                  src="/images/streetwear-model-cap.jpg"
                  alt="Performance Driven Gear"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Performance-driven gear for men — built for summer heat and winter cold.
              </p>
            </motion.div>

            {/* Center Slit-Scan Card: Dynamic Blinds Opening to Reveal Model */}
            <div className="md:col-span-6 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-sm aspect-[3/4] rounded-[34px] overflow-hidden bg-neutral-900 border-2 border-black dark:border-neutral-700 shadow-2xl flex flex-col justify-between p-2 group"
              >
                <div className="relative flex-1 rounded-[26px] overflow-hidden flex flex-col justify-between">
                  
                  {/* The Horizontal Blinds Mask: Animated ScaleY Opening and Closing */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none p-1">
                    {Array.from({ length: 11 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 1 }}
                        animate={{ scaleY: [1, 0.04, 0.9, 0.1, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 4.5,
                          delay: i * 0.08,
                          ease: "easeInOut",
                        }}
                        className="h-2.5 w-full bg-black origin-center rounded-full"
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
                  <div className="absolute bottom-4 inset-x-4 z-20 bg-black/75 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center shadow-xl">
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
              viewport={{ once: false }}
              transition={{ duration: 0.7 }}
              className="md:col-span-3 space-y-3"
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-md border border-white/60 dark:border-neutral-700 group">
                <Image
                  src="/images/products/tactical-cargo-pants.jpg"
                  alt="Winter Workout Wear"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Stay warm, stay fit. Our winter workout wear blends insulation with flexibility to keep you going in the toughest conditions.
              </p>
            </motion.div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SCREEN 3: 2ND SCROLL - TOP WORKOUT GEAR BENTO (Video 00:08 - 00:10)       */}
        {/* ========================================================================= */}
        <section className="min-h-full w-full snap-start snap-always flex flex-col justify-center px-6 sm:px-12 py-12 relative bg-white/40 dark:bg-[#16171a]/40 border-t border-black/5 dark:border-white/5">
          <div className="max-w-5xl mx-auto w-full">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase block mb-1">
                  OUR TOP PICKS
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-tight">
                  TOP WORKOUT GEAR FOR <br />
                  PEAK PERFORMANCE!
                </h2>
              </div>
              <p className="max-w-xs text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Discover the best of our collection, designed to power your workouts all year round.
              </p>
            </div>

            {/* Two Large Bento Split Cards (Video 00:08 Exact Replica) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: 01 / WINTER 2025 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -6 }}
              >
                <Link
                  href="/shop?category=Accessories"
                  className="group relative aspect-[4/4.2] rounded-[32px] overflow-hidden bg-neutral-900 shadow-xl border border-neutral-800 block select-none"
                >
                  <Image
                    src="/images/leather-bag.jpg"
                    alt="Top Workout Gear"
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-between p-6 sm:p-7">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                        01 / WINTER 2025
                      </span>
                      <span className="bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-bold text-white uppercase">
                        Core Gear
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight leading-tight mb-3">
                        TOP WORKOUT GEAR FOR <br />
                        PEAK PERFORMANCE!
                      </h3>
                      <span className="inline-flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider group-hover:bg-[#E8262A] group-hover:text-white transition-colors shadow-lg">
                        <span>TOP SELLERS</span>
                        <span>&rarr;</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Card 2: 02 / WINTER 2025 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.15 }}
                whileHover={{ y: -6 }}
              >
                <Link
                  href="/shop?category=Tops"
                  className="group relative aspect-[4/4.2] rounded-[32px] overflow-hidden bg-neutral-900 shadow-xl border border-neutral-800 block select-none"
                >
                  <Image
                    src="/images/products/star-studded-brown-hoodie.jpg"
                    alt="Latest Styles and Innovations"
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-between p-6 sm:p-7">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                        02 / WINTER 2025
                      </span>
                      <span className="bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-bold text-white uppercase">
                        Innovation
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight leading-tight mb-3">
                        LATEST STYLES AND <br />
                        INNOVATIONS IN WORKOUT GEAR
                      </h3>
                      <span className="inline-flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider group-hover:bg-[#E8262A] group-hover:text-white transition-colors shadow-lg">
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
        {/* SCREEN 4: 3RD SCROLL - "FRESH FITS FOR YOUR NEXT WORKOUT!" 8-CARD GRID     */}
        {/* (Video 00:14 - 00:18 with Blur-to-Sharp Entrance)                         */}
        {/* ========================================================================= */}
        <section className="min-h-full w-full snap-start snap-always flex flex-col justify-center px-6 sm:px-12 py-10 relative border-t border-black/5 dark:border-white/5">
          <div className="max-w-5xl mx-auto w-full">
            
            {/* Header Bar */}
            <div className="flex items-center justify-between pb-6 select-none">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                NEW ARRIVAL
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight text-center">
                FRESH FITS FOR YOUR <br className="sm:hidden" /> NEXT WORKOUT!
              </h2>
              <Link href="/shop" className="text-[10px] font-bold text-neutral-500 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors">
                ALL BRANDS
              </Link>
            </div>

            {/* 8-Card Grid (4 Columns x 2 Rows, Matching Video 00:15) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
              {products.slice(0, 8).map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0.3, filter: "blur(10px)", y: 20 }}
                  whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5, delay: index * 0.04 }}
                  whileHover={{ y: -4 }}
                  className="group relative bg-[#1E2024] text-white rounded-[22px] p-2 shadow-lg border border-neutral-800 flex flex-col justify-between overflow-hidden"
                >
                  <div className="relative aspect-[4/4.8] rounded-[16px] overflow-hidden bg-neutral-900 mb-2">
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-106 transition-transform duration-500 opacity-90"
                    />
                    
                    {/* Top Right: "View →" Pill Button */}
                    <Link
                      href={`/product/${p.id}`}
                      className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-white hover:text-black text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/20 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <span>View</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>

                  <div className="p-1 flex items-center justify-between">
                    <div>
                      <h3 className="text-[11px] font-bold text-white truncate max-w-[110px] sm:max-w-[130px] leading-snug">
                        {p.name}
                      </h3>
                      <p className="text-[10px] font-mono font-bold text-neutral-300 mt-0.5">
                        USD {(p.price / 80).toFixed(2)}
                      </p>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-neutral-300 group-hover:bg-white group-hover:text-black transition-colors text-[10px] font-bold">
                      &rarr;
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Button: SEE ALL BRANDS */}
            <div className="text-center mt-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-7 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all shadow-xl"
                >
                  <span>SEE ALL BRANDS</span>
                  <span>&rarr;</span>
                </Link>
              </motion.div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SCREEN 5: 4TH SCROLL - LOOKBOOK OUTFITS CAROUSEL (Video 00:19 - 00:24)     */}
        {/* ========================================================================= */}
        <section className="min-h-full w-full snap-start snap-always flex flex-col justify-center px-6 sm:px-12 py-10 relative bg-neutral-100/70 dark:bg-[#0e0f12] overflow-hidden border-t border-black/5 dark:border-white/5">
          
          {/* Animated Watermark Background */}
          <div className="absolute inset-0 flex items-center pointer-events-none opacity-[0.04] dark:opacity-[0.03] overflow-hidden">
            <motion.div
              animate={{ x: [-1400, 0] }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="flex whitespace-nowrap text-[80px] sm:text-[160px] font-black uppercase tracking-widest gap-16 text-neutral-900 dark:text-white"
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

          <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center">
            
            {/* Look Selector Indicator Pills */}
            <div className="flex items-center gap-2 mb-6 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md p-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 shadow-sm">
              {lookbookOutfits.map((look, i) => (
                <button
                  key={look.tag}
                  type="button"
                  onClick={() => setActiveLookIndex(i)}
                  className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
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
                initial={{ opacity: 0, scale: 0.94, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.94, x: -30 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-[360px] sm:max-w-md aspect-[3/3.8] rounded-[34px] overflow-hidden bg-neutral-900 border-4 border-white dark:border-neutral-800 shadow-2xl flex flex-col justify-between p-5 sm:p-7"
              >
                <Image
                  src={currentLook.image}
                  alt={currentLook.title}
                  fill
                  className="object-cover opacity-90 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />

                {/* Card Top Meta Specs (Sliding into view from sides) */}
                <div className="relative z-10 flex justify-between items-start text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-widest">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                    <p>{currentLook.leftSpec}</p>
                    <p className="text-[#E8262A] mt-0.5">{currentLook.season}</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="text-right">
                    <p>{currentLook.rightSpec}</p>
                    <p className="text-neutral-400 mt-0.5">{currentLook.delivery}</p>
                  </motion.div>
                </div>

                {/* Card Bottom Meta & CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10 pt-6 text-center"
                >
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.25em] block mb-1">
                    {currentLook.subTitle}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mb-3">
                    {currentLook.title}
                  </h3>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                    <Link
                      href="/shop"
                      className="inline-block bg-white hover:bg-neutral-200 text-black px-6 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg"
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
