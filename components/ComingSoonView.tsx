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
        setErrorMessage(data.error || "Unable to join VIP list. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-black/90 backdrop-blur-2xl text-white border border-white/15 shadow-2xl my-6">
      {/* Background Ambience & Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={config.bannerImage || "/images/hero-streetwear.jpg"}
          alt={config.name}
          fill
          priority
          className="object-cover opacity-25 filter grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(#E8262A_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 sm:py-24 text-center flex flex-col items-center">
        {/* Pulsing Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl mb-6 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8262A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8262A]" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8262A]">
            {config.badge || "PRODUCTION IN PROGRESS"}
          </span>
          <span className="text-neutral-500">•</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">
            {config.releaseDate || "DROPPING SHORTLY"}
          </span>
        </div>

        {/* Main Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-anton uppercase tracking-tight text-white leading-none max-w-3xl drop-shadow-md">
          {config.title || `${config.name.toUpperCase()} DROP COMING SOON`}
        </h2>

        {/* Subtitle */}
        <p className="mt-3 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#E8262A]">
          {config.subtitle || "EXCLUSIVE SILHOUETTES & ARCHIVE CUTS"}
        </p>

        {/* Description */}
        <p className="mt-5 text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
          {config.description ||
            "Our design team is crafting high-density heavyweight pieces for this category. Register for VIP early access to reserve your size 2 hours before the public release."}
        </p>

        {/* VIP Early Access Form */}
        <div className="w-full max-w-md mt-8">
          {isSubmitted ? (
            <div className="bg-emerald-950/80 backdrop-blur-xl border border-emerald-500/50 rounded-2xl p-5 text-center animate-in fade-in zoom-in-95 duration-200 shadow-xl">
              <span className="text-2xl block mb-1">⚡</span>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
                You&apos;re On The VIP Priority List!
              </p>
              <p className="text-[11px] text-neutral-300 mt-1">
                We will send an exclusive drop link to <span className="font-mono text-white underline">{contact}</span> 2 hours prior to public release.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter Email or WhatsApp Phone..."
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="flex-1 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/25 focus:border-[#E8262A] rounded-xl px-4 py-3 text-xs text-white placeholder:text-neutral-400 outline-none transition-all backdrop-blur-md"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !contact.trim()}
                  className="bg-[#E8262A] hover:bg-[#c91d21] disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl transition-all shadow-lg shadow-red-900/30 whitespace-nowrap active:scale-95"
                >
                  {isSubmitting ? "Securing VIP..." : "Notify Me &rarr;"}
                </button>
              </div>

              {errorMessage && (
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  {errorMessage}
                </p>
              )}

              <p className="text-[10px] text-neutral-400 tracking-wider uppercase">
                🔒 Strict anti-spam policy. Only drop notifications and VIP secret links.
              </p>
            </form>
          )}
        </div>

        {/* Feature Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-12 text-left">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-md shadow-xs">
            <span className="text-xs font-black text-[#E8262A] font-anton block mb-1">01 / EARLY ACCESS</span>
            <p className="text-[10px] text-neutral-300 leading-snug">
              VIP members receive checkout access 2 hours ahead of Instagram release.
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-md shadow-xs">
            <span className="text-xs font-black text-[#E8262A] font-anton block mb-1">02 / LIMITED BATCH</span>
            <p className="text-[10px] text-neutral-300 leading-snug">
              Numbered units, strictly made-to-order silhouettes. Zero restocks.
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-md shadow-xs">
            <span className="text-xs font-black text-[#E8262A] font-anton block mb-1">03 / ATELIER QUALITY</span>
            <p className="text-[10px] text-neutral-300 leading-snug">
              Custom-milled 380+ GSM heavyweight fabrics with bespoke hardware.
            </p>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        {showExploreButton && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {onExploreAll ? (
              <button
                type="button"
                onClick={onExploreAll}
                className="bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full transition-all active:scale-95"
              >
                &larr; Browse All Available Products
              </button>
            ) : (
              <Link
                href="/shop"
                className="bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full transition-all active:scale-95"
              >
                &larr; Browse Available Categories
              </Link>
            )}
            <Link
              href="/"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full transition-all"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
