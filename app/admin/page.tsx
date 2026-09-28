"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Product } from "@/lib/data";
import { Order } from "@/lib/store";
import InventoryManager from "@/components/admin/InventoryManager";
import SectionsManager from "@/components/admin/SectionsManager";
import CategoryManager from "@/components/admin/CategoryManager";

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
  const initialTab = searchParams.get("tab") as "orders" | "products" | "inventory" | "sections" | "categories" | "users" | null;
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "inventory" | "sections" | "categories" | "users">(initialTab || "orders");

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<RegisteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter States
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");
  const [orderPage, setOrderPage] = useState<number>(1);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(5);
  const [collapsedOrders, setCollapsedOrders] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
  const [editingImageUrlInput, setEditingImageUrlInput] = useState("");
  const [newImageUrlInput, setNewImageUrlInput] = useState("");

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
    stockQuantity: 10,
    visibleOnSite: true,
    images: ["/images/products/oversized-tshirt.jpg"],
    description: "",
  });

  // Sync tab with URL parameter if it changes
  useEffect(() => {
    const tabParam = searchParams.get("tab") as "orders" | "products" | "inventory" | "sections" | "categories" | "users" | null;
    if (tabParam && ["orders", "products", "inventory", "sections", "categories", "users"].includes(tabParam)) {
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
      channel = new BroadcastChannel("driivn_orders_sync");
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
          const channel = new BroadcastChannel("driivn_orders_sync");
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
          const channel = new BroadcastChannel("driivn_orders_sync");
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
          images: [...(editingProduct.images || []), data.url],
        });
      } else if (target === "new") {
        setNewProductForm((prev) => ({
          ...prev,
          images: [...(prev.images || []), data.url],
        }));
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

  // Status Counts for Orders
  const orderStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: ordersList.length,
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    ordersList.forEach((o) => {
      const st = o.status;
      if (counts[st] !== undefined) {
        counts[st]++;
      } else {
        const found = Object.keys(counts).find((k) => k.toLowerCase() === (st || "").toLowerCase());
        if (found) counts[found]++;
      }
    });
    return counts;
  }, [ordersList]);

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

  // Reset pagination when search, filter or page size changes
  useEffect(() => {
    setOrderPage(1);
  }, [orderStatusFilter, orderSearchQuery, ordersPerPage]);

  // Orders Pagination calculations
  const effectivePerPage = ordersPerPage === -1 ? (filteredOrders.length || 1) : ordersPerPage;
  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / effectivePerPage));
  const currentOrderPage = Math.min(orderPage, totalOrderPages);
  const startIndex = (currentOrderPage - 1) * effectivePerPage;
  const endIndex = Math.min(startIndex + effectivePerPage, filteredOrders.length);
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(startIndex, startIndex + effectivePerPage);
  }, [filteredOrders, startIndex, effectivePerPage]);

  const toggleOrderCollapse = (orderId: string) => {
    setCollapsedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const collapseAllOrders = () => {
    const next: Record<string, boolean> = {};
    paginatedOrders.forEach((o) => {
      next[o.id] = true;
    });
    setCollapsedOrders(next);
  };

  const expandAllOrders = () => {
    setCollapsedOrders({});
  };

  const handleCopy = (text: string, id: string) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-300 pb-6 font-inter">
        <div>
          <span className="text-[10px] font-black tracking-[0.3em] text-[#E8262A] uppercase font-inter">
            Control Center • Real-time Operations
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-black mt-1 font-anton">
            DRIIVN Administration
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshData()}
            className="border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 px-4 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors rounded-xl shadow-xs"
          >
            ↻ Refresh
          </button>
          <button
            onClick={() => {
              setActiveTab("products");
              setIsAddModalOpen(true);
            }}
            className="bg-[#E8262A] text-white hover:bg-[#d01e22] px-5 py-2.5 text-xs font-black tracking-widest uppercase transition-all flex items-center gap-1.5 rounded-xl shadow-xs active:scale-95"
          >
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Top High-level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-inter">
        <div className="bg-white border border-neutral-300 p-5 rounded-2xl shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Total Revenue</p>
          <p className="text-xl sm:text-2xl font-black text-black mt-1 font-anton">RS. {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-neutral-300 p-5 rounded-2xl shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Total Orders</p>
          <p className="text-xl sm:text-2xl font-black text-black mt-1 font-anton">{ordersList.length}</p>
        </div>
        <div className="bg-white border border-neutral-300 p-5 rounded-2xl shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Live Catalog</p>
          <p className="text-xl sm:text-2xl font-black text-black mt-1 font-anton">{productsList.length} Items</p>
        </div>
        <div className="bg-white border border-neutral-300 p-5 rounded-2xl shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Registered Users</p>
          <p className="text-xl sm:text-2xl font-black text-[#E8262A] mt-1 font-anton">{usersList.length} Members</p>
        </div>
      </div>

      {/* FIVE DEDICATED TABS */}
      <div className="flex border-b border-neutral-300 gap-x-2 overflow-x-auto no-scrollbar font-inter">
        <button
          onClick={() => setActiveTab("orders")}
          className={`py-3 px-5 text-xs font-black tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "orders"
              ? "border-[#E8262A] text-[#E8262A] bg-white rounded-t-xl shadow-xs"
              : "border-transparent text-neutral-600 hover:text-black hover:bg-white/50"
          }`}
        >
          <span>1. Orders & Dispatch</span>
          <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
            activeTab === "orders" ? "bg-[#E8262A]/10 text-[#E8262A]" : "bg-neutral-200 text-neutral-700"
          }`}>
            {ordersList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`py-3 px-5 text-xs font-black tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "products"
              ? "border-[#E8262A] text-[#E8262A] bg-white rounded-t-xl shadow-xs"
              : "border-transparent text-neutral-600 hover:text-black hover:bg-white/50"
          }`}
        >
          <span>2. Products & Photos</span>
          <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
            activeTab === "products" ? "bg-[#E8262A]/10 text-[#E8262A]" : "bg-neutral-200 text-neutral-700"
          }`}>
            {productsList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`py-3 px-5 text-xs font-black tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "inventory"
              ? "border-[#E8262A] text-[#E8262A] bg-white rounded-t-xl shadow-xs"
              : "border-transparent text-neutral-600 hover:text-black hover:bg-white/50"
          }`}
        >
          <span>3. Inventory & Stock</span>
          <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
            activeTab === "inventory" ? "bg-[#E8262A]/10 text-[#E8262A]" : "bg-neutral-200 text-neutral-700"
          }`}>
            {productsList.filter(p => p.inStock === false).length > 0 ? `${productsList.filter(p => p.inStock === false).length} Out` : "All In"}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("sections")}
          className={`py-3 px-5 text-xs font-black tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "sections"
              ? "border-[#E8262A] text-[#E8262A] bg-white rounded-t-xl shadow-xs"
              : "border-transparent text-neutral-600 hover:text-black hover:bg-white/50"
          }`}
        >
          <span>4. Storefront Sections</span>
          <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
            activeTab === "sections" ? "bg-[#E8262A]/10 text-[#E8262A]" : "bg-neutral-200 text-neutral-700"
          }`}>
            Active
          </span>
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`py-3 px-5 text-xs font-black tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "categories"
              ? "border-[#E8262A] text-[#E8262A] bg-white rounded-t-xl shadow-xs"
              : "border-transparent text-neutral-600 hover:text-black hover:bg-white/50"
          }`}
        >
          <span>5. Categories & Menu</span>
          <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
            activeTab === "categories" ? "bg-[#E8262A]/10 text-[#E8262A]" : "bg-neutral-200 text-neutral-700"
          }`}>
            Drawer
          </span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`py-3 px-5 text-xs font-black tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "users"
              ? "border-[#E8262A] text-[#E8262A] bg-white rounded-t-xl shadow-xs"
              : "border-transparent text-neutral-600 hover:text-black hover:bg-white/50"
          }`}
        >
          <span>6. Registered Users</span>
          <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
            activeTab === "users" ? "bg-[#E8262A]/10 text-[#E8262A]" : "bg-neutral-200 text-neutral-700"
          }`}>
            {usersList.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ORDERS & DISPATCH (ALL INFO: CUSTOMER, PHONE, ADDRESS, COD/UPI) */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <section className="space-y-4">
          {/* Controls Bar: Search & Status Filters with Count Badges */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 border border-neutral-300 rounded-2xl shadow-xs">
            <div className="w-full md:w-96 relative">
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, Phone, City..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full bg-[#F5F4EE] border border-neutral-300 px-3.5 py-2 text-xs font-bold tracking-wider text-black placeholder:text-neutral-400 focus:outline-none focus:border-[#E8262A] pr-8 rounded-xl"
              />
              {orderSearchQuery && (
                <button
                  type="button"
                  onClick={() => setOrderSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs font-bold"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setOrderStatusFilter(st);
                    setOrderPage(1);
                  }}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 rounded-xl ${
                    orderStatusFilter === st
                      ? "bg-[#E8262A] text-white font-black shadow-xs"
                      : "bg-[#F5F4EE] text-neutral-700 hover:text-black hover:bg-neutral-200 border border-neutral-300"
                  }`}
                >
                  <span>{st}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      orderStatusFilter === st
                        ? "bg-white text-black"
                        : "bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    {orderStatusCounts[st] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-controls: Pagination summary, Page size switcher, Collapse/Expand all */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 py-2.5 border border-neutral-300 rounded-xl shadow-xs text-xs">
            <div className="flex items-center gap-2 text-neutral-600 font-bold uppercase text-[11px]">
              <span>
                Showing {filteredOrders.length === 0 ? 0 : startIndex + 1}–{endIndex} of {filteredOrders.length} Orders
              </span>
              {totalOrderPages > 1 && (
                <span className="text-neutral-400">• Page {currentOrderPage} of {totalOrderPages}</span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Page Size Selector */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mr-1">Show:</span>
                {[5, 10, 20, -1].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      setOrdersPerPage(sz);
                      setOrderPage(1);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider transition-colors rounded ${
                      ordersPerPage === sz
                        ? "bg-[#E8262A] text-white font-black"
                        : "bg-neutral-100 border border-neutral-300 text-neutral-600 hover:bg-neutral-200 hover:text-black"
                    }`}
                  >
                    {sz === -1 ? "All" : sz}
                  </button>
                ))}
              </div>

              <div className="h-4 w-[1px] bg-neutral-200 hidden sm:block" />

              {/* Collapse / Expand All */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={collapseAllOrders}
                  className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-neutral-100 border border-neutral-300 hover:bg-neutral-200 text-neutral-700 transition-colors rounded"
                >
                  − Collapse All
                </button>
                <button
                  type="button"
                  onClick={expandAllOrders}
                  className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-neutral-100 border border-neutral-300 hover:bg-neutral-200 text-neutral-700 transition-colors rounded"
                >
                  + Expand All
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-neutral-500 text-xs font-bold uppercase tracking-widest bg-white rounded-2xl border border-neutral-300">
              Loading live customer orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-300 bg-white rounded-2xl p-6 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-600">
                No orders match your filter criteria.
              </p>
              {orderSearchQuery && (
                <button
                  onClick={() => {
                    setOrderSearchQuery("");
                    setOrderStatusFilter("All");
                  }}
                  className="text-[#E8262A] text-xs uppercase font-bold underline"
                >
                  Clear search filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedOrders.map((order) => {
                const isCOD = order.address.includes("COD");
                const isUPI = order.address.includes("UPI");
                const trackingMatch = order.address.match(/\[Tracking:\s*(.*?)\]/i);
                const trackingInfo = trackingMatch ? trackingMatch[1] : "";
                const waMatch = order.address.match(/\[WhatsApp:\s*([+0-9]+)\]/i);
                const cleanDisplayAddress = order.address
                  .replace(/\[Payment:.*?\]/i, "")
                  .replace(/\[Tracking:.*?\]/i, "")
                  .replace(/\[WhatsApp:.*?\]/i, "")
                  .trim();
                const phoneClean = order.phone ? order.phone.replace(/\D/g, "") : "";
                const waNumber = waMatch ? waMatch[1].replace(/\D/g, "") : phoneClean;
                const isCollapsed = collapsedOrders[order.id];

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs hover:border-neutral-400 transition-colors"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-neutral-200 pb-3">
                      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleCopy(order.id, order.id)}
                          className="text-base font-black font-mono tracking-wider text-[#E8262A] hover:text-[#d01e22] flex items-center gap-1"
                          title="Click to copy Order ID"
                        >
                          <span>#{order.id}</span>
                          <span className="text-[10px] text-neutral-500 font-sans">
                            {copiedId === order.id ? "✓ Copied" : "📋"}
                          </span>
                        </button>
                        <span className="text-xs text-neutral-500 font-bold uppercase">
                          {order.date}
                        </span>
                        {/* Payment Method Badge */}
                        <span
                          className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md ${
                            isCOD
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : isUPI
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-neutral-100 text-neutral-800 border border-neutral-300"
                          }`}
                        >
                          {isCOD ? "💵 COD" : isUPI ? "📱 UPI QR Paid" : "Prepaid"}
                        </span>
                        <span className="text-xs text-black font-bold uppercase truncate max-w-[150px] sm:max-w-none">
                          👤 {order.customerName}
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase font-mono">
                          ({order.items.length} item{order.items.length > 1 ? "s" : ""})
                        </span>
                      </div>

                      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
                        <span className="text-sm font-black text-black whitespace-nowrap">
                          RS. {order.total.toLocaleString()}
                        </span>

                        {/* Status Updater */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase font-bold text-neutral-500">Status:</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`text-xs font-bold uppercase px-2.5 py-1 outline-none cursor-pointer border rounded-lg ${
                              order.status === "Pending"
                                ? "bg-amber-50 border-amber-300 text-amber-800"
                                : order.status === "Processing"
                                ? "bg-blue-50 border-blue-300 text-blue-800"
                                : order.status === "Shipped"
                                ? "bg-purple-50 border-purple-300 text-purple-800"
                                : order.status === "Delivered"
                                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                : "bg-red-50 border-red-300 text-red-800"
                            }`}
                          >
                            <option value="Pending" className="bg-white text-black">Pending</option>
                            <option value="Processing" className="bg-white text-black">Processing</option>
                            <option value="Shipped" className="bg-white text-black">Shipped</option>
                            <option value="Delivered" className="bg-white text-black">Delivered</option>
                            <option value="Cancelled" className="bg-white text-black">Cancelled</option>
                          </select>
                        </div>

                        {/* Toggle Card Details Button */}
                        <button
                          type="button"
                          onClick={() => toggleOrderCollapse(order.id)}
                          className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 transition-colors rounded-lg"
                        >
                          {isCollapsed ? "+ Details" : "− Collapse"}
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {!isCollapsed && (
                      <div className="space-y-4 pt-1">
                        {/* Customer & Address Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-[#F9F8F5] p-4 border border-neutral-200 rounded-xl text-xs">
                          {/* Customer Info */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 block mb-1">
                              Customer Information
                            </span>
                            <p className="font-bold text-black text-sm uppercase">{order.customerName}</p>
                            <p className="text-neutral-700 font-mono">
                              {order.phone ? `+91 ${order.phone}` : "No phone provided"}
                            </p>
                            <p className="text-neutral-500 text-[11px] truncate">{order.email || "No email"}</p>
                            
                            {phoneClean && (
                              <div className="pt-2 flex items-center gap-2 flex-wrap">
                                <a
                                  href={`https://wa.me/91${waNumber.slice(-10)}?text=${encodeURIComponent(
                                    `Hello ${order.customerName}, this is DRIIVN Operations regarding your order #${order.id}.`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 px-2.5 py-1 transition-colors flex items-center gap-1 rounded-lg"
                                >
                                  <span>💬 WhatsApp{waMatch ? " (Direct)" : ""}</span>
                                </a>
                                <a
                                  href={`tel:+91${phoneClean}`}
                                  className="text-[10px] font-bold uppercase text-neutral-700 bg-neutral-100 border border-neutral-300 hover:bg-neutral-200 px-2.5 py-1 transition-colors flex items-center gap-1 rounded-lg"
                                >
                                  <span>📞 Call</span>
                                </a>
                              </div>
                            )}
                            {waMatch && (
                              <p className="text-emerald-700 font-mono text-[11px] pt-1">
                                WhatsApp: +91 {waNumber.slice(-10)}
                              </p>
                            )}
                          </div>

                          {/* Delivery Address */}
                          <div className="space-y-1 md:col-span-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 block mb-1">
                              Full Shipping & Delivery Address
                            </span>
                            <p className="text-neutral-800 uppercase font-medium leading-relaxed">
                              {cleanDisplayAddress}
                            </p>
                            {order.address.includes("UTR:") && (
                              <p className="text-[#E8262A] font-mono text-[11px] pt-1">
                                Payment Ref: {order.address.match(/UTR:.*?(?=\]|$)/)?.[0]}
                              </p>
                            )}

                            {/* Courier & AWB Tracking Form */}
                            <div className="mt-3 pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              <span className="text-[9px] font-black uppercase tracking-wider text-[#E8262A] whitespace-nowrap flex items-center gap-1">
                                <span>📦</span> Courier / AWB:
                              </span>
                              <input
                                type="text"
                                placeholder="e.g. Delhivery - 1492049182"
                                value={trackingInputs[order.id] !== undefined ? trackingInputs[order.id] : trackingInfo}
                                onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                                className="bg-white border border-neutral-300 px-3 py-1 text-xs font-mono text-black placeholder:text-neutral-400 w-full sm:w-60 focus:outline-none focus:border-[#E8262A] uppercase rounded-lg"
                              />
                              <button
                                type="button"
                                disabled={savingTrackingId === order.id}
                                onClick={() => handleSaveTracking(order.id, trackingInfo)}
                                className="bg-black hover:bg-[#E8262A] disabled:bg-neutral-300 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap rounded-lg"
                              >
                                {savingTrackingId === order.id ? "SAVING..." : "SAVE AWB"}
                              </button>
                              {trackingInfo && (
                                <a
                                  href={`https://www.google.com/search?q=track+${encodeURIComponent(trackingInfo)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-neutral-600 hover:text-black text-[10px] font-bold uppercase underline sm:ml-auto"
                                >
                                  Track &rarr;
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Ordered Items Table */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 block">
                            Ordered Items ({order.items.length})
                          </span>
                          <div className="divide-y divide-neutral-200 border border-neutral-200 bg-white rounded-xl overflow-hidden">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="p-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-10 h-12 bg-neutral-100 border border-neutral-300 rounded overflow-hidden flex-shrink-0">
                                    <Image
                                      src={item.image || "/images/products/oversized-tshirt.jpg"}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-black uppercase">{item.name}</p>
                                    <p className="text-[10px] text-neutral-600 uppercase">
                                      Size: <span className="text-black font-bold">{item.size}</span> • Quantity:{" "}
                                      <span className="text-black font-bold">{item.quantity}</span>{" "}
                                      {item.color ? `• Color: ${item.color}` : ""}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-bold text-black">
                                  RS. {(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Pagination Bar */}
          {filteredOrders.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-neutral-300 rounded-xl shadow-xs mt-6">
              <div className="text-xs text-neutral-600 font-bold uppercase">
                Showing {startIndex + 1}–{endIndex} of {filteredOrders.length} orders
                {ordersPerPage !== -1 && (
                  <span className="text-neutral-400 ml-2">
                    (Page {currentOrderPage} of {totalOrderPages})
                  </span>
                )}
              </div>

              {totalOrderPages > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    disabled={currentOrderPage <= 1}
                    onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs font-black uppercase tracking-wider bg-neutral-100 border border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-200 text-neutral-800 transition-colors rounded-lg"
                  >
                    &larr; Prev
                  </button>

                  {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setOrderPage(p)}
                      className={`w-8 h-8 text-xs font-black uppercase transition-colors rounded-lg ${
                        currentOrderPage === p
                          ? "bg-[#E8262A] text-white font-black"
                          : "bg-neutral-100 border border-neutral-300 text-neutral-700 hover:bg-neutral-200 hover:text-black"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentOrderPage >= totalOrderPages}
                    onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
                    className="px-3 py-1.5 text-xs font-black uppercase tracking-wider bg-neutral-100 border border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-200 text-neutral-800 transition-colors rounded-lg"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 border border-neutral-300 rounded-2xl shadow-xs">
            <div className="w-full md:w-80">
              <input
                type="text"
                placeholder="Search products by title, sub-category..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="w-full bg-[#F5F4EE] border border-neutral-300 px-3.5 py-2 text-xs font-bold tracking-wider text-black placeholder:text-neutral-400 focus:outline-none focus:border-[#E8262A] rounded-xl"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setProductCategoryFilter("All")}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors rounded-xl ${
                  productCategoryFilter === "All"
                    ? "bg-[#E8262A] text-white font-black shadow-xs"
                    : "bg-[#F5F4EE] text-neutral-700 hover:text-black hover:bg-neutral-200 border border-neutral-300"
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setProductCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors rounded-xl ${
                    productCategoryFilter === cat.id
                      ? "bg-[#E8262A] text-white font-black shadow-xs"
                      : "bg-[#F5F4EE] text-neutral-700 hover:text-black hover:bg-neutral-200 border border-neutral-300"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white border border-neutral-300 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#F5F4EE] text-neutral-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Photo</th>
                  <th className="py-3 px-4">Product Name & Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Sizes Available</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredProducts.map((product) => {
                  const isInStock = product.inStock !== false;
                  const prodSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ALL_SIZES;

                  return (
                    <tr key={product.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Photo Thumbnail */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setEditingProduct({ ...product })}
                          className="relative w-12 h-16 bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden cursor-pointer group"
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
                        <p className="font-black text-black uppercase text-xs">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-500 uppercase">
                          <span className="text-[#E8262A] font-bold">{product.category}</span>
                          <span>•</span>
                          <span>{product.subCategory || "Streetwear"}</span>
                          <span>•</span>
                          <span className="text-neutral-400">{product.collectionSlug}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-black">
                        RS. {product.price.toLocaleString()}
                        {product.originalPrice && (
                          <span className="text-neutral-400 line-through ml-1 text-[10px]">
                            RS. {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Stock Status 1-Click Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStock(product.id, isInStock)}
                          className={`text-[9px] font-black uppercase px-2.5 py-1 border transition-colors rounded-lg ${
                            isInStock
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-red-50 hover:border-red-300 hover:text-red-800"
                              : "bg-red-50 border-red-300 text-red-800 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800"
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
                              className={`text-[8px] font-bold px-1.5 py-0.5 uppercase rounded ${
                                prodSizes.includes(sz)
                                  ? "bg-neutral-800 text-white"
                                  : "bg-neutral-100 text-neutral-400 line-through"
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
                          className="bg-neutral-100 text-neutral-900 border border-neutral-300 hover:bg-[#E8262A] hover:text-white px-3 py-1.5 text-[10px] font-black tracking-wider uppercase transition-colors rounded-lg"
                        >
                          Edit & Photos
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors rounded-lg"
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
      {/* TAB 3: INVENTORY & STOCK MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "inventory" && (
        <InventoryManager
          products={productsList}
          onRefresh={refreshData}
          onEditProduct={(prod) => setEditingProduct(prod)}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STOREFRONT SECTIONS & SHOWCASES */}
      {/* ========================================================================= */}
      {activeTab === "sections" && (
        <SectionsManager products={productsList} />
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CATEGORIES & DRAWER MENU ARCHITECTURE */}
      {/* ========================================================================= */}
      {activeTab === "categories" && (
        <CategoryManager />
      )}

      {/* ========================================================================= */}
      {/* TAB 6: REGISTERED USERS (WHO CREATED ACCOUNTS) */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-neutral-300 rounded-2xl shadow-xs">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-black">
                Registered Customer Accounts
              </h3>
              <p className="text-xs text-neutral-500 uppercase mt-0.5">
                Full list of users who signed up or registered on the store.
              </p>
            </div>

            <div className="w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by Name, Email, or Mobile Number..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-[#F5F4EE] border border-neutral-300 px-3.5 py-2 text-xs font-bold tracking-wider text-black placeholder:text-neutral-400 focus:outline-none focus:border-[#E8262A] rounded-xl"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-300 bg-white rounded-2xl p-6 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                No registered accounts match your search.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-300 rounded-2xl shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#F5F4EE] text-neutral-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Member Name</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4">Mobile Number</th>
                    <th className="py-3.5 px-4">Signup Date</th>
                    <th className="py-3.5 px-4">Orders Placed</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
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
                      <tr key={user.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#E8262A] flex items-center justify-center font-black text-white text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-black uppercase">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-700">
                          {user.email || <span className="text-neutral-400 italic">None</span>}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-700">
                          {user.phone ? `+91 ${user.phone}` : <span className="text-neutral-400 italic">None</span>}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-700">
                          <div className="flex flex-col">
                            <span className="font-bold text-black text-xs">
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Recent"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-black">{userOrderCount} Orders</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("orders");
                              setOrderSearchQuery(user.name);
                            }}
                            className="text-[10px] text-[#E8262A] hover:text-[#d01e22] font-bold uppercase tracking-wider underline"
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
      {/* MODAL: EDIT PRODUCT & MULTI-PHOTO MANAGER */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-inter">
          <div className="bg-white border border-neutral-300 w-full max-w-2xl p-6 sm:p-8 space-y-6 text-black rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
              <div>
                <span className="text-[9px] font-black tracking-widest text-[#E8262A] uppercase">
                  Product & Photo Editor
                </span>
                <h3 className="text-xl font-black tracking-wider uppercase mt-0.5 font-anton text-black">
                  Edit Details & Photography
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-neutral-400 hover:text-black text-2xl font-bold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Multi-Photo Manager Area */}
              <div className="border border-neutral-300 p-4 bg-[#F9F8F5] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-700">
                    Product Photography ({editingProduct.images?.length || 0} Photos)
                  </label>
                  <span className="text-[9px] text-neutral-500 font-bold uppercase">
                    2 to 4 photos recommended
                  </span>
                </div>

                {/* Thumbnails Gallery */}
                <div className="flex flex-wrap gap-2.5">
                  {(editingProduct.images || []).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-24 bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden group shadow-2xs"
                    >
                      <Image
                        src={img || "/images/products/oversized-tshirt.jpg"}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black text-white text-[8px] font-black uppercase px-1 rounded">
                          Cover
                        </span>
                      )}
                      {(editingProduct.images || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = (editingProduct.images || []).filter((_, i) => i !== idx);
                            setEditingProduct({ ...editingProduct, images: next });
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs font-bold leading-none opacity-90 group-hover:opacity-100 transition-opacity"
                          title="Remove photo"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Upload from PC and URL controls */}
                <div className="pt-2 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Upload Another Photo from PC:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "edit")}
                      disabled={uploadingImage}
                      className="w-full text-xs text-neutral-600 file:mr-2 file:py-1.5 file:px-3 file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-black file:text-white hover:file:bg-[#E8262A] file:cursor-pointer file:rounded-lg"
                    />
                    {uploadingImage && <p className="text-xs text-[#E8262A] font-bold mt-1">Uploading photo...</p>}
                    {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Or Add by Image URL:
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={editingImageUrlInput}
                        onChange={(e) => setEditingImageUrlInput(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-[#E8262A]"
                      />
                      <button
                        type="button"
                        disabled={!editingImageUrlInput.trim()}
                        onClick={() => {
                          if (!editingImageUrlInput.trim()) return;
                          setEditingProduct({
                            ...editingProduct,
                            images: [...(editingProduct.images || []), editingImageUrlInput.trim()],
                          });
                          setEditingImageUrlInput("");
                        }}
                        className="bg-black hover:bg-[#E8262A] disabled:bg-neutral-300 text-white px-2.5 py-1 text-[10px] font-black uppercase rounded-lg transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
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
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Selling Price (RS.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Collection *
                  </label>
                  <select
                    value={editingProduct.collectionSlug}
                    onChange={(e) => setEditingProduct({ ...editingProduct, collectionSlug: e.target.value })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    {COLLECTIONS.map((col) => (
                      <option key={col.slug} value={col.slug}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Stock Quantity (Units Available)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stockQuantity ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                  <p className="text-[9px] text-neutral-500 mt-1">
                    If set to &le; 5, store displays &quot;Only {editingProduct.stockQuantity ?? 10} left&quot; badge!
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Original Price (Strike-through RS.)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>
              </div>

              {/* Sizes Available */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-2">
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
                        className={`w-10 h-10 border text-xs font-bold uppercase rounded-xl transition-all ${
                          isSelected
                            ? "border-[#E8262A] bg-[#E8262A] text-white font-black shadow-xs"
                            : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 bg-[#F5F4EE] border border-neutral-300 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    className="w-4 h-4 accent-[#E8262A]"
                  />
                  <span className="text-xs font-bold uppercase text-black">In Stock (Active for purchase)</span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#F5F4EE] border border-neutral-300 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.visibleOnSite !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, visibleOnSite: e.target.checked })}
                    className="w-4 h-4 accent-[#E8262A]"
                  />
                  <span className="text-xs font-bold uppercase text-black">Visible on Live Website</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-1/3 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 py-3 text-xs font-bold uppercase rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-[#E8262A] hover:bg-[#d01e22] text-white py-3 text-xs font-black uppercase rounded-xl transition-all shadow-md active:scale-98"
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
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-inter">
          <div className="bg-white border border-neutral-300 w-full max-w-2xl p-6 sm:p-8 space-y-6 text-black rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
              <div>
                <span className="text-[9px] font-black tracking-widest text-[#E8262A] uppercase">
                  Catalog Operations
                </span>
                <h3 className="text-xl font-black tracking-wider uppercase mt-0.5 font-anton text-black">
                  Add New Drop Product
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-black text-2xl font-bold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-6">
              {/* Multi-Photo Manager Area */}
              <div className="border border-neutral-300 p-4 bg-[#F9F8F5] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-700">
                    Product Photography ({newProductForm.images?.length || 0} Photos)
                  </label>
                  <span className="text-[9px] text-neutral-500 font-bold uppercase">
                    Upload 2 to 4 photos
                  </span>
                </div>

                {/* Thumbnails Gallery */}
                <div className="flex flex-wrap gap-2.5">
                  {(newProductForm.images || []).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-24 bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden group shadow-2xs"
                    >
                      <Image
                        src={img || "/images/products/oversized-tshirt.jpg"}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black text-white text-[8px] font-black uppercase px-1 rounded">
                          Cover
                        </span>
                      )}
                      {(newProductForm.images || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = (newProductForm.images || []).filter((_, i) => i !== idx);
                            setNewProductForm({ ...newProductForm, images: next });
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs font-bold leading-none opacity-90 group-hover:opacity-100 transition-opacity"
                          title="Remove photo"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Upload from PC and URL controls */}
                <div className="pt-2 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Upload Photo from PC:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "new")}
                      disabled={uploadingImage}
                      className="w-full text-xs text-neutral-600 file:mr-2 file:py-1.5 file:px-3 file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-black file:text-white hover:file:bg-[#E8262A] file:cursor-pointer file:rounded-lg"
                    />
                    {uploadingImage && <p className="text-xs text-[#E8262A] font-bold mt-1">Uploading photo...</p>}
                    {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Or Add by Image URL:
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newImageUrlInput}
                        onChange={(e) => setNewImageUrlInput(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-[#E8262A]"
                      />
                      <button
                        type="button"
                        disabled={!newImageUrlInput.trim()}
                        onClick={() => {
                          if (!newImageUrlInput.trim()) return;
                          setNewProductForm({
                            ...newProductForm,
                            images: [...(newProductForm.images || []), newImageUrlInput.trim()],
                          });
                          setNewImageUrlInput("");
                        }}
                        className="bg-black hover:bg-[#E8262A] disabled:bg-neutral-300 text-white px-2.5 py-1 text-[10px] font-black uppercase rounded-lg transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TACTICAL V2 CARGO PANTS"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
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
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Sub-Category *
                  </label>
                  <select
                    value={newProductForm.subCategory}
                    onChange={(e) => setNewProductForm({ ...newProductForm, subCategory: e.target.value as any })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    {CATEGORIES.find((c) => c.id === newProductForm.category)?.subCategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Collection *
                  </label>
                  <select
                    value={newProductForm.collectionSlug}
                    onChange={(e) => setNewProductForm({ ...newProductForm, collectionSlug: e.target.value })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    {COLLECTIONS.map((col) => (
                      <option key={col.slug} value={col.slug}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Selling Price (RS.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Stock Quantity (Units Available)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProductForm.stockQuantity ?? 10}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                  <p className="text-[9px] text-neutral-500 mt-1">
                    If set to &le; 5, store displays &quot;Only {newProductForm.stockQuantity ?? 10} left&quot; badge!
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Original Price (Strike-through RS.)
                  </label>
                  <input
                    type="number"
                    value={newProductForm.originalPrice || ""}
                    onChange={(e) => setNewProductForm({ ...newProductForm, originalPrice: Number(e.target.value) })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>
              </div>

              {/* Sizes Available */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-2">
                  Available Sizes
                </label>
                <div className="flex gap-2">
                  {ALL_SIZES.map((sz) => {
                    const activeSizes = newProductForm.sizes || ALL_SIZES;
                    const isSelected = activeSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const nextSizes = isSelected
                            ? activeSizes.filter((s) => s !== sz)
                            : [...activeSizes, sz];
                          setNewProductForm({ ...newProductForm, sizes: nextSizes });
                        }}
                        className={`w-10 h-10 border text-xs font-bold uppercase rounded-xl transition-all ${
                          isSelected
                            ? "border-[#E8262A] bg-[#E8262A] text-white font-black shadow-xs"
                            : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Heavyweight custom-milled French Terry..."
                  value={newProductForm.description || ""}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-black focus:outline-none focus:border-[#E8262A]"
                />
              </div>

              {/* Visibility and Stock Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 bg-[#F5F4EE] border border-neutral-300 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProductForm.inStock !== false}
                    onChange={(e) => setNewProductForm({ ...newProductForm, inStock: e.target.checked })}
                    className="w-4 h-4 accent-[#E8262A]"
                  />
                  <span className="text-xs font-bold uppercase text-black">In Stock (Active for purchase)</span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#F5F4EE] border border-neutral-300 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProductForm.visibleOnSite !== false}
                    onChange={(e) => setNewProductForm({ ...newProductForm, visibleOnSite: e.target.checked })}
                    className="w-4 h-4 accent-[#E8262A]"
                  />
                  <span className="text-xs font-bold uppercase text-black">Visible on Live Website</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/3 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 py-3 text-xs font-bold uppercase rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-[#E8262A] hover:bg-[#d01e22] text-white py-3 text-xs font-black uppercase rounded-xl transition-all shadow-md active:scale-98"
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
