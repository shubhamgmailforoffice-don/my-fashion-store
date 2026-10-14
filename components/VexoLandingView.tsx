"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { gooeyToast } from "goey-toast";

interface VexoLandingViewProps {
  products: Product[];
}

export default function VexoLandingView({ products }: VexoLandingViewProps) {
  const [activeStep, setActiveStep] = useState(0); // 0=Hero, 1=Slits, 2=Bento, 3=FreshFits, 4=Lookbook, 5=Footer
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Scroll container and section refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

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

  // Lookbook outfits matching video
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

  // Auto-cycle through lookbook outfits
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLookIndex((prev) => (prev + 1) % lookbookOutfits.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [lookbookOutfits.length]);

  // Smooth scroll to a specific section index
  const scrollToSection = (idx: number) => {
    const target = sectionRefs.current[idx];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Track active section on scroll smoothly
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;

    // Determine which section is currently most in view
    let currentIdx = 0;
    sectionRefs.current.forEach((sec, idx) => {
      if (!sec) return;
      const offsetTop = sec.offsetTop;
      if (scrollTop >= offsetTop - clientHeight * 0.35) {
        currentIdx = idx;
      }
    });

    if (currentIdx !== activeStep) {
      setActiveStep(currentIdx);
    }
  };

  // Keyboard navigation support for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVideoModalOpen) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (activeStep < stepNames.length - 1) {
          e.preventDefault();
          scrollToSection(activeStep + 1);
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (activeStep > 0) {
          e.preventDefault();
          scrollToSection(activeStep - 1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStep, isVideoModalOpen]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      gooeyToast.success("Subscribed to DRIIVN Drops", {
        description: `Confirmation sent to ${newsletterEmail}`,
      });
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  const stepNames = ["Hero", "Workout Slits", "Top Picks", "Fresh Fits", "Lookbook", "Footer"];

  return (
    <div className="h-screen w-full bg-[#BAC2CB] dark:bg-[#060709] text-[#111111] dark:text-[#f3f4f6] transition-colors p-2 sm:p-4 lg:p-6 overflow-hidden select-none relative flex flex-col justify-center">
      
      {/* Floating Presentation Window (Matching the Video Frame) */}
      <div className="h-full w-full max-w-[1360px] mx-auto bg-[#ECEEF1] dark:bg-[#121316] rounded-[34px] sm:rounded-[46px] shadow-[0_25px_80px_rgba(0,0,0,0.18)] border border-white/60 dark:border-neutral-800 overflow-hidden flex flex-col relative">
        
        {/* ========================================================================= */}
        {/* FIXED IN-CARD TOP NAVBAR (Always accessible across screens)              */}
        {/* ========================================================================= */}
        <header className="px-6 sm:px-10 pt-4 sm:pt-6 pb-3 flex items-center justify-between border-b border-black/5 dark:border-white/5 relative z-30 flex-shrink-0 bg-[#ECEEF1]/90 dark:bg-[#121316]/90 backdrop-blur-md">
          <nav className="hidden md:flex items-center gap-6 text-[11px] font-bold tracking-widest text-neutral-700 dark:text-neutral-300 uppercase">
            <Link href="/shop" className="hover:text-black dark:hover:text-white transition-colors">SHOP</Link>
            <Link href="/shop?category=Tops" className="hover:text-black dark:hover:text-white transition-colors">MEN</Link>
            <Link href="/shop?category=Bottoms" className="hover:text-black dark:hover:text-white transition-colors">WOMEN</Link>
            <Link href="/collections" className="hover:text-black dark:hover:text-white transition-colors">TRENDING</Link>
          </nav>

          {/* Center Brand Monogram */}
          <button
            type="button"
            onClick={() => scrollToSection(0)}
            className="flex items-center gap-1 group cursor-pointer"
            aria-label="Back to Top"
          >
            <span className="text-xl sm:text-2xl font-black tracking-[0.25em] text-neutral-900 dark:text-white font-mono uppercase">
              DRIIVN
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8262A] group-hover:scale-150 transition-transform" />
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden lg:flex items-center gap-5 text-[11px] font-bold tracking-widest text-neutral-700 dark:text-neutral-300 uppercase">
              <Link href="/collections" className="hover:text-black dark:hover:text-white transition-colors">SEASONAL</Link>
              <Link href="/shop?category=Accessories" className="hover:text-black dark:hover:text-white transition-colors">ACCESSORIES</Link>
            </div>

            <ThemeToggle size="sm" />

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
        {/* SILKY SMOOTH SCROLL CONTAINER (Native 120Hz Hardware Accelerated Snapping) */}
        {/* ========================================================================= */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth no-scrollbar relative"
        >
          
          {/* --------------------------------------------------------------------- */}
          {/* SECTION 0: HERO SECTION (Video 00:00 - 00:04)                         */}
          {/* --------------------------------------------------------------------- */}
          <section
            id="section-0"
            ref={(el) => { sectionRefs.current[0] = el; }}
            className="w-full min-h-[calc(100vh-6rem)] snap-start snap-always flex flex-col justify-between px-6 sm:px-12 py-4 relative"
          >
            {/* Headline & Buttons */}
            <div className="text-center max-w-4xl mx-auto space-y-2 pt-2 sm:pt-4">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-[1.05]">
                <span className="block tracking-tight">GEAR UP EVERY SEASON</span>
                <span className="inline-block tracking-wide text-neutral-900 dark:text-white mt-1">
                  {typedWorkoutText}
                  <span className="inline-block w-1 h-7 sm:h-10 bg-black dark:bg-white ml-1.5 animate-pulse align-middle" />
                </span>
              </h1>

              <div className="flex items-center justify-center gap-4 pt-2">
                <Link
                  href="/shop"
                  className="bg-black hover:bg-neutral-800 text-white px-5 py-2 rounded-full text-[10px] sm:text-[11px] font-black tracking-widest uppercase transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  SHOP NOW
                </Link>

                <Link
                  href="/collections"
                  className="text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white text-[10px] sm:text-[11px] font-black tracking-widest uppercase transition-colors px-2 py-1 flex items-center gap-1"
                >
                  <span>EXPLORE ALL</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Central Model Stage & Dynamic Flanking Overlays */}
            <div className="relative flex-1 w-full max-w-5xl mx-auto flex items-center justify-center my-2 sm:my-3">
              
              {/* Left Floating Info Overlay */}
              <div className="hidden md:flex absolute left-0 bottom-4 z-20 max-w-[210px] flex-col gap-2 bg-white/70 dark:bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 dark:border-neutral-700 shadow-lg">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white relative">
                    <Image src="/images/streetwear-model-2.jpg" alt="Runner" fill className="object-cover" />
                  </div>
                  <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white relative">
                    <Image src="/images/streetwear-model-cap.jpg" alt="Model" fill className="object-cover" />
                  </div>
                  <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white relative bg-black text-white text-[9px] font-bold flex items-center justify-center">
                    +4k
                  </div>
                </div>
                <p className="text-[10px] leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
                  Stay cozy without compromising your range of motion. Our winter range is perfect for chilly workouts.
                </p>
              </div>

              {/* Central Hero Character Figure */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full max-w-sm sm:max-w-md aspect-[4/4.8] rounded-3xl overflow-hidden shadow-2xl border border-white/40 dark:border-neutral-700 group cursor-pointer"
                onClick={() => setIsVideoModalOpen(true)}
              >
                <Image
                  src="/images/hero-streetwear.jpg"
                  alt="DRIIVN Winter Workout Campaign Hero"
                  fill
                  priority
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                  <div className="w-full flex items-center justify-between text-white">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest uppercase opacity-80">LOOK 01 / WINTER 2026</span>
                      <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">TACTICAL RUNNER SUIT</h4>
                    </div>
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                      VIEW DROP &rarr;
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Right Bottom Campaign Preview Pill Card */}
              <div
                onClick={() => setIsVideoModalOpen(true)}
                className="hidden md:flex absolute right-0 bottom-4 z-20 items-center gap-3 bg-black/85 hover:bg-black text-white p-2.5 pr-4 rounded-2xl backdrop-blur-md shadow-2xl cursor-pointer group transition-all hover:scale-105 border border-white/20"
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
                  <Image
                    src="/images/streetwear-model-2.jpg"
                    alt="Watch Campaign"
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[8px] pl-0.5 shadow-md">
                      ▶
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-[#E8262A] uppercase block">
                    CAMPAIGN
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider">
                    WATCH VIDEO
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Scroll Prompt (1st Scroll) */}
            <button
              type="button"
              onClick={() => scrollToSection(1)}
              className="text-center pt-1 pb-2 text-[10px] font-bold text-neutral-400 tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
            >
              <span>1st Scroll: View Slit-Scan</span>
              <span className="animate-bounce">&darr;</span>
            </button>
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* SECTION 1: 1ST SCROLL - SLIT-SCAN BLINDS & "WORKOUT" (Video 00:05)     */}
          {/* --------------------------------------------------------------------- */}
          <section
            id="section-1"
            ref={(el) => { sectionRefs.current[1] = el; }}
            className="w-full min-h-[calc(100vh-6rem)] snap-start snap-always flex flex-col justify-center px-6 sm:px-12 py-6 relative overflow-hidden"
          >
            {/* Giant Outline Typography Watermark: "W O R K O U T" (Exact Video 00:05) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.06] dark:opacity-[0.04]">
              <span className="text-[90px] sm:text-[180px] lg:text-[220px] font-black uppercase text-neutral-900 dark:text-white tracking-[0.25em]">
                WORKOUT
              </span>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left Card & Text */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ amount: 0.3 }}
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
                          animate={{ scaleY: [1, 0.05, 0.85, 0.05, 1] }}
                          transition={{
                            repeat: Infinity,
                            duration: 4.5,
                            delay: i * 0.09,
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
                        DRIIVN ATELIER
                      </span>
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        WITH THE LATEST IN WORKOUT WEAR
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Card & Text */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ amount: 0.3 }}
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
                  Stay warm, stay fit. Our winter workout wear blends insulation with flexibility to keep you moving.
                </p>
              </motion.div>

            </div>

            <button
              type="button"
              onClick={() => scrollToSection(2)}
              className="text-center pt-4 text-[10px] font-bold text-neutral-400 tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
            >
              <span>2nd Scroll: Top Picks Bento</span>
              <span className="animate-bounce">&darr;</span>
            </button>
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* SECTION 2: 2ND SCROLL - BENTO "TOP PICKS" (Video 00:08 - 00:10)       */}
          {/* --------------------------------------------------------------------- */}
          <section
            id="section-2"
            ref={(el) => { sectionRefs.current[2] = el; }}
            className="w-full min-h-[calc(100vh-6rem)] snap-start snap-always flex flex-col justify-center px-6 sm:px-12 py-6 relative bg-white/30 dark:bg-[#16171a]/30"
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
                
                {/* Card 1: 01 / WINTER 2026 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.3 }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ y: -5 }}
                >
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
                          01 / WINTER 2026
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

                {/* Card 2: 02 / WINTER 2026 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  whileHover={{ y: -5 }}
                >
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
                          02 / WINTER 2026
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

            <button
              type="button"
              onClick={() => scrollToSection(3)}
              className="text-center pt-4 text-[10px] font-bold text-neutral-400 tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
            >
              <span>3rd Scroll: Fresh Fits Grid</span>
              <span className="animate-bounce">&darr;</span>
            </button>
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* SECTION 3: 3RD SCROLL - "FRESH FITS" 8-CARD GRID (Video 00:14)        */}
          {/* --------------------------------------------------------------------- */}
          <section
            id="section-3"
            ref={(el) => { sectionRefs.current[3] = el; }}
            className="w-full min-h-[calc(100vh-6rem)] snap-start snap-always flex flex-col justify-center px-6 sm:px-12 py-6 relative"
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
                    initial={{ opacity: 0.4, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
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
                          ₹ {p.price.toLocaleString()}
                        </p>
                      </div>
                      <Link
                        href={`/product/${p.id}`}
                        className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-neutral-300 group-hover:bg-white group-hover:text-black transition-colors text-[10px] font-bold"
                      >
                        &rarr;
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 px-6 py-2 rounded-full text-[11px] font-extrabold uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                  <span>SEE ALL BRANDS</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={() => scrollToSection(4)}
              className="text-center pt-4 text-[10px] font-bold text-neutral-400 tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
            >
              <span>4th Scroll: Lookbook Carousel</span>
              <span className="animate-bounce">&darr;</span>
            </button>
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* SECTION 4: 4TH SCROLL - LOOKBOOK OUTFITS CAROUSEL (Video 00:19)       */}
          {/* --------------------------------------------------------------------- */}
          <section
            id="section-4"
            ref={(el) => { sectionRefs.current[4] = el; }}
            className="w-full min-h-[calc(100vh-6rem)] snap-start snap-always flex flex-col justify-center px-6 sm:px-12 py-6 relative bg-neutral-100/60 dark:bg-[#0e0f12] overflow-hidden"
          >
            {/* Animated Watermark Background */}
            <div className="absolute inset-0 flex items-center pointer-events-none opacity-[0.04] dark:opacity-[0.03] overflow-hidden">
              <motion.div
                animate={{ x: [-1400, 0] }}
                transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
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
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

                  {/* Card Top Row Tags */}
                  <div className="relative z-10 flex justify-between items-start text-white">
                    <div>
                      <span className="text-[8px] font-mono tracking-widest text-[#E8262A] uppercase block">
                        {currentLook.tag}
                      </span>
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        {currentLook.leftSpec}
                      </h4>
                    </div>
                    <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[8px] font-mono tracking-widest uppercase">
                      {currentLook.rightSpec}
                    </span>
                  </div>

                  {/* Card Bottom Row Specifications */}
                  <div className="relative z-10 text-white space-y-1">
                    <span className="text-[8px] font-mono tracking-widest text-neutral-400 uppercase block">
                      {currentLook.season}
                    </span>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight leading-tight">
                      {currentLook.title}
                    </h3>
                    <div className="flex items-center justify-between pt-1 border-t border-white/20 text-[9px] font-bold text-neutral-300">
                      <span>{currentLook.subTitle}</span>
                      <span className="text-white bg-black/40 px-2 py-0.5 rounded-md">
                        {currentLook.delivery}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Next / Prev Controls */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    setActiveLookIndex((prev) => (prev - 1 + lookbookOutfits.length) % lookbookOutfits.length)
                  }
                  className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 shadow-sm border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label="Previous Look"
                >
                  &larr;
                </button>
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                  {activeLookIndex + 1} / {lookbookOutfits.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setActiveLookIndex((prev) => (prev + 1) % lookbookOutfits.length)
                  }
                  className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 shadow-sm border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label="Next Look"
                >
                  &rarr;
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => scrollToSection(5)}
              className="text-center pt-4 text-[10px] font-bold text-neutral-400 tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
            >
              <span>5th Scroll: Store Footer</span>
              <span className="animate-bounce">&darr;</span>
            </button>
          </section>

          {/* --------------------------------------------------------------------- */}
          {/* SECTION 5: STORE FOOTER (Restores Footer inside Landing View)          */}
          {/* --------------------------------------------------------------------- */}
          <footer
            id="section-5"
            ref={(el) => { sectionRefs.current[5] = el; }}
            className="w-full snap-start border-t border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#111215]/95 backdrop-blur-xl px-6 sm:px-12 py-12 rounded-b-[34px] sm:rounded-b-[46px]"
          >
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 sm:gap-10">
              
              {/* Brand Info (2 Columns) */}
              <div className="md:col-span-2 space-y-4">
                <Link href="/" className="inline-block">
                  <span className="text-2xl font-black tracking-[0.25em] text-neutral-900 dark:text-white font-mono uppercase">
                    DRIIVN
                  </span>
                </Link>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed tracking-wider uppercase max-w-sm">
                  DRIIVN is India’s premier luxury streetwear house, founded in 2026. Focused on custom-milled heavyweight French Terry fabrics, automotive-inspired graphics, and collectible limited drops.
                </p>
                <div className="pt-1 text-[10px] font-bold tracking-widest text-[#E8262A] uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E8262A] animate-pulse" />
                  <span>DESIGNED IN INDIA • WORN WORLDWIDE</span>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-xs font-black tracking-widest text-black dark:text-white uppercase mb-4">
                  Shop
                </h4>
                <ul className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400 tracking-wider uppercase">
                  <li>
                    <Link href="/shop" className="hover:text-black dark:hover:text-white transition-colors">
                      Shop All Drops
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Tops" className="hover:text-black dark:hover:text-white transition-colors">
                      Men&apos;s Tops
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Bottoms" className="hover:text-black dark:hover:text-white transition-colors">
                      Cargo &amp; Joggers
                    </Link>
                  </li>
                  <li>
                    <Link href="/collections" className="hover:text-black dark:hover:text-white transition-colors">
                      Collections
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop-by-color" className="hover:text-black dark:hover:text-white transition-colors">
                      Shop By Color
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Customer Care */}
              <div>
                <h4 className="text-xs font-black tracking-widest text-black dark:text-white uppercase mb-4">
                  Customer Care
                </h4>
                <ul className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400 tracking-wider uppercase">
                  <li>
                    <Link href="/returns" className="hover:text-black dark:hover:text-white transition-colors">
                      Returns &amp; Exchanges
                    </Link>
                  </li>
                  <li>
                    <Link href="/shipping-policy" className="hover:text-black dark:hover:text-white transition-colors">
                      Shipping &amp; Delivery
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Newsletter Signup Form */}
              <div>
                <h4 className="text-xs font-black tracking-widest text-black dark:text-white uppercase mb-4">
                  Stay In The Loop
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 tracking-wider uppercase mb-3">
                  Subscribe for private capsule drop dates &amp; secret member codes.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="ENTER YOUR EMAIL..."
                    required
                    className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 rounded-xl focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                  <button
                    type="submit"
                    className="w-full bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {newsletterSubscribed ? "SUBSCRIBED ✓" : "SUBSCRIBE &rarr;"}
                  </button>
                </form>
              </div>

            </div>

            {/* Bottom Copyright & Back to Top */}
            <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 gap-4">
              <p>&copy; 2026 DRIIVN LUXURY STREETWEAR. ALL RIGHTS RESERVED.</p>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => scrollToSection(0)}
                  className="font-bold uppercase tracking-wider text-black dark:text-white hover:text-[#E8262A] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>BACK TO TOP</span>
                  <span>&uarr;</span>
                </button>
              </div>
            </div>
          </footer>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT STEP INDICATOR DOTS & NAVIGATION PILLS                              */}
        {/* ========================================================================= */}
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col gap-2.5 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/20">
          {stepNames.map((name, idx) => (
            <button
              key={name}
              type="button"
              onClick={() => scrollToSection(idx)}
              className="group relative flex items-center justify-end cursor-pointer"
              aria-label={`Go to ${name}`}
            >
              {/* Tooltip on Hover */}
              <span className="absolute right-6 bg-black text-white px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {name}
              </span>
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeStep === idx
                    ? "bg-white scale-125 shadow-sm ring-2 ring-white/50"
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
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-black backdrop-blur-md flex items-center justify-center text-sm font-bold transition-all shadow-lg cursor-pointer"
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
