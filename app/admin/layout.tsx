"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row font-sans">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#121212] border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col justify-between p-6 flex-shrink-0">
        <div className="space-y-8">
          <div>
            <span className="text-[9px] font-black tracking-[0.3em] text-orange-500 uppercase block">
              Control Center
            </span>
            <h1 className="text-lg font-black tracking-widest uppercase text-white mt-1">
              FASHION ADMIN
            </h1>
          </div>

          <nav className="space-y-2">
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded transition-colors ${
                pathname === "/admin"
                  ? "bg-white text-black font-black"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Dashboard & Products</span>
            </Link>

            <Link
              href="/admin#orders"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Customer Orders</span>
            </Link>

            <Link
              href="/shop"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>View Live Store &rarr;</span>
            </Link>
          </nav>
        </div>

        <div className="pt-8 border-t border-neutral-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-black text-xs text-white">
              A
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase">Admin Session</p>
              <p className="text-[10px] text-neutral-400">admin@fashionstore.com</p>
            </div>
          </div>

          <Link
            href="/"
            className="block text-center w-full py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-[10px] font-bold tracking-widest uppercase transition-colors"
          >
            Exit to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
