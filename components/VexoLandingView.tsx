"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";

interface VexoLandingViewProps {
  products: Product[];
}

export default function VexoLandingView({ products }: VexoLandingViewProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0 = Hero, 1 = Slit-Scan, 2 = Top Bento, 3 = Fresh Fits Grid, 4 = Lookbook
  const [direction, setDirection] = useState(1); // 1 = forward/down, -1 = backward/up
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeLookIndex, setActiveLookIndex] = useState(0);

  // Typewriter effect state for hero
  const [typedWorkoutText, setTypedWorkoutText] = useState("EVERY WORKOUT!");

  useEffect(() => {
    const fullText = "EVERY WORKOUT!";
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % (fullText.length + 8);
      if (idx <= fullText.length) {
        setTypedWorkoutText(fullText.slice(0, Math.max(idx, 6)));
      }
    }, 180);
    return () => clearInterval(interval);
  }, []);

  // Lookbook outfits
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

  // Auto-cycle through lookbook outfits when on Step 4
  useEffect(() => {
    if (currentStep !== 4) return;
    const timer = setInterval(() => {
      setActiveLookIndex((prev) => (prev + 1) % lookbookOutfits.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [currentStep, lookbookOutfits.length]);

  // Navigate to step
  const goToStep = (newStep: number) => {
    if (newStep === currentStep) return;
    setDirection(newStep > currentStep ? 1 : -1);
    setCurrentStep(newStep);
  };

  // Wheel listener with smooth debounce to advance 1 step per scroll
  const isThrottledRef = useRef(false);
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isVideoModalOpen) return;
      if (isThrottledRef.current) return;
      if (Math.abs(e.deltaY) < 20) return;

      if (e.deltaY > 0) {
        // Scroll down
        if (currentStep < 4) {
          setDirection(1);
          setCurrentStep((prev) => Math.min(prev + 1, 4));
          isThrottledRef.current = true;
          setTimeout(() => {
            isThrottledRef.current = false;
          }, 750);
        }
      } else {
        // Scroll up
        if (currentStep > 0) {
          setDirection(-1);
          setCurrentStep((prev) => Math.max(prev - 1, 0));
          isThrottledRef.current = true;
          setTimeout(() => {
            isThrottledRef.current = false;
          }, 750);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentStep, isVideoModalOpen]);

  // Keyboard navigation (Arrow keys / Page up & down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVideoModalOpen) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        if (currentStep < 4) {
          setDirection(1);
          setCurrentStep((prev) => Math.min(prev + 1, 4));
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        if (currentStep > 0) {
          setDirection(-1);
          setCurrentStep((prev) => Math.max(prev - 1, 0));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, isVideoModalOpen]);

  // Touch swipe support for mobile
  useEffect(() => {
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (isVideoModalOpen) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (Math.abs(diff) > 40) {
        if (diff > 0 && currentStep < 4) {
          setDirection(1);
          setCurrentStep((prev) => Math.min(prev + 1, 4));
        } else if (diff < 0 && currentStep > 0) {
          setDirection(-1);
          setCurrentStep((prev) => Math.max(prev - 1, 0));
        }
      }
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentStep, isVideoModalOpen]);

  // Motion variants for slide transition between steps
  const slideVariants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.97,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.65,
        ease: "easeOut" as const,
      },
    },
    exit: (dir: number) => ({
      y: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.97,
      transition: {
        duration: 0.5,
        ease: "easeInOut" as const,
      },
    }),
  };

  const stepNames = ["Hero", "Workout Slits", "Top Picks", "Fresh Fits", "Lookbook"];

  return (
    <div className="h-screen w-full bg-[#BAC2CB] dark:bg-[#060709] text-[#111111] dark:text-[#f3f4f6] transition-colors p-2 sm:p-5 lg:p-7 overflow-hidden select-none relative flex flex-col justify-center">
      
      {/* Floating Presentation Window (Matching the Video Frame) */}
      <div className="h-full w-full max-w-[1360px] mx-auto bg-[#ECEEF1] dark:bg-[#121316] rounded-[34px] sm:rounded-[46px] shadow-[0_25px_80px_rgba(0,0,0,0.18)] border border-white/60 dark:border-neutral-800 overflow-hidden flex flex-col justify-between relative">
        
        {/* ========================================================================= */}
        {/* FIXED IN-CARD TOP NAVBAR (Always accessible across screens)              */}
        {/* ========================================================================= */}
        <header className="px-6 sm:px-10 pt-5 sm:pt-7 pb-3 flex items-center justify-between border-b border-black/5 dark:border-white/5 relative z-30 flex-shrink-0">
          <nav className="hidden md:flex items-center gap-6 text-[11px] font-bold tracking-widest text-neutral-700 dark:text-neutral-300 uppercase">
            <Link href="/shop" className="hover:text-black dark:hover:text-white transition-colors">SHOP</Link>
            <Link href="/shop?category=Tops" className="hover:text-black dark:hover:text-white transition-colors">MEN</Link>
            <Link href="/shop?category=Bottoms" className="hover:text-black dark:hover:text-white transition-colors">WOMEN</Link>
            <Link href="/collections" className="hover:text-black dark:hover:text-white transition-colors">TRENDING</Link>
          </nav>

          {/* Center Brand Monogram */}
          <Link href="/" className="flex items-center gap-1 group" onClick={() => goToStep(0)}>
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

        {/* ========================================================================= */}
        {/* DYNAMIC SLIDING SCREEN CONTAINER (Driven by 1st, 2nd, 3rd, 4th scroll)   */}
        {/* ========================================================================= */}
        <div className="flex-1 relative overflow-hidden flex flex-col justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            
            {/* --------------------------------------------------------------------- */}
            {/* SCREEN 0: HERO SECTION (Video 00:00 - 00:04)                         */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === 0 && (
              <motion.div
                key="step-0-hero"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full h-full flex flex-col justify-between px-6 sm:px-12 py-4 relative"
              >
                {/* Headline & Buttons */}
                <div className="text-center max-w-4xl mx-auto space-y-2 pt-1">
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-[1.05]">
                    <span className="block tracking-tight">GEAR UP EVERY SEASON</span>
                    <span className="inline-block tracking-wide text-neutral-900 dark:text-white mt-1">
                      {typedWorkoutText}
                      <span className="inline-block w-1 h-7 sm:h-10 bg-black dark:bg-white ml-1.5 animate-pulse align-middle" />
                    </span>
                  </h1>

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

                {/* Hero Center Model & Side Cards */}
                <div className="relative my-auto flex flex-col lg:flex-row items-center justify-center">
                  
                  {/* Left Floating Card: 3 Avatars */}
                  <div className="lg:absolute lg:left-4 lg:bottom-4 z-20 max-w-[260px] hidden sm:block">
                    <div className="bg-white/90 dark:bg-[#18191c]/90 backdrop-blur-xl p-3.5 rounded-3xl border border-white/80 dark:border-neutral-700/60 shadow-xl">
                      <div className="flex items-center -space-x-2 mb-2">
                        <div className="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-800 bg-neutral-900 text-white flex items-center justify-center text-[9px] font-bold">D1</div>
                        <div className="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-800 bg-neutral-700 text-white flex items-center justify-center text-[9px] font-bold">D2</div>
                        <div className="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-800 bg-neutral-500 text-white flex items-center justify-center text-[9px] font-bold">D3</div>
                      </div>
                      <p className="text-[10px] leading-relaxed text-neutral-600 dark:text-neutral-400 font-medium">
                        Stay cozy without compromising your range of motion. Our season&apos;s winter range is perfect for those chilly outdoor workouts.
                      </p>
                    </div>
                  </div>

                  {/* Central Model with Smooth Dynamic Zoom */}
                  <motion.div
                    animate={{ scale: [0.96, 1.03, 0.98, 1] }}
                    transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    className="relative w-full max-w-[320px] sm:max-w-sm aspect-[4/4.7] rounded-[32px] overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-2xl border-4 border-white dark:border-neutral-800 group"
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

                  {/* Right Floating Card: Watch Campaign Video */}
                  <div className="lg:absolute lg:right-4 lg:bottom-4 z-20 w-56 sm:w-64 mt-4 lg:mt-0">
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
                            <span className="w-9 h-9 rounded-full bg-white/40 absolute animate-ping" />
                            <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg relative z-10">
                              <svg className="w-3.5 h-3.5 ml-0.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
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
                  </div>

                </div>

                {/* Bottom Scroll Prompt */}
                <div
                  onClick={() => goToStep(1)}
                  className="text-center pt-1 text-[10px] font-bold text-neutral-400 tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                >
                  <span>1st Scroll: View Slit-Scan</span>
                  <span className="animate-bounce">&darr;</span>
                </div>
              </motion.div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* SCREEN 1: 1ST SCROLL - SLIT-SCAN BLINDS & "WORKOUT" (Video 00:05-00:07)*/}
            {/* --------------------------------------------------------------------- */}
            {currentStep === 1 && (
              <motion.div
                key="step-1-slits"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full h-full flex flex-col justify-center px-6 sm:px-12 py-4 relative overflow-hidden"
              >
                {/* Giant Outline Typography Watermark: "W O R K O U T" (Exact Video 00:05) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.06] dark:opacity-[0.04]">
                  <motion.span
                    animate={{ letterSpacing: ["0.2em", "0.28em", "0.2em"] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="text-[100px] sm:text-[190px] lg:text-[230px] font-black uppercase text-neutral-900 dark:text-white"
                  >
                    WORKOUT
                  </motion.span>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Left Card & Text */}
                  <div className="md:col-span-3 space-y-3">
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
                  </div>

                  {/* Center Slit-Scan Card: Dynamic Blinds Opening to Reveal Model (00:05-00:06) */}
                  <div className="md:col-span-6 flex justify-center">
                    <div className="relative w-full max-w-xs sm:max-w-sm aspect-[3/4] rounded-[34px] overflow-hidden bg-neutral-900 border-2 border-black dark:border-neutral-700 shadow-2xl flex flex-col justify-between p-2 group">
                      <div className="relative flex-1 rounded-[26px] overflow-hidden flex flex-col justify-between">
                        
                        {/* Dynamic Horizontal Blinds Slicing the Image */}
                        <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none p-1">
                          {Array.from({ length: 11 }).map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scaleY: 1 }}
                              animate={{ scaleY: [1, 0.04, 0.9, 0.08, 1] }}
                              transition={{
                                repeat: Infinity,
                                duration: 4.2,
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
                        <div className="absolute bottom-3 inset-x-3 z-20 bg-black/75 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center shadow-xl">
                          <span className="text-[9px] font-bold tracking-[0.3em] text-[#E8262A] uppercase block mb-0.5">
                            VEXO / DRIIVN
                          </span>
                          <span className="text-xs font-black text-white uppercase tracking-wider">
                            WITH THE LATEST IN WORKOUT WEAR
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Card & Text */}
                  <div className="md:col-span-3 space-y-3">
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
                  </div>

                </div>
              </motion.div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* SCREEN 2: 2ND SCROLL - TOP WORKOUT GEAR BENTO (Video 00:08 - 00:10)   */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === 2 && (
              <motion.div
                key="step-2-bento"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full h-full flex flex-col justify-center px-6 sm:px-12 py-4 relative bg-white/40 dark:bg-[#16171a]/40"
              >
                <div className="max-w-5xl mx-auto w-full">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase block mb-1">
                        OUR TOP PICKS
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-tight">
                        TOP WORKOUT GEAR FOR <br />
                        PEAK PERFORMANCE!
                      </h2>
                    </div>
                    <p className="max-w-xs text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                      Discover the best of our collection, designed to power your workouts all year round.
                    </p>
                  </div>

                  {/* Two Large Bento Split Cards (Video 00:08) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Card 1: 01 / WINTER 2025 */}
                    <motion.div whileHover={{ y: -5 }}>
                      <Link
                        href="/shop?category=Accessories"
                        className="group relative aspect-[4/4] rounded-[30px] overflow-hidden bg-neutral-900 shadow-xl border border-neutral-800 block select-none"
                      >
                        <Image
                          src="/images/leather-bag.jpg"
                          alt="Top Workout Gear"
                          fill
                          className="object-cover group-hover:scale-108 transition-transform duration-700 opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-between p-6">
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
                    <motion.div whileHover={{ y: -5 }}>
                      <Link
                        href="/shop?category=Tops"
                        className="group relative aspect-[4/4] rounded-[30px] overflow-hidden bg-neutral-900 shadow-xl border border-neutral-800 block select-none"
                      >
                        <Image
                          src="/images/products/star-studded-brown-hoodie.jpg"
                          alt="Latest Styles and Innovations"
                          fill
                          className="object-cover group-hover:scale-108 transition-transform duration-700 opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-between p-6">
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
              </motion.div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* SCREEN 3: 3RD SCROLL - "FRESH FITS" 8-CARD GRID (Video 00:14 - 00:18) */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === 3 && (
              <motion.div
                key="step-3-grid"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full h-full flex flex-col justify-center px-6 sm:px-12 py-4 relative"
              >
                <div className="max-w-5xl mx-auto w-full">
                  <div className="flex items-center justify-between pb-4 select-none">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                      NEW ARRIVAL
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight text-center">
                      FRESH FITS FOR YOUR NEXT WORKOUT!
                    </h2>
                    <Link href="/shop" className="text-[10px] font-bold text-neutral-500 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors">
                      ALL BRANDS
                    </Link>
                  </div>

                  {/* 8-Card Grid with Blur-to-Sharp Focus (Video 00:14-00:15) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-3.5">
                    {products.slice(0, 8).map((p, index) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0.3, filter: "blur(10px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.5, delay: index * 0.04 }}
                        whileHover={{ y: -4 }}
                        className="group relative bg-[#1E2024] text-white rounded-[20px] p-2 shadow-lg border border-neutral-800 flex flex-col justify-between overflow-hidden"
                      >
                        <div className="relative aspect-[4/4.5] rounded-[15px] overflow-hidden bg-neutral-900 mb-2">
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            className="object-cover group-hover:scale-106 transition-transform duration-500 opacity-90"
                          />
                          <Link
                            href={`/product/${p.id}`}
                            className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-white hover:text-black text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border border-white/20 transition-all flex items-center gap-1 shadow-sm"
                          >
                            <span>View</span>
                            <span>&rarr;</span>
                          </Link>
                        </div>

                        <div className="p-1 flex items-center justify-between">
                          <div>
                            <h3 className="text-[11px] font-bold text-white truncate max-w-[100px] sm:max-w-[120px] leading-snug">
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

                  <div className="text-center mt-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                      <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full text-[11px] font-extrabold uppercase tracking-widest transition-all shadow-xl"
                      >
                        <span>SEE ALL BRANDS</span>
                        <span>&rarr;</span>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* SCREEN 4: 4TH SCROLL - LOOKBOOK OUTFITS CAROUSEL (Video 00:19-00:24)  */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === 4 && (
              <motion.div
                key="step-4-lookbook"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full h-full flex flex-col justify-center px-6 sm:px-12 py-4 relative bg-neutral-100/70 dark:bg-[#0e0f12] overflow-hidden"
              >
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
                  <div className="flex items-center gap-2 mb-4 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md p-1 rounded-full border border-neutral-300 dark:border-neutral-700 shadow-sm">
                    {lookbookOutfits.map((look, i) => (
                      <button
                        key={look.tag}
                        type="button"
                        onClick={() => setActiveLookIndex(i)}
                        className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
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
                      className="relative w-full max-w-[340px] sm:max-w-sm aspect-[3/3.7] rounded-[32px] overflow-hidden bg-neutral-900 border-4 border-white dark:border-neutral-800 shadow-2xl flex flex-col justify-between p-5"
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
                        className="relative z-10 pt-4 text-center"
                      >
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.25em] block mb-1">
                          {currentLook.subTitle}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mb-2.5">
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
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT STEP INDICATOR DOTS & NAVIGATION PILLS                              */}
        {/* ========================================================================= */}
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col gap-2.5 bg-black/30 backdrop-blur-md p-2 rounded-full border border-white/20">
          {stepNames.map((name, idx) => (
            <button
              key={name}
              type="button"
              onClick={() => goToStep(idx)}
              className="group relative flex items-center justify-end"
              aria-label={`Go to ${name}`}
            >
              {/* Tooltip on Hover */}
              <span className="absolute right-6 bg-black text-white px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {name}
              </span>
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentStep === idx
                    ? "bg-white scale-125 shadow-sm ring-2 ring-white/40"
                    : "bg-white/40 hover:bg-white/80"
                }`}
              />
            </button>
          ))}
        </div>

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
