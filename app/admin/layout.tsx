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
      // 1. Direct passkey check for admin
      if (adminPasswordInput === "admin123" || adminPasswordInput === "DRIIVN2026" || adminPasswordInput === "DRIVEN2026") {
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

      // 2. Authenticate against backend
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
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-bold">
            Verifying Admin Credentials...
          </p>
        </div>
      </div>
    );
  }

  // Access Denied / Passkey Gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#121212] border border-neutral-800 p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-block p-3 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-[9px] font-black tracking-[0.3em] text-orange-500 uppercase block">
              Security Protocol
            </span>
            <h1 className="text-xl font-black tracking-widest uppercase text-white">
              DRIIVN CONTROL CENTER
            </h1>
            <p className="text-xs text-neutral-400 uppercase tracking-wider">
              Restricted management area. Enter the administrative passkey to proceed.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                Admin Master Password
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="ENTER MASTER PASSKEY"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full bg-[#181818] border border-neutral-700 px-4 py-3 text-xs tracking-widest uppercase font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {adminAuthError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs font-bold uppercase">
                {adminAuthError}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-700 text-white py-3.5 text-xs font-black tracking-[0.2em] uppercase transition-colors"
            >
              {isVerifying ? "AUTHENTICATING..." : "UNLOCK CONTROL CENTER &rarr;"}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-800 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-neutral-500">
            <Link href="/" className="hover:text-white transition-colors">
              &larr; Back to Storefront
            </Link>
            <Link href="/account" className="hover:text-orange-400 transition-colors">
              Customer Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row font-sans">
      {/* Mobile Top Bar (Compact, logo & direct navigation, zero clutter) */}
      <header className="md:hidden bg-[#121212] border-b border-neutral-800 p-3.5 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <div>
              <span className="text-[8px] font-black tracking-[0.25em] text-orange-500 uppercase block">
                Control Center
              </span>
              <h1 className="text-sm font-black tracking-widest uppercase text-white leading-none">
                DRIIVN OPERATIONS
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 hover:text-white border border-neutral-800 px-2 py-1"
            >
              Storefront &rarr;
            </Link>
            <button
              onClick={handleAdminSignOut}
              title="Sign Out"
              className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center font-black text-[10px] text-white"
            >
              {adminUser?.name?.[0]?.toUpperCase() || "A"}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5 text-[10px] font-black tracking-wider uppercase">
          <Link
            href="/admin?tab=orders"
            className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white whitespace-nowrap"
          >
            Orders
          </Link>
          <Link
            href="/admin?tab=products"
            className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white whitespace-nowrap"
          >
            Products
          </Link>
          <Link
            href="/admin?tab=users"
            className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white whitespace-nowrap"
          >
            Users
          </Link>
          <Link
            href="/shop"
            target="_blank"
            className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:text-orange-300 whitespace-nowrap ml-auto"
          >
            Live Store ↗
          </Link>
        </div>
      </header>

      {/* Desktop Admin Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#121212] border-r border-neutral-800 flex-col justify-between p-6 flex-shrink-0">
        <div className="space-y-8">
          <div>
            <span className="text-[9px] font-black tracking-[0.3em] text-orange-500 uppercase block mb-1">
              Control Center
            </span>
            <div className="flex flex-col items-start gap-1">
              <Image
                src="/logo-white.png"
                alt="DRIIVN"
                width={140}
                height={18}
                className="h-5 w-auto object-contain"
              />
              <span className="text-[8px] font-black tracking-[0.25em] text-neutral-400 uppercase">
                OPERATIONS
              </span>
            </div>
          </div>

          <nav className="space-y-2">
            <Link
              href="/admin?tab=orders"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Orders & Dispatch</span>
            </Link>

            <Link
              href="/admin?tab=products"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Products & Photos</span>
            </Link>

            <Link
              href="/admin?tab=users"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wider uppercase rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Registered Users</span>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-black text-xs text-white">
                {adminUser?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="max-w-[120px]">
                <p className="text-xs font-bold text-white uppercase truncate">{adminUser?.name || "Admin"}</p>
                <p className="text-[10px] text-neutral-400 truncate">{adminUser?.email || "Operations"}</p>
              </div>
            </div>
            <button
              onClick={handleAdminSignOut}
              title="Lock Admin Portal"
              className="text-neutral-400 hover:text-orange-400 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
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
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
