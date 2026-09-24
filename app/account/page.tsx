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
  window.addEventListener("orders-updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("session-updated", callback);
    window.removeEventListener("orders-updated", callback);
  };
};

export interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  type: "Home" | "Work" | "Other";
  isDefault: boolean;
}

import { STATE_CITIES_MAP, INDIAN_STATES } from "@/lib/indiaLocations";

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
  const [password, setPassword] = useState("");
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

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<SavedAddress, "id">>({
    name: "",
    phone: "",
    street: "",
    city: "New Delhi",
    state: "Delhi",
    pincode: "",
    type: "Home",
    isDefault: false,
  });

  // Manual Secure Order Link input
  const [linkOrderIdInput, setLinkOrderIdInput] = useState("");
  const [linkContactInput, setLinkContactInput] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkOrderMsg, setLinkOrderMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Guest Order Tracking Drawer / Modal
  const [showGuestTrack, setShowGuestTrack] = useState(false);
  const [guestOrderId, setGuestOrderId] = useState("");
  const [guestTrackResult, setGuestTrackResult] = useState<string | null>(null);

  // Fetch orders from API
  const fetchOrders = () => {
    fetch("/api/orders", { cache: "no-store" })
      .then((res) => res.json())
      .then((allOrders: Order[]) => {
        if (Array.isArray(allOrders)) {
          setUserOrders(allOrders);
        }
      })
      .catch(() => {});
  };

  // Real-time live synchronization (Auto-sync without reload)
  useEffect(() => {
    fetchOrders();
    const handleOrderUpdate = () => fetchOrders();
    window.addEventListener("orders-updated", handleOrderUpdate);

    // Cross-tab sync via localStorage storage event
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === "app_orders_last_updated") {
        fetchOrders();
      }
    };
    window.addEventListener("storage", handleStorageUpdate);

    // Cross-tab sync via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("driivn_orders_sync");
      channel.onmessage = () => fetchOrders();
    } catch {}

    // Live background polling (every 4 seconds) so admin status updates appear automatically
    const pollTimer = setInterval(fetchOrders, 4000);
    window.addEventListener("focus", handleOrderUpdate);

    return () => {
      window.removeEventListener("orders-updated", handleOrderUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("focus", handleOrderUpdate);
      clearInterval(pollTimer);
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
    };
  }, []);

  // Filter orders strictly for the logged-in user
  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return userOrders;

    const userPhoneClean = (currentUser.phone || "").replace(/\D/g, "");
    const userEmailClean = (currentUser.email || "").toLowerCase().trim();

    // Specific order IDs linked directly to this account
    const accountOrderIds: string[] = (() => {
      try {
        const list: string[] = [];
        if (userEmailClean) {
          const stored = localStorage.getItem(`account_order_ids_${userEmailClean}`);
          if (stored) list.push(...JSON.parse(stored));
        }
        if (userPhoneClean) {
          const stored = localStorage.getItem(`account_order_ids_${userPhoneClean}`);
          if (stored) list.push(...JSON.parse(stored));
        }
        return list;
      } catch {
        return [];
      }
    })();

    return userOrders.filter((o) => {
      // 1. Explicitly linked to this user's account (only if no conflicting different email)
      if (accountOrderIds.includes(o.id)) {
        if (!o.email || !userEmailClean || o.email.toLowerCase().trim() === userEmailClean) {
          return true;
        }
      }

      // 2. Exact email match
      if (userEmailClean && o.email && userEmailClean === o.email.toLowerCase().trim()) return true;

      // 3. Exact 10-digit mobile number match
      const orderPhoneClean = (o.phone || "").replace(/\D/g, "");
      if (userPhoneClean && orderPhoneClean) {
        if (orderPhoneClean === userPhoneClean || orderPhoneClean.endsWith(userPhoneClean) || userPhoneClean.endsWith(orderPhoneClean)) {
          return true;
        }
      }

      return false;
    });
  }, [userOrders, currentUser]);

  // Address book synchronization (Strictly per-user, zero default leaks)
  const getAddressKey = () => (currentUser ? `user_addresses_${currentUser.id || currentUser.email || currentUser.phone}` : "user_addresses_guest");

  useEffect(() => {
    if (!currentUser) {
      setSavedAddresses([]);
      return;
    }
    try {
      const stored = localStorage.getItem(getAddressKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedAddresses(Array.isArray(parsed) ? parsed : []);
      } else {
        // Fresh accounts start with 0 addresses (no inheritance from guest or other accounts)
        setSavedAddresses([]);
      }
    } catch {
      setSavedAddresses([]);
    }
  }, [currentUser]);

  const saveAddressesToStorage = (updated: SavedAddress[]) => {
    setSavedAddresses(updated);
    try {
      localStorage.setItem(getAddressKey(), JSON.stringify(updated));
    } catch {}
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
      street: "",
      state: "Delhi",
      city: STATE_CITIES_MAP["Delhi"]?.[0] || "New Delhi",
      pincode: "",
      type: "Home",
      isDefault: savedAddresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      state: addr.state || "Delhi",
      city: addr.city || (STATE_CITIES_MAP[addr.state || "Delhi"]?.[0] || "New Delhi"),
      pincode: addr.pincode,
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.phone || !addressForm.street || !addressForm.pincode) {
      alert("Please fill in all required address fields.");
      return;
    }

    let updated: SavedAddress[];
    if (editingAddressId) {
      updated = savedAddresses.map((a) => {
        if (a.id === editingAddressId) {
          return { ...addressForm, id: a.id };
        }
        return addressForm.isDefault ? { ...a, isDefault: false } : a;
      });
    } else {
      const newAddr: SavedAddress = {
        ...addressForm,
        id: `addr_${Date.now()}`,
        isDefault: addressForm.isDefault || savedAddresses.length === 0,
      };
      updated = addressForm.isDefault
        ? savedAddresses.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
        : [...savedAddresses, newAddr];
    }

    saveAddressesToStorage(updated);
    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (!confirm("Are you sure you want to remove this saved address?")) return;
    const remaining = savedAddresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    saveAddressesToStorage(remaining);
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = savedAddresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveAddressesToStorage(updated);
  };

  // Helper to link order ID securely via backend authentication
  const handleLinkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkOrderMsg(null);
    if (!linkOrderIdInput.trim()) return;

    setLinkLoading(true);
    try {
      const res = await fetch("/api/orders/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: linkOrderIdInput.trim(),
          currentUserEmail: currentUser?.email,
          currentUserPhone: currentUser?.phone,
          verificationContact: linkContactInput.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLinkOrderMsg({
          text: data.error || "Failed to link order. Security verification failed.",
          success: false,
        });
        setLinkLoading(false);
        return;
      }

      // Secure link confirmed: save to account_order_ids for immediate display
      const userKey = (currentUser?.email || currentUser?.phone || "").toLowerCase().trim();
      if (userKey && data.orderId) {
        const key = `account_order_ids_${userKey}`;
        const stored: string[] = JSON.parse(localStorage.getItem(key) || "[]");
        if (!stored.includes(data.orderId)) {
          stored.unshift(data.orderId);
          localStorage.setItem(key, JSON.stringify(stored));
        }
      }

      setLinkOrderMsg({
        text: data.message || `Order #${data.orderId} verified and linked successfully!`,
        success: true,
      });
      setLinkOrderIdInput("");
      setLinkContactInput("");

      // Notify all tabs and refresh local orders list
      try {
        localStorage.setItem("app_orders_last_updated", String(Date.now()));
        const channel = new BroadcastChannel("driivn_orders_sync");
        channel.postMessage({ type: "order_linked", orderId: data.orderId });
        channel.close();
      } catch {}
      window.dispatchEvent(new Event("orders-updated"));
      fetchOrders();
    } catch (err) {
      setLinkOrderMsg({ text: "An error occurred while linking your order: " + String(err), success: false });
    } finally {
      setLinkLoading(false);
    }
  };

  const saveSession = (user: User) => {
    localStorage.setItem("user_session", JSON.stringify(user));
    window.dispatchEvent(new Event("session-updated"));
  };

  const handleSignOut = () => {
    localStorage.removeItem("user_session");
    window.dispatchEvent(new Event("session-updated"));
    setSavedAddresses([]);
    setAuthMode("signin");
    setIdentifier("");
    setPassword("");
    setFullName("");
    setAuthError("");
    setLinkOrderMsg(null);
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
        `Order #${clean} confirmed and prepped at DRIIVN central fulfillment hub.`
      );
    }
  };

  return (
    <div className="bg-white min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className={`${currentUser ? "max-w-4xl" : "max-w-lg"} mx-auto`}>
        
        {/* Editorial Top Brand Identifier */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[9px] font-black tracking-[0.35em] uppercase mb-4">
            <span>DRIIVN</span>
            <span>•</span>
            <span>MEMBER CLUB</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 uppercase leading-none">
            {currentUser ? `Welcome, ${currentUser.name}` : "Member Portal"}
          </h1>
          <p className="text-xs text-neutral-500 tracking-wider uppercase mt-2 max-w-sm mx-auto">
            {currentUser
              ? `Account: ${currentUser.role.toUpperCase()} • Direct Portal Access`
              : "Enter your Email or Mobile Number and Password to access your DRIIVN account."}
          </p>
        </div>

        {/* LOGGED IN MEMBER DASHBOARD */}
        {currentUser ? (
          <div className="space-y-8">
            {/* VIP Status Banner */}
            <div className="bg-neutral-950 text-white p-6 sm:p-8 relative overflow-hidden border border-neutral-800 shadow-xl">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-neutral-900/60 font-black text-7xl select-none pointer-events-none">
                DRIIVN
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

              {/* Quick Member Stats Bar */}
              <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-neutral-800/80">
                <div>
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Total Orders</p>
                  <p className="text-xl font-black text-white mt-0.5">{myOrders.length}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Delivered</p>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">
                    {myOrders.filter((o) => o.status === "Delivered").length}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Saved Addresses</p>
                  <p className="text-xl font-black text-orange-400 mt-0.5">{savedAddresses.length}</p>
                </div>
              </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="flex border-b border-neutral-200 gap-x-2">
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-3 px-5 text-xs font-black tracking-widest uppercase border-b-2 transition-colors ${
                  activeTab === "orders"
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                Orders ({myOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`py-3 px-5 text-xs font-black tracking-widest uppercase border-b-2 transition-colors ${
                  activeTab === "addresses"
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                Saved Addresses ({savedAddresses.length})
              </button>
              <button
                onClick={() => setActiveTab("perks")}
                className={`py-3 px-5 text-xs font-black tracking-widest uppercase border-b-2 transition-colors ${
                  activeTab === "perks"
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                VIP Privileges
              </button>
            </div>

            {/* TAB 1: ORDERS */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                {/* 1-Click Secure Order Link Helper */}
                <div className="bg-neutral-50 border border-neutral-200 p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-sm">
                    <p className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                      Placed an order as guest or earlier?
                    </p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider leading-relaxed">
                      Enter Order ID and checkout phone/email to verify identity and link the order securely.
                    </p>
                  </div>
                  <form onSubmit={handleLinkOrder} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <input
                      type="text"
                      placeholder="ORDER ID (E.G. FS-4253)"
                      value={linkOrderIdInput}
                      onChange={(e) => setLinkOrderIdInput(e.target.value)}
                      required
                      className="border border-neutral-300 px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-white focus:outline-none focus:border-black w-full sm:w-44"
                    />
                    <input
                      type="text"
                      placeholder="MOBILE OR EMAIL (OPTIONAL)"
                      value={linkContactInput}
                      onChange={(e) => setLinkContactInput(e.target.value)}
                      title="Enter mobile or email used during guest checkout if different from current account"
                      className="border border-neutral-300 px-3 py-2 text-xs font-bold uppercase tracking-wider bg-white focus:outline-none focus:border-black w-full sm:w-52"
                    />
                    <button
                      type="submit"
                      disabled={linkLoading}
                      className="bg-black hover:bg-orange-600 disabled:bg-neutral-400 text-white px-5 py-2 text-xs font-black tracking-widest uppercase whitespace-nowrap transition-colors flex items-center justify-center gap-1.5"
                    >
                      {linkLoading ? "VERIFYING..." : "LINK ORDER"}
                    </button>
                  </form>
                </div>

                {linkOrderMsg && (
                  <div
                    className={`p-3 text-xs font-bold uppercase border-l-4 ${
                      linkOrderMsg.success
                        ? "bg-emerald-50 text-emerald-800 border-emerald-600"
                        : "bg-red-50 text-red-700 border-red-600"
                    }`}
                  >
                    {linkOrderMsg.text}
                  </div>
                )}

                {myOrders.length === 0 ? (
                  <div className="border border-dashed border-neutral-200 py-16 text-center p-6 bg-neutral-50/50">
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
                  <div className="space-y-4">
                    {myOrders.map((order) => {
                      const isCOD = order.address.includes("COD");
                      const isUPI = order.address.includes("UPI");
                      const trackingMatch = order.address.match(/\[Tracking:\s*(.*?)\]/i);
                      const trackingInfo = trackingMatch ? trackingMatch[1] : null;
                      const cleanDisplayAddress = order.address
                        .replace(/\[Payment:.*?\]/i, "")
                        .replace(/\[Tracking:.*?\]/i, "")
                        .trim();

                      return (
                        <div
                          key={order.id}
                          className="border border-neutral-200 bg-white p-5 sm:p-6 space-y-4 hover:border-black transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-100 pb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black tracking-wider uppercase text-black font-mono">
                                  Order #{order.id}
                                </span>
                                <span className="text-[10px] text-neutral-400 font-bold uppercase">
                                  • {order.date}
                                </span>
                                <span
                                  className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-xs ${
                                    isCOD
                                      ? "bg-neutral-100 text-neutral-800 border border-neutral-300"
                                      : isUPI
                                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                                      : "bg-neutral-100 text-neutral-800"
                                  }`}
                                >
                                  {isCOD ? "Cash on Delivery" : isUPI ? "UPI Paid" : "Prepaid"}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-700 font-bold uppercase mt-1">
                                Total: RS. {order.total.toLocaleString()}
                              </p>
                            </div>

                            <span
                              className={`text-[9px] font-black tracking-widest uppercase px-3 py-1 border self-start sm:self-auto ${
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

                          {/* Items List */}
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs py-1 border-b border-neutral-50 last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative w-10 h-12 bg-neutral-100 flex-shrink-0">
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
                                      Size: {item.size} • Qty: {item.quantity} {item.color ? `• Color: ${item.color}` : ""}
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
                                Fulfillment Tracker
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
                            <p className="text-[10px] text-neutral-600 font-medium uppercase tracking-wider mt-3">
                              <span className="font-bold text-black">Delivery To:</span> {cleanDisplayAddress}
                            </p>

                            {/* Live Courier Dispatch Pill */}
                            {trackingInfo && (
                              <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">📦</span>
                                  <div>
                                    <p className="text-[9px] font-black uppercase text-neutral-500 tracking-wider">
                                      Courier Partner & AWB
                                    </p>
                                    <p className="text-xs font-mono font-bold text-black uppercase">
                                      {trackingInfo}
                                    </p>
                                  </div>
                                </div>
                                <a
                                  href={`https://www.google.com/search?q=track+${encodeURIComponent(trackingInfo)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-black hover:bg-orange-600 text-white px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors inline-block"
                                >
                                  Track Courier &rarr;
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SAVED ADDRESSES (FULL CRUD) */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-black">
                      Saved Delivery Addresses
                    </h3>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider mt-0.5">
                      Manage multiple shipping destinations for instant 1-click checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="bg-black hover:bg-orange-600 text-white px-4 py-2.5 text-xs font-black tracking-widest uppercase transition-colors flex items-center gap-1.5"
                  >
                    <span>+ Add New Address</span>
                  </button>
                </div>

                {savedAddresses.length === 0 ? (
                  <div className="border border-dashed border-neutral-200 p-8 text-center bg-neutral-50/50 space-y-3">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      No saved addresses found.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="bg-black hover:bg-orange-600 text-white px-5 py-2.5 text-xs font-black tracking-widest uppercase transition-colors"
                    >
                      + Add Primary Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`border p-5 relative flex flex-col justify-between transition-colors ${
                          addr.isDefault
                            ? "border-black bg-white shadow-xs"
                            : "border-neutral-200 bg-white hover:border-neutral-400"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 bg-neutral-100 text-neutral-800">
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-black tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                                Default Address
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-black uppercase text-black">
                            {addr.name}
                          </h4>
                          <p className="text-xs text-neutral-500 font-bold uppercase mt-0.5">
                            +91 {addr.phone}
                          </p>
                          <p className="text-xs text-neutral-700 uppercase mt-2 leading-relaxed">
                            {addr.street}
                          </p>
                          <p className="text-xs text-neutral-700 uppercase font-bold mt-1">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                          {!addr.isDefault ? (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-[10px] text-neutral-500 hover:text-black underline"
                            >
                              Set as Default
                            </button>
                          ) : (
                            <span className="text-[10px] text-neutral-400">Primary</span>
                          )}

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAddress(addr)}
                              className="text-[10px] text-black hover:text-orange-600 font-black"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-[10px] text-red-600 hover:text-red-800 font-black"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PERKS & PRIVILEGES */}
            {activeTab === "perks" && (
              <div className="border border-neutral-200 p-6 bg-white space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-black border-b border-neutral-100 pb-3">
                  DRIIVN Member Privileges
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-neutral-100 p-5 bg-neutral-50">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Perk 01</p>
                    <h4 className="text-xs font-black text-black uppercase mt-1">Priority Drop Access</h4>
                    <p className="text-[10px] text-neutral-500 uppercase mt-1">
                      Order limited streetwear capsules 30 minutes before public releases.
                    </p>
                  </div>
                  <div className="border border-neutral-100 p-5 bg-neutral-50">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Perk 02</p>
                    <h4 className="text-xs font-black text-black uppercase mt-1">Complimentary Air Shipping</h4>
                    <p className="text-[10px] text-neutral-500 uppercase mt-1">
                      Free express air courier on all domestic orders across India.
                    </p>
                  </div>
                  <div className="border border-neutral-100 p-5 bg-neutral-50">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Perk 03</p>
                    <h4 className="text-xs font-black text-black uppercase mt-1">Direct Concierge</h4>
                    <p className="text-[10px] text-neutral-500 uppercase mt-1">
                      Dedicated priority support via WhatsApp for fit guidance and exchanges.
                    </p>
                  </div>
                  <div className="border border-neutral-100 p-5 bg-neutral-50">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Perk 04</p>
                    <h4 className="text-xs font-black text-black uppercase mt-1">Flagship Invites</h4>
                    <p className="text-[10px] text-neutral-500 uppercase mt-1">
                      Exclusive private invites to launch parties at Delhi & Mumbai flagship stores.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ADD / EDIT ADDRESS MODAL */}
            {isAddressModalOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                <div className="bg-white border border-neutral-300 w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                    <h3 className="text-sm font-black tracking-wider uppercase text-black">
                      {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(false)}
                      className="text-neutral-400 hover:text-black text-xl font-bold p-1"
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          className="w-full border border-neutral-300 px-3 py-2.5 text-xs font-bold uppercase focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-700 mb-1">
                          10-Digit Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, "") })}
                          className="w-full border border-neutral-300 px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-700 mb-1">
                        Flat, House no., Building, Street *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        className="w-full border border-neutral-300 px-3 py-2.5 text-xs uppercase focus:outline-none focus:border-black"
                      />
                    </div>

                    {/* 1st State dropdown, 2nd City dropdown as per state, 3rd PIN Code manually */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-700 mb-1">
                          State *
                        </label>
                        <select
                          value={addressForm.state}
                          onChange={(e) => {
                            const nextState = e.target.value;
                            const nextCities = STATE_CITIES_MAP[nextState] || ["Other"];
                            setAddressForm({
                              ...addressForm,
                              state: nextState,
                              city: nextCities[0] || "",
                            });
                          }}
                          className="w-full border border-neutral-300 px-2 py-2.5 text-xs font-bold uppercase bg-white focus:outline-none focus:border-black cursor-pointer"
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-700 mb-1">
                          City *
                        </label>
                        <select
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full border border-neutral-300 px-2 py-2.5 text-xs font-bold uppercase bg-white focus:outline-none focus:border-black cursor-pointer"
                        >
                          {(STATE_CITIES_MAP[addressForm.state] || ["Other"]).map((ct) => (
                            <option key={ct} value={ct}>
                              {ct}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-700 mb-1">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "") })}
                          className="w-full border border-neutral-300 px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    {/* Address Type */}
                    <div className="pt-2">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                        Address Type
                      </label>
                      <div className="flex gap-4">
                        {(["Home", "Work", "Other"] as const).map((t) => (
                          <label key={t} className="flex items-center gap-1.5 text-xs font-bold uppercase cursor-pointer">
                            <input
                              type="radio"
                              name="addressType"
                              checked={addressForm.type === t}
                              onChange={() => setAddressForm({ ...addressForm, type: t })}
                              className="accent-black"
                            />
                            <span>{t}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Default Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="w-4 h-4 accent-black"
                        />
                        <span>Make this my default shipping address</span>
                      </label>
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => setIsAddressModalOpen(false)}
                        className="w-1/3 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 py-3 text-xs font-black uppercase tracking-wider transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 bg-black hover:bg-orange-600 text-white py-3 text-xs font-black uppercase tracking-wider transition-colors"
                      >
                        {editingAddressId ? "Update Address" : "Save Address"}
                      </button>
                    </div>
                  </form>
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
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-neutral-300 px-4 py-3.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black"
                  />
                </div>
              )}

              {/* Field 1: Email OR Mobile Number */}
              <div>
                <label className="block text-[10px] font-black tracking-[0.2em] text-neutral-800 uppercase mb-1.5">
                  Email or Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full border border-neutral-300 px-4 py-3.5 text-xs font-bold tracking-wider focus:outline-none focus:border-black"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-neutral-300 px-4 py-3.5 text-xs font-bold tracking-wider focus:outline-none focus:border-black pr-16"
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
                    {authMode === "signin" ? "Sign In to DRIIVN →" : "Create DRIIVN Account →"}
                  </span>
                )}
              </button>
            </form>

            {/* Fast Mode Toggle Link */}
            <div className="text-center pt-2">
              {authMode === "signin" ? (
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  New to DRIIVN?{" "}
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
