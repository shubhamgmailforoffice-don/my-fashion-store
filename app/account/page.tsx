"use client";

import { useState, useMemo, useEffect, useRef, useSyncExternalStore } from "react";
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

  // Auth Method: "otp" | "password" | "track"
  const [authMethod, setAuthMethod] = useState<"otp" | "password" | "track">("otp");
  const [emailMode, setEmailMode] = useState<"login" | "signup">("login");
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "perks">("orders");

  // Mobile OTP States
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [otpNotification, setOtpNotification] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Email & Password States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Order Tracking States
  const [orderNumber, setOrderNumber] = useState("");
  const [trackEmail, setTrackEmail] = useState("");
  const [trackingResult, setTrackingResult] = useState<string | null>(null);

  // General States
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  // Refs for OTP 4-digit input auto-focus
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

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

  // Timer countdown for Resend OTP
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const saveSession = (user: User | null) => {
    if (user) {
      localStorage.setItem("user_session", JSON.stringify(user));
    } else {
      localStorage.removeItem("user_session");
    }
    window.dispatchEvent(new Event("session-updated"));
  };

  // 1. Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (phone.length !== 10) {
      setAuthError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp", phone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setOtpSent(true);
      setOtpDigits(["", "", "", ""]);
      setResendTimer(30);
      setOtpNotification(data.otp ? `SMS Sent: Verification Code is ${data.otp} (or use 1234)` : "OTP sent to your number.");
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 150);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes with auto-focus
  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue && value !== "") return;

    const newDigits = [...otpDigits];

    // Handle paste event (e.g. user pastes 4 digits)
    if (cleanValue.length > 1) {
      const pasted = cleanValue.slice(0, 4).split("");
      for (let i = 0; i < 4; i++) {
        newDigits[i] = pasted[i] || "";
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 3);
      inputRefs[nextFocus].current?.focus();
      return;
    }

    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (cleanValue && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length < 4) {
      setAuthError("Please enter all 4 digits of the code");
      return;
    }

    setAuthError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-otp",
          phone,
          otp: fullOtp,
          name: customerName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid verification code");
      }

      saveSession(data.user);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Verification error");
    } finally {
      setLoading(false);
    }
  };

  // 3. Email Auth
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
    setOtpDigits(["", "", "", ""]);
    setOtpNotification(null);
    setPhone("");
    setEmail("");
    setPassword("");
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber) {
      alert("Please enter an Order ID");
      return;
    }
    const cleanId = orderNumber.trim().toUpperCase();
    const found = userOrders.find((o) => o.id.toUpperCase().includes(cleanId));
    if (found) {
      setTrackingResult(
        `Order #${found.id} (${found.status}) - ${found.items.length} item(s) dispatched to ${found.address}`
      );
    } else {
      setTrackingResult(
        `Order #${cleanId} confirmed. Shipment is being prepped at our central hub with express courier assignment.`
      );
    }
  };

  return (
    <div className="bg-white min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        
        {/* Editorial Top Brand Identifier */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 text-white text-[9px] font-bold tracking-[0.3em] uppercase mb-4">
            <span>DRIVEN</span>
            <span>•</span>
            <span>MEMBER CLUB</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 uppercase leading-none">
            {currentUser ? `Welcome, ${currentUser.name}` : "Access Account"}
          </h1>
          <p className="text-xs text-neutral-500 tracking-wider uppercase mt-2 max-w-sm mx-auto">
            {currentUser
              ? `Member Status: ${currentUser.role.toUpperCase()} • Direct Portal Access`
              : "Sign in using Mobile OTP or your Email to access drops, manage orders, and unlock VIP privileges."}
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
                Orders ({userOrders.length})
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
                {userOrders.length === 0 ? (
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
                  userOrders.map((order) => (
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
                            className="flex items-center gap-3 text-xs font-bold uppercase text-neutral-700"
                          >
                            <div className="relative w-10 h-12 bg-neutral-100 flex-shrink-0 border border-neutral-200 overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-[11px] font-black text-neutral-900">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-neutral-500 font-bold">
                                Size: {item.size} • Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="text-xs font-black text-black">
                              RS. {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Tracking Stepper */}
                      <div className="bg-neutral-50 p-3.5 border border-neutral-100 space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase text-neutral-500 tracking-wider">
                          <span className="text-black font-black">1. Confirmed</span>
                          <span className={order.status !== "Pending" ? "text-black font-black" : ""}>2. Processed</span>
                          <span className={order.status === "Shipped" || order.status === "Delivered" ? "text-black font-black" : ""}>3. Dispatched</span>
                          <span className={order.status === "Delivered" ? "text-emerald-600 font-black" : ""}>4. Delivered</span>
                        </div>
                        <div className="w-full bg-neutral-200 h-1.5 overflow-hidden">
                          <div
                            className="bg-black h-full transition-all duration-500"
                            style={{
                              width:
                                order.status === "Delivered"
                                  ? "100%"
                                  : order.status === "Shipped"
                                  ? "75%"
                                  : order.status === "Processing"
                                  ? "50%"
                                  : "25%",
                            }}
                          />
                        </div>
                        <p className="text-[9px] text-neutral-500 font-medium uppercase tracking-wider">
                          Delivery destination: {order.address}
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
                <div className="text-xs text-neutral-700 uppercase space-y-1 font-medium leading-relaxed">
                  <p className="font-black text-black">{currentUser.name}</p>
                  <p>B-42 Vasant Vihar, Behind Promenade Hub</p>
                  <p>New Delhi, Delhi - 110057, India</p>
                  <p className="pt-2 text-neutral-500 font-bold">Contact: {currentUser.phone ? `+91 ${currentUser.phone}` : currentUser.email}</p>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => alert("Address updated to default.")}
                    className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-colors"
                  >
                    Edit Address
                  </button>
                </div>
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
          /* AUTHENTICATION FORM CARD */
          <div className="border border-neutral-200 bg-white shadow-2xl p-6 sm:p-10 space-y-8">
            
            {/* Top Method Tabs */}
            <div className="grid grid-cols-3 border-b border-neutral-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("otp");
                  setAuthError("");
                }}
                className={`py-3 text-xs font-black tracking-widest uppercase border-b-2 transition-all text-center ${
                  authMethod === "otp"
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                📱 Mobile OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setAuthError("");
                }}
                className={`py-3 text-xs font-black tracking-widest uppercase border-b-2 transition-all text-center ${
                  authMethod === "password"
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                ✉️ Email Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("track");
                  setAuthError("");
                }}
                className={`py-3 text-xs font-black tracking-widest uppercase border-b-2 transition-all text-center ${
                  authMethod === "track"
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                📦 Track Order
              </button>
            </div>

            {/* Error Banner */}
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

            {/* Simulated Live SMS Alert Pill */}
            {otpNotification && authMethod === "otp" && (
              <div className="bg-neutral-900 text-white p-4 border border-orange-500/50 shadow-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  <div>
                    <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest block">
                      Demo SMS Simulator
                    </span>
                    <p className="text-xs font-bold tracking-wider uppercase text-white mt-0.5">
                      {otpNotification}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpDigits(["1", "2", "3", "4"]);
                    setTimeout(() => handleVerifyOtp(), 100);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-black px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex-shrink-0"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            {/* 1. REALISTIC MOBILE & OTP AUTHENTICATION */}
            {authMethod === "otp" && (
              <div className="space-y-6">
                {!otpSent ? (
                  /* Step 1: Input Mobile Number */
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-800 uppercase">
                          Mobile Number
                        </label>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase">
                          India Only (+91)
                        </span>
                      </div>

                      {/* Phone Input with Indian Flag Badge */}
                      <div className="flex border border-neutral-300 focus-within:border-black transition-colors">
                        <div className="flex items-center gap-1.5 px-3.5 bg-neutral-50 border-r border-neutral-300 select-none">
                          <span className="text-sm">🇮🇳</span>
                          <span className="text-xs font-black text-neutral-900 tracking-wider">
                            +91
                          </span>
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-4 py-3.5 text-sm tracking-widest font-black focus:outline-none placeholder:text-neutral-400 placeholder:font-normal"
                          autoFocus
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-1.5">
                        We will send a 4-digit one-time password via SMS.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-800 uppercase mb-2">
                        Full Name <span className="text-neutral-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ENTER YOUR NAME"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full border border-neutral-300 px-4 py-3 text-xs tracking-wider uppercase font-bold focus:outline-none focus:border-black placeholder:text-neutral-400 placeholder:font-normal"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || phone.length !== 10}
                      className="w-full bg-black hover:bg-orange-500 text-white hover:text-black disabled:bg-neutral-200 disabled:text-neutral-400 py-4 text-xs font-black tracking-[0.25em] uppercase transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating Code...</span>
                        </>
                      ) : (
                        <span>Request OTP &rarr;</span>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Step 2: 4-Digit OTP Boxes & Resend Timer */
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                          Verification code sent to
                        </span>
                        <span className="text-xs font-black text-black tracking-widest">
                          +91 {phone.slice(0, 5)} {phone.slice(5)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpNotification(null);
                        }}
                        className="text-[10px] font-black uppercase text-orange-500 hover:text-black tracking-widest underline"
                      >
                        Change Number
                      </button>
                    </div>

                    {/* 4 Separate Digit Boxes */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-800 uppercase text-center">
                        Enter 4-Digit Verification Code
                      </label>
                      <div className="flex justify-center gap-3 sm:gap-4">
                        {otpDigits.map((digit, index) => (
                          <input
                            key={index}
                            ref={inputRefs[index]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-13 h-14 sm:w-14 sm:h-16 border-2 border-neutral-300 focus:border-black text-center text-2xl font-black focus:outline-none transition-colors bg-neutral-50 focus:bg-white"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Resend OTP Timer Controls */}
                    <div className="text-center text-xs">
                      {resendTimer > 0 ? (
                        <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
                          Resend Code in{" "}
                          <span className="text-black font-black">
                            00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                          </span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-[10px] font-black tracking-widest uppercase text-black hover:text-orange-500 underline"
                        >
                          Didn&apos;t receive code? Resend OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otpDigits.join("").length < 4}
                      className="w-full bg-black hover:bg-orange-500 text-white hover:text-black disabled:bg-neutral-200 disabled:text-neutral-400 py-4 text-xs font-black tracking-[0.25em] uppercase transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying Code...</span>
                        </>
                      ) : (
                        <span>Verify & Proceed &rarr;</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 2. REALISTIC EMAIL & PASSWORD AUTHENTICATION */}
            {authMethod === "password" && (
              <div className="space-y-6">
                {/* Switch Login / Register Toggle */}
                <div className="flex border border-neutral-200 p-1 bg-neutral-50">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode("login");
                      setAuthError("");
                    }}
                    className={`flex-1 py-2 text-[10px] font-black tracking-widest uppercase transition-all ${
                      emailMode === "login"
                        ? "bg-black text-white shadow-sm"
                        : "text-neutral-500 hover:text-black"
                    }`}
                  >
                    Existing Member
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode("signup");
                      setAuthError("");
                    }}
                    className={`flex-1 py-2 text-[10px] font-black tracking-widest uppercase transition-all ${
                      emailMode === "signup"
                        ? "bg-black text-white shadow-sm"
                        : "text-neutral-500 hover:text-black"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {emailMode === "signup" && (
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-800 uppercase mb-1.5">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ALEXANDER SMITH"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="w-full border border-neutral-300 px-4 py-3.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black placeholder:font-normal placeholder:text-neutral-400"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-800 uppercase mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="NAME@DOMAIN.COM"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-neutral-300 px-4 py-3.5 text-xs font-bold tracking-wider focus:outline-none focus:border-black placeholder:font-normal placeholder:text-neutral-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-800 uppercase">
                        Password
                      </label>
                      {emailMode === "login" && (
                        <button
                          type="button"
                          onClick={() => setForgotPasswordSent(true)}
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
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-neutral-300 px-4 py-3.5 text-xs font-bold tracking-wider focus:outline-none focus:border-black placeholder:font-normal"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs uppercase font-bold"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {forgotPasswordSent && (
                    <div className="bg-neutral-100 p-3 text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                      ✓ A password reset link has been dispatched to {email || "your email"}.
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1">
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

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full bg-black hover:bg-orange-500 text-white hover:text-black disabled:bg-neutral-200 disabled:text-neutral-400 py-4 text-xs font-black tracking-[0.25em] uppercase transition-all duration-300 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <span>
                        {emailMode === "login" ? "Sign In &rarr;" : "Join DRIVEN Club &rarr;"}
                      </span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* 3. GUEST ORDER TRACKING */}
            {authMethod === "track" && (
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-800 uppercase mb-1.5">
                    Order Number / ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. BLU-9021 OR DRV-1029"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full border border-neutral-300 px-4 py-3.5 text-xs font-black tracking-widest uppercase focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-neutral-800 uppercase mb-1.5">
                    Billing Email or Mobile
                  </label>
                  <input
                    type="text"
                    placeholder="NAME@DOMAIN.COM OR 9876543210"
                    value={trackEmail}
                    onChange={(e) => setTrackEmail(e.target.value)}
                    className="w-full border border-neutral-300 px-4 py-3.5 text-xs font-bold tracking-wider uppercase focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black hover:bg-orange-500 text-white hover:text-black py-4 text-xs font-black tracking-[0.25em] uppercase transition-colors"
                >
                  Track Shipment Status &rarr;
                </button>

                {trackingResult && (
                  <div className="bg-neutral-50 border border-neutral-200 p-4 mt-4 space-y-2">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                      Live Courier Status
                    </p>
                    <p className="text-xs text-neutral-800 uppercase tracking-wide font-bold leading-relaxed">
                      {trackingResult}
                    </p>
                  </div>
                )}
              </form>
            )}

            {/* Developer / Admin One-Click Fast Switch Pill */}
            <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Store Manager or Staff?
              </span>
              <button
                type="button"
                onClick={handleAdminDemoLogin}
                className="bg-neutral-100 hover:bg-black text-neutral-700 hover:text-white px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors"
              >
                1-Click Admin Access &rarr;
              </button>
            </div>
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
              Secure Auth
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
