"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Product } from "@/lib/data";
import { Order } from "@/lib/store";

const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

const CATEGORIES = [
  { id: "Tops", name: "Tops & Hoodies", subCategories: ["T-Shirts", "Hoodies", "Sweatshirts", "Polos"] },
  { id: "Bottoms", name: "Bottoms & Pants", subCategories: ["Cargo Pants", "Joggers", "Trackpants", "Shorts", "Denim"] },
  { id: "Accessories", name: "Accessories", subCategories: ["Caps", "Bags", "Socks", "Wallets"] },
  { id: "Special", name: "Special / Limited", subCategories: ["Mystery Box", "Archive Edition", "Speedway Drop"] },
];

const COLLECTIONS = [
  { slug: "essentials", name: "Core Essentials" },
  { slug: "nocturnal", name: "Nocturnal Archive" },
  { slug: "tactical", name: "Tactical Techwear" },
  { slug: "speedway", name: "Speedway Racing" },
];

interface RegisteredUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  createdAt: string;
}

function AdminContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") as "orders" | "products" | "users" | null;
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "users">(initialTab || "orders");

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<RegisteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter States
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");

  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("All");

  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [savingTrackingId, setSavingTrackingId] = useState<string | null>(null);

  // Edit / Add Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Product Form State
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: "",
    price: 3999,
    originalPrice: 4999,
    category: "Tops" as any,
    subCategory: "T-Shirts" as any,
    collectionSlug: "essentials",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    images: ["/images/products/oversized-tshirt.jpg"],
    description: "",
  });

  // Sync tab with URL parameter if it changes
  useEffect(() => {
    const tabParam = searchParams.get("tab") as "orders" | "products" | "users" | null;
    if (tabParam && (tabParam === "orders" || tabParam === "products" || tabParam === "users")) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Load all operational data
  const refreshData = async () => {
    try {
      const [resProd, resOrders, resUsers] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/users", { cache: "no-store" }),
      ]);

      if (resProd.ok) setProductsList(await resProd.json());
      if (resOrders.ok) setOrdersList(await resOrders.json());
      if (resUsers.ok) setUsersList(await resUsers.json());
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setIsLoading(false);
    }
  };

  // Live real-time synchronization & background polling
  useEffect(() => {
    refreshData();

    // 1. Cross-tab sync via storage event
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === "app_orders_last_updated") {
        fetch("/api/orders", { cache: "no-store" })
          .then((r) => r.json())
          .then((orders) => Array.isArray(orders) && setOrdersList(orders))
          .catch(() => {});
      }
    };
    window.addEventListener("storage", handleStorageUpdate);

    // 2. Cross-tab sync via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("driven_orders_sync");
      channel.onmessage = () => {
        fetch("/api/orders", { cache: "no-store" })
          .then((r) => r.json())
          .then((orders) => Array.isArray(orders) && setOrdersList(orders))
          .catch(() => {});
      };
    } catch {}

    // 3. Live polling every 4 seconds so incoming customer orders and updates show without reload
    const pollTimer = setInterval(() => {
      fetch("/api/orders", { cache: "no-store" })
        .then((r) => r.json())
        .then((orders) => {
          if (Array.isArray(orders)) setOrdersList(orders);
        })
        .catch(() => {});
    }, 4000);

    const handleFocus = () => {
      fetch("/api/orders", { cache: "no-store" })
        .then((r) => r.json())
        .then((orders) => Array.isArray(orders) && setOrdersList(orders))
        .catch(() => {});
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("focus", handleFocus);
      clearInterval(pollTimer);
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
    };
  }, []);

  // Update order status with instant optimistic update & multi-tab broadcast
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    // 1. Immediate optimistic UI feedback
    setOrdersList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
    );

    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        // Multi-tab broadcast
        try {
          localStorage.setItem("app_orders_last_updated", String(Date.now()));
          const channel = new BroadcastChannel("driven_orders_sync");
          channel.postMessage({ type: "order_status_updated", orderId, status: newStatus });
          channel.close();
        } catch {}
        window.dispatchEvent(new Event("orders-updated"));
      } else {
        refreshData();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      refreshData();
    }
  };

  // 1-Click Toggle Product Stock
  const handleToggleStock = async (id: string, currentInStock: boolean) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, inStock: !currentInStock }),
      });
      if (res.ok) {
        setProductsList((prev) =>
          prev.map((p) => (p.id === id ? { ...p, inStock: !currentInStock } : p))
        );
      }
    } catch (err) {
      console.error("Failed to toggle stock:", err);
    }
  };

  // Update order tracking / courier info
  const handleSaveTracking = async (orderId: string, currentTracking: string) => {
    const newTracking = trackingInputs[orderId] !== undefined ? trackingInputs[orderId] : currentTracking;
    setSavingTrackingId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, tracking: newTracking }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrdersList((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, address: data.order.address } : o))
        );
        try {
          localStorage.setItem("app_orders_last_updated", String(Date.now()));
          const channel = new BroadcastChannel("driven_orders_sync");
          channel.postMessage({ type: "order_tracking_updated", orderId });
          channel.close();
        } catch {}
        window.dispatchEvent(new Event("orders-updated"));
      }
    } catch (err) {
      console.error("Failed to update tracking:", err);
    } finally {
      setSavingTrackingId(null);
    }
  };

  // Image Upload handler (supports direct PC upload)
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "edit" | "new"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setUploadError("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      if (target === "edit" && editingProduct) {
        setEditingProduct({
          ...editingProduct,
          images: [data.url, ...(editingProduct.images.slice(1) || [])],
        });
      } else if (target === "new") {
        setNewProductForm({
          ...newProductForm,
          images: [data.url],
        });
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save product changes
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setEditingProduct(null);
        }, 1000);
        refreshData();
      }
    } catch (err) {
      alert("Error saving product: " + String(err));
    }
  };

  // Create new product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProductForm),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        refreshData();
      }
    } catch (err) {
      alert("Error creating product: " + String(err));
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      alert("Error deleting product: " + String(err));
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return ordersList.filter((o) => {
      const matchesStatus = orderStatusFilter === "All" || o.status.toLowerCase() === orderStatusFilter.toLowerCase();
      const q = orderSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.phone && o.phone.toLowerCase().includes(q)) ||
        (o.email && o.email.toLowerCase().includes(q)) ||
        o.address.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [ordersList, orderStatusFilter, orderSearchQuery]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchesCategory = productCategoryFilter === "All" || p.category.toLowerCase() === productCategoryFilter.toLowerCase();
      const q = productSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
        p.collectionSlug.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [productsList, productCategoryFilter, productSearchQuery]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const q = userSearchQuery.toLowerCase().trim();
      return (
        !q ||
        u.name.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    });
  }, [usersList, userSearchQuery]);

  // Overview metrics
  const totalRevenue = useMemo(() => ordersList.reduce((acc, o) => acc + o.total, 0), [ordersList]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-[10px] font-black tracking-[0.3em] text-orange-500 uppercase">
            Control Center • Real-time Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-white mt-1">
            DRIVEN Administration
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshData()}
            className="border border-neutral-700 hover:border-white text-neutral-300 hover:text-white px-4 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors"
          >
            ↻ Refresh
          </button>
          <button
            onClick={() => {
              setActiveTab("products");
              setIsAddModalOpen(true);
            }}
            className="bg-white text-black hover:bg-orange-500 hover:text-white px-5 py-2.5 text-xs font-black tracking-widest uppercase transition-all flex items-center gap-1.5"
          >
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Top High-level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-neutral-800 p-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Total Revenue</p>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">RS. {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-[#141414] border border-neutral-800 p-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Total Orders</p>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{ordersList.length}</p>
        </div>
        <div className="bg-[#141414] border border-neutral-800 p-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Live Catalog</p>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{productsList.length} Items</p>
        </div>
        <div className="bg-[#141414] border border-neutral-800 p-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Registered Users</p>
          <p className="text-xl sm:text-2xl font-black text-orange-400 mt-1">{usersList.length} Members</p>
        </div>
      </div>

      {/* THREE DEDICATED TABS */}
      <div className="flex border-b border-neutral-800 gap-x-2">
        <button
          onClick={() => setActiveTab("orders")}
          className={`py-3 px-6 text-xs font-black tracking-widest uppercase border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "orders"
              ? "border-orange-500 text-white bg-neutral-900/50"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <span>1. Orders & Dispatch</span>
          <span className="bg-neutral-800 px-2 py-0.5 text-[10px] rounded-full text-orange-400">
            {ordersList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`py-3 px-6 text-xs font-black tracking-widest uppercase border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "products"
              ? "border-orange-500 text-white bg-neutral-900/50"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <span>2. Products & Photos</span>
          <span className="bg-neutral-800 px-2 py-0.5 text-[10px] rounded-full text-neutral-300">
            {productsList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`py-3 px-6 text-xs font-black tracking-widest uppercase border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "users"
              ? "border-orange-500 text-white bg-neutral-900/50"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <span>3. Registered Users</span>
          <span className="bg-neutral-800 px-2 py-0.5 text-[10px] rounded-full text-neutral-300">
            {usersList.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ORDERS & DISPATCH (ALL INFO: CUSTOMER, PHONE, ADDRESS, COD/UPI) */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <section className="space-y-6">
          {/* Controls Bar: Search & Status Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#141414] p-4 border border-neutral-800">
            <div className="w-full md:w-96">
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, Phone, City..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-neutral-700 px-3.5 py-2 text-xs font-bold tracking-wider text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                    orderStatusFilter === st
                      ? "bg-white text-black font-black"
                      : "bg-[#1c1c1c] text-neutral-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-neutral-500 text-xs font-bold uppercase tracking-widest">
              Loading live customer orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-800 bg-[#121212] p-6 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                No orders match your filter criteria.
              </p>
              {orderSearchQuery && (
                <button
                  onClick={() => {
                    setOrderSearchQuery("");
                    setOrderStatusFilter("All");
                  }}
                  className="text-orange-400 text-xs uppercase font-bold underline"
                >
                  Clear search filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isCOD = order.address.includes("COD");
                const isUPI = order.address.includes("UPI");
                const trackingMatch = order.address.match(/\[Tracking:\s*(.*?)\]/i);
                const trackingInfo = trackingMatch ? trackingMatch[1] : "";
                const cleanDisplayAddress = order.address
                  .replace(/\[Payment:.*?\]/i, "")
                  .replace(/\[Tracking:.*?\]/i, "")
                  .trim();
                const phoneClean = order.phone ? order.phone.replace(/\D/g, "") : "";

                return (
                  <div
                    key={order.id}
                    className="bg-[#121212] border border-neutral-800 p-6 space-y-5 hover:border-neutral-700 transition-colors"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-neutral-800 pb-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-base font-black font-mono tracking-wider text-orange-400">
                          #{order.id}
                        </span>
                        <span className="text-xs text-neutral-400 font-bold uppercase">
                          Date: {order.date}
                        </span>
                        {/* Payment Method Badge */}
                        <span
                          className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 ${
                            isCOD
                              ? "bg-neutral-800 text-neutral-200 border border-neutral-700"
                              : isUPI
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-neutral-800 text-neutral-300"
                          }`}
                        >
                          {isCOD ? "💵 Cash on Delivery (COD)" : isUPI ? "📱 UPI QR Paid" : "Prepaid"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                        <span className="text-sm font-black text-white">
                          Total: RS. {order.total.toLocaleString()}
                        </span>
                        {/* Status Updater */}
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-bold text-neutral-400">Status:</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-black border border-neutral-600 text-xs font-bold uppercase text-white px-3 py-1.5 outline-none cursor-pointer focus:border-orange-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Customer & Address Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#161616] p-4 border border-neutral-800/80 text-xs">
                      {/* Customer Info */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-1">
                          Customer Information
                        </span>
                        <p className="font-bold text-white text-sm uppercase">{order.customerName}</p>
                        <p className="text-neutral-300 font-mono">
                          {order.phone ? `+91 ${order.phone}` : "No phone provided"}
                        </p>
                        <p className="text-neutral-400 text-[11px] truncate">{order.email || "No email"}</p>
                        
                        {phoneClean && (
                          <div className="pt-2 flex items-center gap-3">
                            <a
                              href={`https://wa.me/91${phoneClean}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold uppercase text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <span>💬 WhatsApp</span>
                            </a>
                            <a
                              href={`tel:+91${phoneClean}`}
                              className="text-[10px] font-bold uppercase text-neutral-400 hover:text-white flex items-center gap-1"
                            >
                              <span>📞 Call</span>
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Delivery Address */}
                      <div className="space-y-1 md:col-span-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-1">
                          Full Shipping & Delivery Address
                        </span>
                        <p className="text-neutral-200 uppercase font-medium leading-relaxed">
                          {cleanDisplayAddress}
                        </p>
                        {order.address.includes("UTR:") && (
                          <p className="text-orange-400 font-mono text-[11px] pt-1">
                            Payment Ref: {order.address.match(/UTR:.*?(?=\]|$)/)?.[0]}
                          </p>
                        )}

                        {/* Courier & AWB Tracking Form */}
                        <div className="mt-3 pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-wider text-orange-400 whitespace-nowrap flex items-center gap-1">
                            <span>📦</span> Courier / AWB:
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. Delhivery - 1492049182"
                            value={trackingInputs[order.id] !== undefined ? trackingInputs[order.id] : trackingInfo}
                            onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                            className="bg-black border border-neutral-700 px-3 py-1 text-xs font-mono text-white placeholder:text-neutral-500 w-full sm:w-60 focus:outline-none focus:border-orange-500 uppercase"
                          />
                          <button
                            type="button"
                            disabled={savingTrackingId === order.id}
                            onClick={() => handleSaveTracking(order.id, trackingInfo)}
                            className="bg-neutral-800 hover:bg-orange-600 disabled:bg-neutral-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap"
                          >
                            {savingTrackingId === order.id ? "SAVING..." : "SAVE AWB"}
                          </button>
                          {trackingInfo && (
                            <a
                              href={`https://www.google.com/search?q=track+${encodeURIComponent(trackingInfo)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-neutral-400 hover:text-white text-[10px] font-bold uppercase underline sm:ml-auto"
                            >
                              Track &rarr;
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items Table */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">
                        Ordered Items ({order.items.length})
                      </span>
                      <div className="divide-y divide-neutral-800 border border-neutral-800 bg-[#141414]">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-12 bg-neutral-900 border border-neutral-800 flex-shrink-0">
                                <Image
                                  src={item.image || "/images/products/oversized-tshirt.jpg"}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-white uppercase">{item.name}</p>
                                <p className="text-[10px] text-neutral-400 uppercase">
                                  Size: <span className="text-white font-bold">{item.size}</span> • Quantity:{" "}
                                  <span className="text-white font-bold">{item.quantity}</span>{" "}
                                  {item.color ? `• Color: ${item.color}` : ""}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-white">
                              RS. {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRODUCTS & PHOTOS (CATEGORY SELECTOR, PHOTO UPLOAD, STOCK/SIZES) */}
      {/* ========================================================================= */}
      {activeTab === "products" && (
        <section className="space-y-6">
          {/* Controls Bar: Category Filters & Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#141414] p-4 border border-neutral-800">
            <div className="w-full md:w-80">
              <input
                type="text"
                placeholder="Search products by title, sub-category..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-neutral-700 px-3.5 py-2 text-xs font-bold tracking-wider text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setProductCategoryFilter("All")}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                  productCategoryFilter === "All"
                    ? "bg-white text-black font-black"
                    : "bg-[#1c1c1c] text-neutral-400 hover:text-white"
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setProductCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                    productCategoryFilter === cat.id
                      ? "bg-white text-black font-black"
                      : "bg-[#1c1c1c] text-neutral-400 hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-[#121212] border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Photo</th>
                  <th className="py-3 px-4">Product Name & Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Sizes Available</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredProducts.map((product) => {
                  const isInStock = product.inStock !== false;
                  const prodSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ALL_SIZES;

                  return (
                    <tr key={product.id} className="hover:bg-neutral-800/40 transition-colors">
                      {/* Photo Thumbnail */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setEditingProduct({ ...product })}
                          className="relative w-12 h-16 bg-neutral-900 border border-neutral-700 overflow-hidden cursor-pointer group"
                          title="Click to change photo"
                        >
                          <Image
                            src={product.images[0] || "/images/products/oversized-tshirt.jpg"}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-bold text-white uppercase">
                            Change
                          </div>
                        </div>
                      </td>

                      {/* Product Name & Category */}
                      <td className="py-3 px-4">
                        <p className="font-black text-white uppercase text-xs">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400 uppercase">
                          <span className="text-orange-400 font-bold">{product.category}</span>
                          <span>•</span>
                          <span>{product.subCategory || "Streetwear"}</span>
                          <span>•</span>
                          <span className="text-neutral-500">{product.collectionSlug}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-white">
                        RS. {product.price.toLocaleString()}
                        {product.originalPrice && (
                          <span className="text-neutral-500 line-through ml-1 text-[10px]">
                            RS. {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Stock Status 1-Click Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStock(product.id, isInStock)}
                          className={`text-[9px] font-black uppercase px-2.5 py-1 border transition-colors ${
                            isInStock
                              ? "bg-emerald-950/60 border-emerald-600 text-emerald-400 hover:bg-red-950/40 hover:border-red-600 hover:text-red-400"
                              : "bg-red-950/60 border-red-600 text-red-400 hover:bg-emerald-950/40 hover:border-emerald-600 hover:text-emerald-400"
                          }`}
                        >
                          {isInStock ? "In Stock (Active)" : "Sold Out"}
                        </button>
                      </td>

                      {/* Sizes */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {ALL_SIZES.map((sz) => (
                            <span
                              key={sz}
                              className={`text-[8px] font-bold px-1.5 py-0.5 uppercase ${
                                prodSizes.includes(sz)
                                  ? "bg-neutral-800 text-white"
                                  : "bg-neutral-900 text-neutral-600 line-through"
                              }`}
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...product })}
                          className="bg-white text-black hover:bg-orange-500 hover:text-white px-3 py-1.5 text-[10px] font-black tracking-wider uppercase transition-colors"
                        >
                          Edit & Photos
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="bg-neutral-800 text-red-400 hover:bg-red-900/60 px-2.5 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REGISTERED USERS (WHO CREATED ACCOUNTS) */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141414] p-4 border border-neutral-800">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                Registered Customer Accounts
              </h3>
              <p className="text-xs text-neutral-400 uppercase mt-0.5">
                Full list of users who signed up or registered on the store.
              </p>
            </div>

            <div className="w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by Name, Email, or Mobile Number..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-neutral-700 px-3.5 py-2 text-xs font-bold tracking-wider text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-800 bg-[#121212] p-6 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                No registered accounts match your search.
              </p>
            </div>
          ) : (
            <div className="bg-[#121212] border border-neutral-800 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Member Name</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4">Mobile Number</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Orders Placed</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredUsers.map((user) => {
                    const userPhoneClean = user.phone ? user.phone.replace(/\D/g, "") : "";
                    const userEmailClean = user.email ? user.email.toLowerCase().trim() : "";

                    const userOrderCount = ordersList.filter((o) => {
                      if (userEmailClean && o.email && o.email.toLowerCase().trim() === userEmailClean) return true;
                      const oPhone = o.phone ? o.phone.replace(/\D/g, "") : "";
                      if (userPhoneClean && oPhone && (oPhone.endsWith(userPhoneClean) || userPhoneClean.endsWith(oPhone))) return true;
                      if (o.customerName && user.name && o.customerName.toLowerCase().trim() === user.name.toLowerCase().trim()) return true;
                      return false;
                    }).length;

                    return (
                      <tr key={user.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-black text-white text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-white uppercase">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-300">
                          {user.email || <span className="text-neutral-500 italic">None</span>}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-300">
                          {user.phone ? `+91 ${user.phone}` : <span className="text-neutral-500 italic">None</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-xs ${
                              user.role === "admin"
                                ? "bg-orange-500 text-black font-black"
                                : "bg-neutral-800 text-neutral-300"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-white">{userOrderCount} Orders</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("orders");
                              setOrderSearchQuery(user.name);
                            }}
                            className="text-[10px] text-orange-400 hover:text-orange-300 font-bold uppercase tracking-wider underline"
                          >
                            View Customer Orders &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PRODUCT & CHANGE PHOTO */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#161616] border border-neutral-700 w-full max-w-2xl p-6 sm:p-8 space-y-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[9px] font-black tracking-widest text-orange-500 uppercase">
                  Product & Photo Editor
                </span>
                <h3 className="text-lg font-black tracking-widest uppercase mt-0.5">
                  Edit Details & Photography
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-neutral-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Image Uploader Area */}
              <div className="border border-dashed border-neutral-700 p-4 bg-[#111] flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-28 h-36 bg-neutral-900 border border-neutral-700 flex-shrink-0 overflow-hidden">
                  <Image
                    src={editingProduct.images[0] || "/images/products/oversized-tshirt.jpg"}
                    alt={editingProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                    Replace Product Photo (Upload from your Computer)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "edit")}
                    disabled={uploadingImage}
                    className="text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-black file:uppercase file:bg-white file:text-black hover:file:bg-orange-500 hover:file:text-white file:cursor-pointer"
                  />
                  {uploadingImage && <p className="text-xs text-orange-400 font-bold">Uploading image...</p>}
                  {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
                  
                  <div className="pt-1">
                    <span className="text-[9px] text-neutral-500 uppercase block mb-1">Or paste Image URL:</span>
                    <input
                      type="text"
                      value={editingProduct.images[0] || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          images: [e.target.value, ...(editingProduct.images.slice(1) || [])],
                        })
                      }
                      placeholder="https://..."
                      className="w-full bg-[#1e1e1e] border border-neutral-700 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Product Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-neutral-700 px-3 py-2 text-xs font-bold uppercase text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-neutral-700 px-3 py-2 text-xs font-bold uppercase text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Price (RS.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-[#1e1e1e] border border-neutral-700 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Collection *
                  </label>
                  <select
                    value={editingProduct.collectionSlug}
                    onChange={(e) => setEditingProduct({ ...editingProduct, collectionSlug: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-neutral-700 px-3 py-2 text-xs font-bold uppercase text-white"
                  >
                    {COLLECTIONS.map((col) => (
                      <option key={col.slug} value={col.slug}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sizes Available */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Available Sizes
                </label>
                <div className="flex gap-2">
                  {ALL_SIZES.map((sz) => {
                    const activeSizes = editingProduct.sizes || ALL_SIZES;
                    const isSelected = activeSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const nextSizes = isSelected
                            ? activeSizes.filter((s) => s !== sz)
                            : [...activeSizes, sz];
                          setEditingProduct({ ...editingProduct, sizes: nextSizes });
                        }}
                        className={`w-10 h-10 border text-xs font-bold uppercase transition-all ${
                          isSelected
                            ? "border-orange-500 bg-orange-500 text-black font-black"
                            : "border-neutral-700 bg-neutral-900 text-neutral-500"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* In-Stock Toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-xs font-bold uppercase text-white">Item In Stock (Available for Purchase)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-1/3 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 py-3 text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-orange-500 hover:bg-orange-600 text-black py-3 text-xs font-black uppercase"
                >
                  {saveSuccess ? "Saved Successfully ✓" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW PRODUCT */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#161616] border border-neutral-700 w-full max-w-2xl p-6 sm:p-8 space-y-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[9px] font-black tracking-widest text-orange-500 uppercase">
                  Catalog Operations
                </span>
                <h3 className="text-lg font-black tracking-widest uppercase mt-0.5">
                  Add New Drop Product
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-6">
              {/* Image Upload Area */}
              <div className="border border-dashed border-neutral-700 p-4 bg-[#111] flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-28 h-36 bg-neutral-900 border border-neutral-700 flex-shrink-0 overflow-hidden">
                  <Image
                    src={newProductForm.images?.[0] || "/images/products/oversized-tshirt.jpg"}
                    alt="Product Preview"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                    Upload Product Photo from Computer
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "new")}
                    disabled={uploadingImage}
                    className="text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-black file:uppercase file:bg-white file:text-black hover:file:bg-orange-500 hover:file:text-white file:cursor-pointer"
                  />
                  {uploadingImage && <p className="text-xs text-orange-400 font-bold">Uploading photo...</p>}
                  {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
                </div>
              </div>

              {/* Product Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TACTICAL V2 CARGO PANTS"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-neutral-700 px-3 py-2 text-xs font-bold uppercase text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => {
                      const selCat = e.target.value as any;
                      const matched = CATEGORIES.find((c) => c.id === selCat);
                      setNewProductForm({
                        ...newProductForm,
                        category: selCat,
                        subCategory: (matched?.subCategories[0] || "T-Shirts") as any,
                      });
                    }}
                    className="w-full bg-[#1e1e1e] border border-neutral-700 px-3 py-2 text-xs font-bold uppercase text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Sub-Category *
                  </label>
                  <select
                    value={newProductForm.subCategory}
                    onChange={(e) => setNewProductForm({ ...newProductForm, subCategory: e.target.value as any })}
                    className="w-full bg-[#1e1e1e] border border-neutral-700 px-3 py-2 text-xs font-bold uppercase text-white"
                  >
                    {CATEGORIES.find((c) => c.id === newProductForm.category)?.subCategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Collection *
                  </label>
                  <select
                    value={newProductForm.collectionSlug}
                    onChange={(e) => setNewProductForm({ ...newProductForm, collectionSlug: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-neutral-700 px-3 py-2 text-xs font-bold uppercase text-white"
                  >
                    {COLLECTIONS.map((col) => (
                      <option key={col.slug} value={col.slug}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Price (RS.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                    className="w-full bg-[#1e1e1e] border border-neutral-700 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Original Strike-through Price (RS.)
                  </label>
                  <input
                    type="number"
                    value={newProductForm.originalPrice || ""}
                    onChange={(e) => setNewProductForm({ ...newProductForm, originalPrice: Number(e.target.value) })}
                    className="w-full bg-[#1e1e1e] border border-neutral-700 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Heavyweight custom-milled French Terry..."
                  value={newProductForm.description || ""}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-neutral-700 px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/3 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 py-3 text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-orange-500 hover:bg-orange-600 text-black py-3 text-xs font-black uppercase"
                >
                  Publish New Product &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400 text-xs font-bold uppercase">Loading Admin Console...</div>}>
      <AdminContent />
    </Suspense>
  );
}
