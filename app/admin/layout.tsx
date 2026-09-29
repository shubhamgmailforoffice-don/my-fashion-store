"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; email?: string } | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    try {
      const rawSession = localStorage.getItem("user_session");
      if (rawSession) {
        const user = JSON.parse(rawSession);
        if (user && user.role === "admin") {
          setIsAdmin(true);
          setAdminUser({ name: user.name, email: user.email || "admin@fashionstore.com" });
          return;
        }
      }
      setIsAdmin(false);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError("");
    setIsVerifying(true);

    try {
      if (
        adminPasswordInput === "admin123" ||
        adminPasswordInput === "DRIIVN2026" ||
        adminPasswordInput === "DRIVEN2026"
      ) {
        const adminData = {
          id: "admin-1",
          name: "Head of Operations",
          email: "admin@fashionstore.com",
          role: "admin",
          createdAt: "2026-09-01",
        };
        localStorage.setItem("user_session", JSON.stringify(adminData));
        window.dispatchEvent(new Event("session-updated"));
        setIsAdmin(true);
        setAdminUser({ name: adminData.name, email: adminData.email });
        setIsVerifying(false);
        return;
      }

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          identifier: "admin@fashionstore.com",
          password: adminPasswordInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user && data.user.role === "admin") {
        localStorage.setItem("user_session", JSON.stringify(data.user));
        window.dispatchEvent(new Event("session-updated"));
        setIsAdmin(true);
        setAdminUser({ name: data.user.name, email: data.user.email });
      } else {
        setAdminAuthError(data.error || "Invalid administrator credentials. Access restricted.");
      }
    } catch {
      setAdminAuthError("Network authorization error. Please retry.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAdminSignOut = () => {
    localStorage.removeItem("user_session");
    window.dispatchEvent(new Event("session-updated"));
    setIsAdmin(false);
  };

  // Initial session verification state
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#E8E6DF] text-[#121212] flex items-center justify-center p-6 font-inter">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#E8262A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-600 font-bold">
            Verifying Admin Credentials...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated: Admin Login Modal
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#E8E6DF] text-[#121212] flex items-center justify-center p-4 font-inter">
        <div className="max-w-md w-full bg-white border border-neutral-300 shadow-2xl p-8 space-y-6 rounded-2xl">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8262A] block font-inter">
              Restricted Area &bull; Staff Authentication
            </span>
            <h1 className="text-2xl font-bold tracking-wider uppercase text-[#2C2A29] font-anton">
              DRIIVN CONTROL CENTER
            </h1>
            <p className="text-xs text-neutral-600">
              Enter administrative passkey to access inventory, sections, and dispatch desk.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-600 mb-1.5 font-inter">
                Admin Master Password
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="ENTER MASTER PASSKEY"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-4 py-3 text-xs tracking-widest uppercase font-mono text-black placeholder:text-neutral-400 focus:outline-none focus:border-[#E8262A] transition-colors"
              />
            </div>

            {adminAuthError && (
              <div className="p-3 bg-red-50 border border-red-200 text-[#E8262A] text-xs font-bold uppercase rounded-lg">
                {adminAuthError}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-[#E8262A] hover:bg-[#d01e22] disabled:bg-neutral-400 text-white py-3.5 text-xs font-black tracking-[0.2em] uppercase rounded-xl transition-all shadow-md active:scale-98"
            >
              {isVerifying ? "AUTHENTICATING..." : "UNLOCK CONTROL CENTER &rarr;"}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-200 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-neutral-500">
            <Link href="/" className="hover:text-black transition-colors">
              &larr; Back to Storefront
            </Link>
            <Link href="/account" className="hover:text-[#E8262A] transition-colors">
              Customer Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout with 90% #E8E6DF and 10% #E8262A theme
  return (
    <div className="min-h-screen bg-[#E8E6DF] text-[#121212] flex flex-col md:flex-row font-inter">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white border-b border-neutral-300 p-3.5 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8262A] animate-pulse" />
            <div>
              <span className="text-[8px] font-bold tracking-[0.25em] text-[#E8262A] uppercase block">
                Control Center
              </span>
              <h1 className="text-base font-bold tracking-widest uppercase text-[#2C2A29] font-anton leading-none">
                DRIIVN OPERATIONS
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-[9px] font-bold uppercase tracking-wider text-neutral-700 hover:text-black border border-neutral-300 rounded px-2 py-1 bg-neutral-100"
            >
              Storefront &rarr;
            </Link>
            <button
              onClick={handleAdminSignOut}
              title="Sign Out"
              className="w-7 h-7 rounded-full bg-[#E8262A] flex items-center justify-center font-black text-[10px] text-white"
            >
              {adminUser?.name?.[0]?.toUpperCase() || "A"}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5 text-[10px] font-bold tracking-wider uppercase">
          <Link
            href="/admin?tab=orders"
            className="px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded text-neutral-800 hover:bg-neutral-200 whitespace-nowrap"
          >
            Orders
          </Link>
          <Link
            href="/admin?tab=products"
            className="px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded text-neutral-800 hover:bg-neutral-200 whitespace-nowrap"
          >
            Products
          </Link>
          <Link
            href="/admin?tab=inventory"
            className="px-2.5 py-1 bg-white border border-[#E8262A] rounded text-[#E8262A] font-black whitespace-nowrap"
          >
            Inventory
          </Link>
          <Link
            href="/admin?tab=sections"
            className="px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded text-neutral-800 hover:bg-neutral-200 whitespace-nowrap"
          >
            Sections
          </Link>
          <Link
            href="/admin?tab=categories"
            className="px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded text-neutral-800 hover:bg-neutral-200 whitespace-nowrap"
          >
            Categories
          </Link>
          <Link
            href="/admin?tab=reels"
            className="px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded text-neutral-800 hover:bg-neutral-200 whitespace-nowrap"
          >
            Reels
          </Link>
          <Link
            href="/admin?tab=users"
            className="px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded text-neutral-800 hover:bg-neutral-200 whitespace-nowrap"
          >
            Users
          </Link>
          <Link
            href="/shop"
            target="_blank"
            className="px-2.5 py-1 bg-[#E8262A]/10 border border-[#E8262A]/30 text-[#E8262A] font-black rounded whitespace-nowrap ml-auto"
          >
            Live Store ↗
          </Link>
        </div>
      </header>

      {/* Desktop Admin Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-neutral-300 flex-col justify-between p-6 flex-shrink-0 shadow-sm">
        <div className="space-y-8">
          <div>
            <span className="text-[9px] font-black tracking-[0.3em] text-[#E8262A] uppercase block mb-1">
              Control Center
            </span>
            <div className="flex flex-col items-start gap-1">
              <Image
                src="/logo-black.png"
                alt="DRIIVN"
                width={140}
                height={18}
                className="h-5 w-auto object-contain"
              />
              <span className="text-[8px] font-black tracking-[0.25em] text-neutral-500 uppercase">
                OPERATIONS DESK
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <Link
              href="/admin?tab=orders"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded-xl text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-4 h-4 text-[#E8262A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>1. Orders & Dispatch</span>
            </Link>

            <Link
              href="/admin?tab=products"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded-xl text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-4 h-4 text-[#E8262A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>2. Products & Photos</span>
            </Link>

            {/* Inventory Management Tab */}
            <Link
              href="/admin?tab=inventory"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded-xl text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-4 h-4 text-[#E8262A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>3. Inventory & Stock</span>
            </Link>

            {/* Storefront Sections Manager Tab */}
            <Link
              href="/admin?tab=sections"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded-xl text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-4 h-4 text-[#E8262A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span>4. Storefront Sections</span>
            </Link>

            <Link
              href="/admin?tab=categories"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded-xl text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-4 h-4 text-[#E8262A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span>5. Categories & Menu</span>
            </Link>

            <Link
              href="/admin?tab=reels"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded-xl text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-4 h-4 text-[#E8262A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>6. Lookbook Reels</span>
            </Link>

            <Link
              href="/admin?tab=users"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded-xl text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-4 h-4 text-[#E8262A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>6. Registered Users</span>
            </Link>

            <Link
              href="/shop"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded-xl text-[#E8262A] hover:bg-[#E8262A]/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>View Live Store &rarr;</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8262A] flex items-center justify-center font-black text-xs text-white">
                {adminUser?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="max-w-[120px]">
                <p className="text-xs font-bold text-black uppercase truncate">{adminUser?.name || "Admin"}</p>
                <p className="text-[10px] text-neutral-500 truncate">{adminUser?.email || "Operations"}</p>
              </div>
            </div>
            <button
              onClick={handleAdminSignOut}
              title="Lock Admin Portal"
              className="text-neutral-500 hover:text-[#E8262A] transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <Link
            href="/"
            className="block text-center w-full py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-[10px] font-bold tracking-widest uppercase transition-colors rounded-lg text-black"
          >
            Exit to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Container in #E8E6DF */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
