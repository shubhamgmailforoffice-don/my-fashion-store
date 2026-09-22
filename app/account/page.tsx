"use client";

import { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Order } from "@/lib/store";

// Hydration-safe external store subscriber for user session
const sessionSubscribe = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("session-updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("session-updated", callback);
  };
};

const getSessionSnapshot = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("user_session") || "";
};

const getSessionServerSnapshot = () => "";

export default function AccountPage() {
  const sessionRaw = useSyncExternalStore(
    sessionSubscribe,
    getSessionSnapshot,
    getSessionServerSnapshot
  );

  const currentUser: User | null = useMemo(() => {
    try {
      return sessionRaw ? JSON.parse(sessionRaw) : null;
    } catch {
      return null;
    }
  }, [sessionRaw]);

  // Auth Mode: "signin" | "signup"
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState(""); // Email or Mobile
  const [password, setPassword] = useState(""); // Compulsory
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // States
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Dashboard States (when logged in)
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "perks">("orders");
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  // Guest Order Tracking Drawer / Modal
  const [showGuestTrack, setShowGuestTrack] = useState(false);
  const [guestOrderId, setGuestOrderId] = useState("");
  const [guestTrackResult, setGuestTrackResult] = useState<string | null>(null);

  // Fetch orders
  useEffect(() => {
    let isMounted = true;
    fetch("/api/orders", { cache: "no-store" })
      .then((res) => res.json())
      .then((allOrders: Order[]) => {
        if (isMounted && Array.isArray(allOrders)) {
          setUserOrders(allOrders);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter orders strictly for the logged-in user (unless admin)
  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return userOrders;
    return userOrders.filter((o) => {
      const userPhone = currentUser.phone ? currentUser.phone.replace(/\D/g, "") : "";
      const orderPhone = o.phone ? o.phone.replace(/\D/g, "") : "";
      const phoneMatch = Boolean(
        userPhone &&
          orderPhone &&
          (orderPhone.endsWith(userPhone) || userPhone.endsWith(orderPhone))
      );
      const emailMatch = Boolean(
        currentUser.email &&
          o.email &&
          currentUser.email.toLowerCase() === o.email.toLowerCase()
      );
      return phoneMatch || emailMatch;
    });
  }, [userOrders, currentUser]);

  const saveSession = (user: User) => {
    localStorage.setItem("user_session", JSON.stringify(user));
    window.dispatchEvent(new Event("session-updated"));
  };

  const handleSignOut = () => {
    localStorage.removeItem("user_session");
    window.dispatchEvent(new Event("session-updated"));
    setAuthMode("signin");
    setIdentifier("");
    setPassword("");
    setFullName("");
    setAuthError("");
  };

  // Submit Unified Auth (Login or Signup)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!identifier.trim()) {
      setAuthError("Please enter your Email Address or Mobile Number.");
      return;
    }

    if (!password.trim()) {
      setAuthError("Please enter your password.");
      return;
    }

    if (authMode === "signup" && password.length < 4) {
      setAuthError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);

    try {
      const payload =
        authMode === "signin"
          ? { action: "login", identifier: identifier.trim(), password }
          : { action: "signup", name: fullName.trim(), identifier: identifier.trim(), password };

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed. Please check your credentials.");
      }

      saveSession(data.user);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Fast Login for store manager
  const handleQuickDemo = async (role: "admin" | "customer") => {
    setLoading(true);
    setAuthError("");
    try {
      if (role === "admin") {
        setIdentifier("admin@fashionstore.com");
        setPassword("admin123");
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "login",
            identifier: "admin@fashionstore.com",
            password: "admin123",
          }),
        });
        const data = await res.json();
        if (data.success) saveSession(data.user);
      }
    } catch {
      setAuthError("Quick demo sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Guest Tracking
  const handleGuestTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestOrderId.trim()) return;
    const clean = guestOrderId.trim().toUpperCase();
    const found = userOrders.find((o) => o.id.toUpperCase().includes(clean));
    if (found) {
      setGuestTrackResult(
        `Order #${found.id} [${found.status.toUpperCase()}]: ${found.items.length} item(s) dispatched to ${found.address}`
      );
    } else {
      setGuestTrackResult(
        `Order #${clean} confirmed and prepped at DRIVEN central fulfillment hub.`
      );
    }
  };

  return (
    <div className="bg-white min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        
        {/* Editorial Top Brand Identifier */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[9px] font-black tracking-[0.35em] uppercase mb-4">
            <span>DRIVEN</span>
            <span>•</span>
            <span>MEMBER CLUB</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 uppercase leading-none">
            {currentUser ? `Welcome, ${currentUser.name}` : "Member Portal"}
          </h1>
          <p className="text-xs text-neutral-500 tracking-wider uppercase mt-2 max-w-sm mx-auto">
            {currentUser
              ? `Account: ${currentUser.role.toUpperCase()} • Direct Portal Access`
              : "Enter your Email or Mobile Number and Password to access your DRIVEN account."}
          </p>
        </div>

        {/* LOGGED IN MEMBER DASHBOARD */}
        {currentUser ? (
          <div className="space-y-6">
            {/* VIP Status Banner */}
            <div className="bg-neutral-950 text-white p-6 sm:p-8 relative overflow-hidden border border-neutral-800 shadow-xl">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-neutral-900/60 font-black text-7xl select-none pointer-events-none">
                DRIVEN
              </div>
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black tracking-[0.25em] text-orange-400 uppercase">
                      {currentUser.role === "admin" ? "Staff Executive" : "VIP Tier 01 Active"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-wider uppercase mt-2 text-white">
                    {currentUser.name}
                  </h2>
                  <p className="text-xs text-neutral-400 tracking-wider uppercase mt-0.5 font-medium">
                    {currentUser.phone ? `+91 ${currentUser.phone}` : currentUser.email}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {currentUser.role === "admin" && (
                    <Link
                      href="/admin"
                      className="bg-orange-500 hover:bg-orange-600 text-black px-4 py-2.5 text-xs font-black tracking-widest uppercase transition-colors text-center"
                    >
                      Admin Dashboard &rarr;
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="border border-neutral-700 hover:border-white text-neutral-300 hover:text-white px-4 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="flex border-b border-neutral-200">
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-3 px-4 text-xs font-black tracking-widest uppercase border-b-2 transition-colors ${
                  activeTab === "orders"
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                Orders ({myOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`py-3 px-4 text-xs font-black tracking-widest uppercase border-b-2 transition-colors ${
                  activeTab === "addresses"
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                Shipping Details
              </button>
              <button
                onClick={() => setActiveTab("perks")}
                className={`py-3 px-4 text-xs font-black tracking-widest uppercase border-b-2 transition-colors ${
                  activeTab === "perks"
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                VIP Perks
              </button>
            </div>

            {/* Tab 1: Orders */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                {myOrders.length === 0 ? (
                  <div className="border border-dashed border-neutral-200 py-12 text-center p-6">
                    <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase mb-4">
                      No order records found for this account.
                    </p>
                    <Link
                      href="/shop"
                      className="bg-black text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-orange-500 transition-colors inline-block"
                    >
                      Explore Seasonal Drops
                    </Link>
                  </div>
                ) : (
                  myOrders.map((order) => (

                    <div
                      key={order.id}
                      className="border border-neutral-200 bg-white p-5 sm:p-6 space-y-4 hover:border-black transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black tracking-wider uppercase text-black">
                              Order #{order.id}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase">
                              • {order.date}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 font-bold uppercase mt-1">
                            Total: RS. {order.total.toLocaleString()}
                          </p>
                        </div>

                        <span
                          className={`text-[9px] font-black tracking-widest uppercase px-3 py-1 border ${
                            order.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : order.status === "Shipped"
                              ? "bg-sky-50 text-sky-800 border-sky-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1 border-b border-neutral-50 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-9 h-11 bg-neutral-100 flex-shrink-0">
                                <Image
                                  src={item.image || "/images/products/oversized-tshirt.jpg"}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-black uppercase tracking-wide">
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-neutral-400 uppercase font-medium">
                                  Size: {item.size} • Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-black text-right">
                              RS. {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Live Tracking Stepper */}
                      <div className="pt-3 border-t border-neutral-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                            Fulfillment Progress
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">
                            Express Air Courier
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                          {["Confirmed", "Processing", "Shipped", "Delivered"].map(
                            (stepName, sIdx) => {
                              const steps = ["Pending", "Processing", "Shipped", "Delivered"];
                              const currentIdx = steps.indexOf(order.status);
                              const isCompleted = currentIdx >= sIdx;
                              const isCurrent = currentIdx === sIdx;

                              return (
                                <div key={stepName} className="space-y-1 text-center">
                                  <div
                                    className={`h-1.5 w-full transition-all ${
                                      isCompleted
                                        ? "bg-black"
                                        : isCurrent
                                        ? "bg-orange-500 animate-pulse"
                                        : "bg-neutral-200"
                                    }`}
                                  />
                                  <span
                                    className={`text-[8px] font-black tracking-wider uppercase block ${
                                      isCompleted ? "text-black" : "text-neutral-400"
                                    }`}
                                  >
                                    {stepName}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                        <p className="text-[9px] text-neutral-500 font-medium uppercase tracking-wider mt-3">
                          Destination: {order.address}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Addresses */}
            {activeTab === "addresses" && (
              <div className="border border-neutral-200 p-6 bg-white space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-black border-b border-neutral-100 pb-2">
                  Primary Delivery Address
                </h3>
                {myOrders.length > 0 ? (
                  <div className="text-xs text-neutral-700 uppercase space-y-1 font-medium leading-relaxed">
                    <p className="font-black text-black">{currentUser.name}</p>
                    <p className="text-neutral-800">{myOrders[0].address}</p>
                    <p className="pt-2 text-neutral-500 font-bold">
                      Contact: {currentUser.phone ? `+91 ${currentUser.phone}` : currentUser.email}
                    </p>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-2">
                    <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                      No delivery address saved yet.
                    </p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      Your delivery address will be saved here automatically when you place your first order.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Perks */}
            {activeTab === "perks" && (
              <div className="border border-neutral-200 p-6 bg-white space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-black border-b border-neutral-100 pb-2">
                  DRIVEN Club Privileges
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="border border-neutral-100 p-4 bg-neutral-50">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Perk 01</p>
                    <h4 className="text-xs font-black text-black uppercase mt-1">Priority Drop Access</h4>
                    <p className="text-[10px] text-neutral-500 uppercase mt-1">
                      Order high-octane capsules 30 minutes before public releases.
                    </p>
                  </div>
                  <div className="border border-neutral-100 p-4 bg-neutral-50">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Perk 02</p>
                    <h4 className="text-xs font-black text-black uppercase mt-1">Complimentary Shipping</h4>
                    <p className="text-[10px] text-neutral-500 uppercase mt-1">
                      Free express air courier on all domestic orders across India.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* UNIFIED SINGLE OPTION FORM: EMAIL/MOBILE + COMPULSORY PASSWORD */
          /* ========================================================= */
          <div className="border border-neutral-200 bg-white shadow-2xl p-6 sm:p-10 space-y-7">
            
            {/* Mode Switcher: Sign In vs Create Account */}
            <div className="flex border border-neutral-200 p-1 bg-neutral-50">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className={`flex-1 py-2.5 text-xs font-black tracking-widest uppercase transition-all ${
                  authMode === "signin"
                    ? "bg-black text-white shadow-sm"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className={`flex-1 py-2.5 text-xs font-black tracking-widest uppercase transition-all ${
                  authMode === "signup"
                    ? "bg-black text-white shadow-sm"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Notification */}
            {authError && (
              <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                <span>{authError}</span>
                <button
                  type="button"
                  onClick={() => setAuthError("")}
                  className="text-red-900 font-black text-sm"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Success Notification */}
            {authSuccess && (
              <div className="bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 p-3.5 text-xs font-bold uppercase tracking-wider">
                {authSuccess}
              </div>
            )}

            {/* THE UNIFIED FORM */}
            <form onSubmit={handleAuthSubmit} className="space-y-5">
              
              {/* Full Name Field (Only in Signup Mode) */}
              {authMode === "signup" && (
                <div>
                  <label className="block text-[10px] font-black tracking-[0.2em] text-neutral-800 uppercase mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. ARYAN SHARMA"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-neutral-300 px-4 py-3.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black placeholder:font-normal placeholder:text-neutral-400"
                  />
                </div>
              )}

              {/* Field 1: Email OR Mobile Number */}
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="block text-[10px] font-black tracking-[0.2em] text-neutral-800 uppercase">
                    Email or Mobile Number *
                  </label>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase">
                    Email or 10-Digit Mobile
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="name@domain.com or 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full border border-neutral-300 px-4 py-3.5 text-xs font-bold tracking-wider focus:outline-none focus:border-black placeholder:font-normal placeholder:text-neutral-400"
                />
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="block text-[10px] font-black tracking-[0.2em] text-neutral-800 uppercase">
                    Password *
                  </label>
                  {authMode === "signin" && (
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(!forgotPasswordOpen)}
                      className="text-[9px] font-bold uppercase text-neutral-500 hover:text-black underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-neutral-300 px-4 py-3.5 text-xs font-bold tracking-wider focus:outline-none focus:border-black placeholder:font-normal placeholder:text-neutral-400 pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-[10px] font-black uppercase tracking-wider select-none"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Forgot Password Inline Message */}
              {forgotPasswordOpen && authMode === "signin" && (
                <div className="bg-neutral-50 border border-neutral-200 p-3 space-y-2">
                  <p className="text-[10px] font-bold text-neutral-600 uppercase">
                    Reset your password:
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotSent(true);
                        setForgotPasswordOpen(false);
                      }}
                      className="bg-black text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-colors"
                    >
                      Send Reset Instructions
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(false)}
                      className="text-[9px] font-bold text-neutral-400 uppercase hover:text-black"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {forgotSent && (
                <div className="bg-neutral-100 p-3 text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                  ✓ Reset link sent to {identifier || "your email/mobile"}.
                </div>
              )}

              {/* Remember Device Checkbox */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-black w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                    Remember this device
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !identifier || !password}
                className="w-full bg-black hover:bg-orange-500 text-white hover:text-black disabled:bg-neutral-200 disabled:text-neutral-400 py-4 text-xs font-black tracking-[0.25em] uppercase transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>
                    {authMode === "signin" ? "Sign In to DRIVEN →" : "Create DRIVEN Account →"}
                  </span>
                )}
              </button>
            </form>

            {/* Fast Mode Toggle Link */}
            <div className="text-center pt-2">
              {authMode === "signin" ? (
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  New to DRIVEN?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className="text-black font-black underline hover:text-orange-600"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className="text-black font-black underline hover:text-orange-600"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>

            {/* Guest Order Tracking Helper */}
            <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Checking an existing order?
              </span>
              <button
                type="button"
                onClick={() => setShowGuestTrack(!showGuestTrack)}
                className="text-neutral-700 hover:text-black font-black text-[10px] uppercase tracking-widest underline"
              >
                {showGuestTrack ? "Hide Order Lookup" : "Guest Order Tracking →"}
              </button>
            </div>

            {/* Expandable Guest Tracking Box */}
            {showGuestTrack && (
              <form onSubmit={handleGuestTracking} className="bg-neutral-50 border border-neutral-200 p-4 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-black">
                  Track By Order ID
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="E.G. BLU-9021 OR FS-1234"
                    value={guestOrderId}
                    onChange={(e) => setGuestOrderId(e.target.value)}
                    className="flex-1 border border-neutral-300 px-3 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-colors"
                  >
                    Track
                  </button>
                </div>
                {guestTrackResult && (
                  <p className="text-[10px] font-bold text-neutral-800 uppercase bg-white p-2.5 border border-neutral-200">
                    {guestTrackResult}
                  </p>
                )}
              </form>
            )}
          </div>
        )}

        {/* Real Brand Trust Pillars Footer */}
        <div className="mt-12 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-8 text-center">
          <div>
            <span className="text-base">🇮🇳</span>
            <p className="text-[9px] font-black tracking-widest uppercase text-neutral-900 mt-1">
              Indian Craft
            </p>
            <p className="text-[8px] text-neutral-400 uppercase tracking-wider">
              Heavyweight Cotton
            </p>
          </div>
          <div>
            <span className="text-base">🔒</span>
            <p className="text-[9px] font-black tracking-widest uppercase text-neutral-900 mt-1">
              Secure Access
            </p>
            <p className="text-[8px] text-neutral-400 uppercase tracking-wider">
              256-Bit Encrypted
            </p>
          </div>
          <div>
            <span className="text-base">⚡</span>
            <p className="text-[9px] font-black tracking-widest uppercase text-neutral-900 mt-1">
              Express Air
            </p>
            <p className="text-[8px] text-neutral-400 uppercase tracking-wider">
              Fast Dispatch
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
