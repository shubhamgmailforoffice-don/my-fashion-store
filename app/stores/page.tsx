"use client";

import { stores } from "@/lib/data";
import Link from "next/link";

export default function StoresPage() {
  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 pb-8 mb-14 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-3">
          DRIIVN RETAIL SPACES
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-widest text-black uppercase">
          Flagship Stores
        </h1>
        <p className="text-xs text-gray-500 tracking-widest uppercase mt-2">
          Experience our physical architecture, tactile materials, and exclusive offline capsules.
        </p>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stores.map((store) => (
          <div
            key={store.name}
            className="border border-gray-200 p-8 bg-zinc-50 flex flex-col justify-between hover:border-black transition-all"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="text-sm font-black tracking-widest uppercase text-black">
                  {store.city}
                </span>
                <span className="bg-black text-white px-2.5 py-0.5 text-[8px] font-bold tracking-widest uppercase">
                  {store.status}
                </span>
              </div>

              <h2 className="text-xl font-black tracking-wider uppercase text-black">
                {store.name}
              </h2>

              <p className="text-xs text-gray-600 tracking-wide uppercase leading-relaxed">
                {store.address}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 space-y-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <p className="flex justify-between">
                <span className="text-gray-400">Timings:</span>
                <span className="text-black">{store.timing}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Phone:</span>
                <span className="text-black">{store.phone}</span>
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => alert(`Opening maps for ${store.name}...`)}
                  className="w-full bg-black text-white hover:bg-orange-600 py-3 text-[10px] font-black tracking-widest uppercase transition-colors"
                >
                  Get Directions &rarr;
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Concierge Banner */}
      <div className="mt-16 bg-black text-white p-8 sm:p-12 text-center space-y-4">
        <p className="text-[10px] font-black tracking-[0.3em] text-orange-500 uppercase">
          Client Services
        </p>
        <h3 className="text-2xl font-black uppercase tracking-widest">
          Personal Styling & Private Appointments
        </h3>
        <p className="text-xs text-gray-300 max-w-xl mx-auto uppercase tracking-widest leading-relaxed">
          Book a private fitting session at any of our flagship locations with our senior stylists.
        </p>
        <div className="pt-2">
          <Link
            href="/account"
            className="inline-block bg-white text-black hover:bg-orange-600 hover:text-white px-8 py-3.5 text-xs font-black tracking-widest uppercase transition-colors"
          >
            Contact Concierge
          </Link>
        </div>
      </div>
    </div>
  );
}
