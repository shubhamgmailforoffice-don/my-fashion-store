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

  // Auto-cycle through lookbook outfits every 5 seconds unless user manually interacts
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLookIndex((prev) => (prev + 1) % lookbookOutfits.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const lookbookOutfits = [
    {
      title: "Tactical Aviator & Thermal Cowl",
      season: "Fall / Winter 2026",
      tag: "Look 01",
      image: "/images/streetwear-model-2.jpg",
      leftSpec: "420 GSM FRENCH TERRY THERMAL",
      rightSpec: "OVERSIZED BOXY HOOD",
      subTitle: "CARGO RUNNER & REFLECTIVE ACCENTS",
      delivery: "PAN-INDIA EXPRESS",
    },
    {
      title: "Nocturnal Heavyweight Hoodie",
      season: "Winter 2026 Atelier",
      tag: "Look 02",
      image: "/images/streetwear-model-cap.jpg",
      leftSpec: "100% COMBED FRENCH TERRY",
      rightSpec: "TACTICAL STRAP SYSTEM",
      subTitle: "DOUBLE LINED HOOD / ZERO DRAWSTRING",
      delivery: "LIMITED ARCHIVE",
    },
    {
      title: "Black Tiger Bonsai Heavy Tee",
      season: "Spring / Drop 03",
      tag: "Look 03",
      image: "/images/streetwear-tiger.jpg",
      leftSpec: "300 GSM ARCHITECTURAL COTTON",
      rightSpec: "GOLD THREAD EMBROIDERY",
      subTitle: "BOX CUT DROPPED SHOULDERS",
      delivery: "RESTOCK READY",
    },
    {
      title: "Crimson Betta Tactical Polo",
      season: "Autumn / Core",
      tag: "Look 04",
      image: "/images/streetwear-betta.jpg",
      leftSpec: "INTERLOCK KNITTED PIQUE",
      rightSpec: "HIGH DENSITY SCREENPRINT",
      subTitle: "MILITARY GRADE HARDWARE",
      delivery: "EXCLUSIVE RUN",
    },
  ];

  const currentLook = lookbookOutfits[activeLookIndex];

  return (
    <div className="min-h-screen bg-[#E5E7EB] dark:bg-[#0a0a0c] text-[#111111] dark:text-[#f3f4f6] transition-colors py-4 sm:py-6 px-2 sm:px-4 lg:px-6 overflow-hidden">
      
      {/* Outer Shell with Large Rounded Corners (Matching Video Frame) */}
      <div className="max-w-[1400px] mx-auto bg-[#F4F5F7] dark:bg-[#121316] rounded-[32px] sm:rounded-[44px] shadow-2xl border border-neutral-300/60 dark:border-neutral-800 overflow-hidden">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION WITH KINETIC TYPOGRAPHY & FLOATING CARDS (Video 00:00-00:04) */}
        {/* ========================================================================= */}
        <section className="relative px-6 sm:px-12 pt-10 sm:pt-16 pb-12 sm:pb-24 overflow-hidden select-none">
          
          {/* Kinetic Headline with Staggered Entrance */}
          <div className="text-center max-w-4xl mx-auto space-y-1 relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-[1.05]"
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="inline-block"
              >
                GEAR UP EVERY SEASON
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, letterSpacing: "0.2em" }}
                animate={{ opacity: 1, letterSpacing: "0.05em" }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block tracking-wider text-black dark:text-white"
              >
                EVERY DROP!
              </motion.span>
            </motion.h1>

            {/* Action Buttons with Spring Micro-Interactions */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-3 pt-5 sm:pt-7"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/shop"
                  className="bg-black dark:bg-white text-white dark:text-black px-7 sm:px-9 py-3 rounded-full text-xs sm:text-sm font-extrabold tracking-widest uppercase transition-shadow shadow-lg hover:shadow-2xl flex items-center gap-2"
                >
                  <span>Shop Now</span>
                  <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/collections"
                  className="bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase transition-colors"
                >
                  Explore All
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Hero Visual Area: Center Model + Left Floating Social Proof + Right Campaign Video Card */}
          <div className="relative mt-10 sm:mt-14 flex flex-col lg:flex-row items-center justify-center">
            
            {/* Left Floating Card with Organic Float Animation */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:absolute lg:left-4 lg:bottom-12 z-20 max-w-xs mb-6 lg:mb-0"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white/85 dark:bg-[#18191c]/85 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/70 dark:border-neutral-700/60 shadow-xl"
              >
                <div className="flex items-center -space-x-2 mb-3">
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
                  Stay cozy without compromising your range of motion. Our season&apos;s winter drop is perfect for those chilly outdoor evenings and street layerings.
                </p>
              </motion.div>
            </motion.div>

            {/* Central Model Presentation with Breathing Parallax */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg aspect-[4/5] rounded-[34px] overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-2xl border-4 border-white dark:border-neutral-800 group"
            >
              <Image
                src="/images/hero-streetwear.jpg"
                alt="DRIIVN Tactical Streetwear Model"
                fill
                priority
                className="object-cover object-top transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </motion.div>

            {/* Right Floating Card: Watch Campaign Video with Sonar Pulse Ring */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:absolute lg:right-4 lg:bottom-12 z-20 w-64 sm:w-72 mt-6 lg:mt-0"
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
                      {/* Animated Sonar Pulse Ring */}
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
        {/* 2. ANIMATED SLIT-SCAN BLINDS & RUNNING WATERMARK (Video 00:05 - 00:07)     */}
        {/* ========================================================================= */}
        <section className="relative py-16 sm:py-24 px-6 sm:px-12 border-t border-neutral-300/60 dark:border-neutral-800/80 overflow-hidden">
          
          {/* Animated Infinite Horizontal Marquee Watermark */}
          <div className="absolute inset-0 flex items-center pointer-events-none select-none z-0 opacity-[0.05] dark:opacity-[0.035] overflow-hidden">
            <motion.div
              animate={{ x: [0, -1400] }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="flex whitespace-nowrap text-[120px] sm:text-[220px] font-black uppercase tracking-widest gap-16"
            >
              <span>STREETWEAR</span>
              <span>&bull;</span>
              <span>PERFORMANCE</span>
              <span>&bull;</span>
              <span>DRIIVN</span>
              <span>&bull;</span>
              <span>STREETWEAR</span>
              <span>&bull;</span>
              <span>PERFORMANCE</span>
              <span>&bull;</span>
              <span>DRIIVN</span>
            </motion.div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Model Card & Text */}
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
                  alt="Tactical Headwear Fit"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Performance-driven gear for modern silhouettes — built for summer heat and winter cold.
              </p>
            </motion.div>

            {/* Center Animated Slit-Scan Reveal Card (Direct Video 00:05 Signature Effect) */}
            <div className="md:col-span-6 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-sm aspect-[3/4] rounded-[34px] overflow-hidden bg-neutral-900 border-2 border-black dark:border-neutral-700 shadow-2xl flex flex-col justify-between p-2 group"
              >
                <div className="relative flex-1 rounded-[26px] overflow-hidden flex flex-col justify-between">
                  
                  {/* Kinetic Animated Slits (Horizontal Blinds Reveal Animation) */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none p-1">
                    {Array.from({ length: 11 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: [1, 0.08, 0.95, 0.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 4.8,
                          delay: i * 0.12,
                          ease: "easeInOut",
                        }}
                        className="h-2 w-full bg-black/90 origin-left rounded-full"
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
                      DRIIVN Atelier Drop
                    </span>
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Level Up With The Latest
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Model Detail Card & Text */}
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
                  alt="Tactical Cargo Fit"
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
        {/* 3. BENTO DUAL SPLIT: TOP GEAR PICKS (Video 00:08 - 00:10)                 */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-6 sm:px-12 border-t border-neutral-300/60 dark:border-neutral-800/80 bg-white/50 dark:bg-[#16171a]/50">
          <div className="max-w-6xl mx-auto">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-[0.3em] text-[#E8262A] uppercase block mb-1">
                  OUR TOP PICKS
                </span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-tight">
                  TOP WORKOUT GEAR FOR <br />
                  PEAK PERFORMANCE!
                </h2>
              </div>
              <p className="max-w-xs text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Discover the best of our collection, designed to power your workouts and daily rotation all year round.
              </p>
            </div>

            {/* Two Large Bento Split Cards with Hover Zoom & Lift */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              
              {/* Card 1: 01 / Winter 2026 */}
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
              >
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
                        01 / WINTER 2026
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

              {/* Card 2: 02 / Winter 2026 */}
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
              >
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
                        02 / WINTER 2026
                      </span>
                      <span className="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-bold text-white uppercase">
                        Atelier Innovation
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
        {/* 4. "FRESH FITS FOR YOUR NEXT DROP!" GRID (Video 00:14 - 00:18)            */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-6 sm:px-12 border-t border-neutral-300/60 dark:border-neutral-800/80">
          <div className="max-w-6xl mx-auto">
            
            {/* Header Bar */}
            <div className="flex items-center justify-between pb-8 select-none">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                NEW ARRIVAL
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight text-center">
                FRESH FITS FOR YOUR <br className="sm:hidden" /> NEXT DROP!
              </h2>
              <Link href="/shop" className="text-[10px] font-bold text-neutral-500 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors">
                ALL BRANDS
              </Link>
            </div>

            {/* 8-Card Technical Streetwear Grid with Staggered Entrance */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {products.slice(0, 8).map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
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
                    
                    {/* Top Right: "View →" Pill Button */}
                    <Link
                      href={`/product/${p.id}`}
                      className="absolute top-2.5 right-2.5 z-10 bg-black/60 hover:bg-white hover:text-black text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <span>View</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="p-1">
                    <h3 className="text-xs font-bold text-white truncate leading-snug">
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] font-mono font-bold text-neutral-300">
                        ₹ {p.price.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest">
                        {p.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Button: SEE ALL BRANDS */}
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
        {/* 5. INTERACTIVE LOOKBOOK OUTFIT SWITCHER (Video 00:19 - 00:24)              */}
        {/* ========================================================================= */}
        <section className="relative py-18 sm:py-28 px-6 sm:px-12 border-t border-neutral-300/60 dark:border-neutral-800/80 bg-neutral-100 dark:bg-[#0e0f12] overflow-hidden select-none">
          
          {/* Animated Watermark Background */}
          <div className="absolute inset-0 flex items-center pointer-events-none opacity-[0.04] dark:opacity-[0.03] overflow-hidden">
            <motion.div
              animate={{ x: [-1400, 0] }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="flex whitespace-nowrap text-[90px] sm:text-[180px] font-black uppercase tracking-widest gap-16"
            >
              <span>FITS FOR YOU</span>
              <span>&bull;</span>
              <span>YOUR NEXT DROP</span>
              <span>&bull;</span>
              <span>DRIIVN</span>
              <span>&bull;</span>
              <span>FITS FOR YOU</span>
              <span>&bull;</span>
              <span>YOUR NEXT DROP</span>
            </motion.div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            
            {/* Look Selector Pills */}
            <div className="flex items-center gap-2 mb-8 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md p-1.5 rounded-full border border-neutral-300 dark:border-neutral-700">
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

            {/* Central Animated Outfit Card with AnimatePresence Transitions */}
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

                {/* Card Top Meta */}
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
      {/* 6. FULLSCREEN CAMPAIGN VIDEO MODAL                                        */}
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
