"use client";

import { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
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

  const [authMethod, setAuthMethod] = useState<"otp" | "password" | "track">("otp");
  const [emailMode, setEmailMode] = useState<"login" | "signup">("login");

  // Mobile & OTP States
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpNotification, setOtpNotification] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");

  // Email & Password States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  // Order Tracking States
  const [orderNumber, setOrderNumber] = useState("");
  const [trackEmail, setTrackEmail] = useState("");
  const [trackingResult, setTrackingResult] = useState<string | null>(null);

  // User Orders
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Fetch orders from backend
  useEffect(() => {
    let isMounted = true;
    fetch("/api/orders")
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

  const saveSession = (user: User | null) => {
    if (user) {
      localStorage.setItem("user_session", JSON.stringify(user));
    } else {
      localStorage.removeItem("user_session");
    }
    window.dispatchEvent(new Event("session-updated"));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp", phone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setOtpSent(true);
      setOtpNotification(
        `SIMULATED SMS: Your Fashion Store OTP is ${data.otp} (or master code 1234)`
      );
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-otp",
          phone,
          otp: otpCode,
          name: customerName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid OTP code");
      }

      saveSession(data.user);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    try {
      const action = emailMode === "login" ? "login-email" : "signup-email";
      const payload =
        emailMode === "login"
          ? { action, email, password }
          : { action, name: signupName, email, password };

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      saveSession(data.user);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemoLogin = async () => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "admin-demo" }),
      });
      const data = await res.json();
      if (data.success) {
        saveSession(data.user);
      }
    } catch {
      // ignore
    }
  };

  const handleSignOut = () => {
    saveSession(null);
    setOtpSent(false);
    setOtpCode("");
    setOtpNotification(null);
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !trackEmail) {
      alert("Please provide both order number and email.");
      return;
    }
    setTrackingResult(
      `Order #${orderNumber} is confirmed and in production at our New Delhi fulfillment facility. Expected dispatch in 2 business days.`
    );
  };

  return (
    <div className="bg-white min-h-screen py-14 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6 mb-8 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-2">
          CLIENT PORTAL
        </p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-widest text-black uppercase">
          {currentUser ? `Welcome, ${currentUser.name}` : "Member Sign In"}
        </h1>
        <p className="text-xs text-gray-500 tracking-widest uppercase mt-2">
          {currentUser
            ? `Logged in as ${currentUser.role.toUpperCase()} • Member Access`
            : "Sign in with Mobile OTP or Email to manage drops, track orders, and view your bag."}
        </p>
      </div>

      {/* Logged In Dashboard View */}
      {currentUser ? (
        <div className="space-y-8">
          {/* User Profile Card */}
          <div className="border border-gray-200 p-6 bg-zinc-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="bg-black text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest">
                {currentUser.role === "admin" ? "Staff Admin" : "Verified Customer"}
              </span>
              <h2 className="text-xl font-black text-black uppercase mt-2">
                {currentUser.name}
              </h2>
              <p className="text-xs text-gray-600 tracking-wider uppercase mt-0.5">
                {currentUser.email || `+91 ${currentUser.phone}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {currentUser.role === "admin" && (
                <Link
                  href="/admin"
                  className="bg-orange-600 text-white hover:bg-black px-4 py-2.5 text-xs font-black tracking-widest uppercase transition-colors text-center"
                >
                  Go to Admin Panel &rarr;
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="border border-gray-300 hover:border-black text-gray-700 hover:text-black px-4 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Quick Admin Access Banner for Easy Testing */}
          {currentUser.role !== "admin" && (
            <div className="border border-dashed border-gray-300 p-4 bg-zinc-50 flex justify-between items-center text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                Want to test changing images & managing products?
              </span>
              <button
                onClick={handleAdminDemoLogin}
                className="bg-black text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors"
              >
                Switch to Admin Mode &rarr;
              </button>
            </div>
          )}

          {/* Active Orders List */}
          <div className="space-y-4">
            <h3 className="text-sm font-black tracking-widest uppercase text-black border-b border-gray-100 pb-2">
              Recent Order History
            </h3>

            {userOrders.length === 0 ? (
              <p className="text-xs text-gray-500 uppercase tracking-wider py-6 text-center border border-dashed border-gray-200">
                No orders placed yet. Explore our latest drops in the shop.
              </p>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 p-5 bg-white space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          Order #{order.id} • {order.date}
                        </span>
                        <p className="text-xs font-black uppercase text-black">
                          Total: RS. {order.total.toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {order.items.map((it, idx) => (
                        <p
                          key={idx}
                          className="text-[10px] text-gray-600 uppercase font-bold tracking-wider"
                        >
                          {it.quantity}x {it.name} ({it.size}) — RS.{" "}
                          {(it.price * it.quantity).toLocaleString()}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Sign In / Sign Up Forms */
        <div className="space-y-8">
          {/* Method Navigation Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setAuthMethod("otp");
                setAuthError("");
              }}
              className={`flex-1 py-3 text-xs font-black tracking-widest uppercase border-b-2 transition-colors ${
                authMethod === "otp"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              Mobile & OTP
            </button>
            <button
              onClick={() => {
                setAuthMethod("password");
                setAuthError("");
              }}
              className={`flex-1 py-3 text-xs font-black tracking-widest uppercase border-b-2 transition-colors ${
                authMethod === "password"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => {
                setAuthMethod("track");
                setAuthError("");
              }}
              className={`flex-1 py-3 text-xs font-black tracking-widest uppercase border-b-2 transition-colors ${
                authMethod === "track"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              Track Order
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 font-bold uppercase tracking-wider">
              {authError}
            </div>
          )}

          {/* 1. Mobile & OTP Method */}
          {authMethod === "otp" && (
            <div className="space-y-6">
              {/* Simulated SMS Alert Banner */}
              {otpNotification && (
                <div className="bg-black text-white p-4 border-l-4 border-orange-500 shadow-md">
                  <p className="text-[10px] font-black tracking-widest uppercase text-orange-400">
                    Live SMS Simulation
                  </p>
                  <p className="text-xs font-bold tracking-wider mt-1 uppercase">
                    {otpNotification}
                  </p>
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">
                      Enter 10-Digit Mobile Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-xs font-bold text-gray-600">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full border border-gray-300 px-4 py-3 text-xs tracking-wider focus:outline-none focus:border-black font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-1">
                      Your Name (Optional for First-Time Registration)
                    </label>
                    <input
                      type="text"
                      placeholder="ENTER FULL NAME"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border border-gray-300 px-4 py-3 text-xs tracking-wider focus:outline-none focus:border-black uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="w-full bg-black text-white hover:bg-orange-600 disabled:bg-gray-400 py-4 text-xs font-black tracking-[0.2em] uppercase transition-colors"
                  >
                    {loading ? "Sending OTP..." : "Send Verification OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 uppercase font-bold">
                      Sent to +91 {phone}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-orange-500 font-bold uppercase underline"
                    >
                      Change Number
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">
                      Enter 4-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="• • • •"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      autoFocus
                      className="w-full border border-gray-300 px-4 py-3 text-center text-xl tracking-[0.5em] font-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 4}
                    className="w-full bg-black text-white hover:bg-orange-600 disabled:bg-gray-400 py-4 text-xs font-black tracking-[0.2em] uppercase transition-colors"
                  >
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 2. Email & Password Method */}
          {authMethod === "password" && (
            <div className="space-y-6">
              {/* Toggle Login / Register */}
              <div className="flex gap-4 border-b border-gray-100 pb-3">
                <button
                  type="button"
                  onClick={() => setEmailMode("login")}
                  className={`text-xs font-bold uppercase tracking-wider ${
                    emailMode === "login"
                      ? "text-black border-b-2 border-black pb-1"
                      : "text-gray-400"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setEmailMode("signup")}
                  className={`text-xs font-bold uppercase tracking-wider ${
                    emailMode === "signup"
                      ? "text-black border-b-2 border-black pb-1"
                      : "text-gray-400"
                  }`}
                >
                  Create New Account
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {emailMode === "signup" && (
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="YOUR FULL NAME"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full border border-gray-300 px-4 py-3 text-xs tracking-wider uppercase focus:outline-none focus:border-black"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ENTER YOUR EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 text-xs tracking-wider uppercase focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 text-xs tracking-wider focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white hover:bg-orange-600 disabled:bg-gray-400 py-4 text-xs font-black tracking-[0.2em] uppercase transition-colors"
                >
                  {loading
                    ? "Authenticating..."
                    : emailMode === "login"
                    ? "Sign In With Password"
                    : "Create Account"}
                </button>
              </form>
            </div>
          )}

          {/* 3. Track Order Method */}
          {authMethod === "track" && (
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">
                  Order Number (e.g. BLU-9021)
                </label>
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="ENTER ORDER NUMBER"
                  className="w-full border border-gray-300 px-4 py-3 text-xs tracking-wider uppercase focus:outline-none focus:border-black font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">
                  Billing Email
                </label>
                <input
                  type="email"
                  required
                  value={trackEmail}
                  onChange={(e) => setTrackEmail(e.target.value)}
                  placeholder="ENTER ASSOCIATED EMAIL"
                  className="w-full border border-gray-300 px-4 py-3 text-xs tracking-wider uppercase focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white hover:bg-orange-600 py-4 text-xs font-black tracking-[0.2em] uppercase transition-colors"
              >
                Track Status
              </button>

              {trackingResult && (
                <div className="mt-4 p-4 border border-black bg-zinc-50 text-xs font-bold tracking-wider text-black uppercase leading-relaxed">
                  {trackingResult}
                </div>
              )}
            </form>
          )}

          {/* One-Click Admin Demo Login Shortcut */}
          <div className="border-t border-gray-100 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50 p-4">
            <div>
              <p className="text-xs font-black text-black uppercase">Store Administrator Access</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                Demo credentials: admin@fashionstore.com / admin123
              </p>
            </div>
            <button
              onClick={handleAdminDemoLogin}
              className="bg-black text-white hover:bg-orange-600 px-4 py-2.5 text-[10px] font-black tracking-widest uppercase transition-colors"
            >
              1-Click Admin Access &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
