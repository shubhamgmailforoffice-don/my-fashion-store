"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 text-black mb-14 lg:mb-0">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          
          {/* Brand Info (2 columns on md) */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-base font-black tracking-[0.25em] uppercase">
              BLUORNG
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed tracking-wider uppercase max-w-sm">
              Bluorng (pronounced “Blue~Orange”) is India’s premier luxury streetwear brand, founded in 2020. Focused on custom-milled heavyweight French Terry fabrics, bold graphics, and collectible drops.
            </p>
            <div className="pt-2 text-[10px] font-bold tracking-widest text-orange-500 uppercase">
              <span>DESIGNED IN INDIA • WORN WORLDWIDE</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-black tracking-widest uppercase mb-5">
              Collections
            </h3>
            <ul className="space-y-3 text-xs uppercase font-bold tracking-wider text-gray-500">
              <li>
                <Link href="/collections/winter-collection" className="hover:text-black transition-colors">
                  Winter 2025/26
                </Link>
              </li>
              <li>
                <Link href="/collections/racing-club" className="hover:text-black transition-colors">
                  Racing Club
                </Link>
              </li>
              <li>
                <Link href="/collections/essentials" className="hover:text-black transition-colors">
                  Basics & Cargos
                </Link>
              </li>
              <li>
                <Link href="/collections/blind-box" className="hover:text-black transition-colors">
                  Blind Box 26
                </Link>
              </li>
              <li>
                <Link href="/shop-by-color" className="hover:text-black transition-colors">
                  Shop by Color
                </Link>
              </li>
            </ul>
          </div>

          {/* Stores & Support */}
          <div>
            <h3 className="text-xs font-black tracking-widest uppercase mb-5">
              Stores & Help
            </h3>
            <ul className="space-y-3 text-xs uppercase font-bold tracking-wider text-gray-500">
              <li>
                <Link href="/stores" className="hover:text-black transition-colors">
                  Delhi • Mumbai • Hyderabad
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-black transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <span className="cursor-pointer hover:text-black transition-colors" onClick={() => alert("Complimentary express shipping on orders above ₹5,000 across India. Standard delivery takes 3-5 business days.")}>
                  Shipping Policy
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-black transition-colors" onClick={() => alert("7-day return and exchange window on unworn garments with original tags attached. Blind Box items are final sale.")}>
                  Returns & Exchanges
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Club */}
          <div>
            <h3 className="text-xs font-black tracking-widest uppercase mb-5">
              Join the Club
            </h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed mb-4">
              Get early access to secret drops, password vaults, and lookbook previews.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="ENTER EMAIL ADDRESS"
                className="w-full border-b border-black py-2 text-xs focus:outline-none placeholder:text-gray-400 tracking-widest uppercase"
              />
              <button
                type="submit"
                className="w-full bg-black text-white py-3 text-[10px] font-black tracking-widest uppercase hover:bg-orange-600 transition-colors"
              >
                {subscribed ? "✓ You Are On The List" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
            © 2026 BLUORNG. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Authenticity Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
