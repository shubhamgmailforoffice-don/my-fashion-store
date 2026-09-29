"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Product } from "@/lib/data";
import { Order } from "@/lib/store";
import InventoryManager from "@/components/admin/InventoryManager";
import SectionsManager from "@/components/admin/SectionsManager";
import CategoryManager from "@/components/admin/CategoryManager";
import ReelsManager from "@/components/admin/ReelsManager";
import { AdminCategory, DEFAULT_ADMIN_CATEGORIES, parseCategoriesData } from "@/lib/categories";

const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

// Default fallback categories
const CATEGORIES = DEFAULT_ADMIN_CATEGORIES;

interface RegisteredUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  createdAt: string;
}

type AdminTab = "orders" | "products" | "inventory" | "sections" | "categories" | "reels" | "users";
const VALID_TABS: AdminTab[] = ["orders", "products", "inventory", "sections", "categories", "reels", "users"];

interface TabNavItem {
  key: AdminTab;
  num: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

const ADMIN_TAB_NAV: TabNavItem[] = [
  {
    key: "orders",
    num: "1.",
    label: "Orders & Dispatch",
    shortLabel: "Orders",
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    key: "products",
    num: "2.",
    label: "Products & Photos",
    shortLabel: "Products",
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    key: "inventory",
    num: "3.",
    label: "Inventory & Stock",
    shortLabel: "Inventory",
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "sections",
    num: "4.",
    label: "Storefront Sections",
    shortLabel: "Sections",
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    key: "categories",
    num: "5.",
    label: "Categories & Menu",
    shortLabel: "Categories",
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    key: "reels",
    num: "6.",
    label: "Lookbook Reels",
    shortLabel: "Reels",
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: "users",
    num: "7.",
    label: "Registered Users",
    shortLabel: "Users",
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

function AdminContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") as AdminTab | null;
  const [activeTab, setActiveTab] = useState<AdminTab>(
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : "orders"
  );

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<RegisteredUser[]>([]);
  const [categoriesList, setCategoriesList] = useState<AdminCategory[]>(DEFAULT_ADMIN_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Subcategory Adder modal state
  const [quickAddSubOpen, setQuickAddSubOpen] = useState(false);
  const [quickSubName, setQuickSubName] = useState("");
  const [quickSubTargetCat, setQuickSubTargetCat] = useState<string>("Tops");
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);

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
    subCategory: "T-shirts" as any,
    collectionSlug: "essentials",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    stockQuantity: 10,
    visibleOnSite: true,
    images: ["/images/products/oversized-tshirt.jpg"],
    description: "",
  });

  // Fetch live categories from database
  const refreshCategories = async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const parsed = parseCategoriesData(json);
        setCategoriesList(parsed);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  };

  // Quick add subcategory handler that persists to database and selects it
  const handleQuickAddSubCategory = async (targetCategory: string, subName: string) => {
    const trimmed = subName.trim();
    if (!trimmed) return;
    setIsAddingSubCategory(true);
    try {
      const catObj = categoriesList.find(
        (c) => c.id.toLowerCase() === targetCategory.toLowerCase()
      );
      const accordionId = catObj?.rawId || catObj?.id || targetCategory;

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_subcategory",
          accordionId,
          subCategory: trimmed,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const updated = parseCategoriesData(result.data);
        setCategoriesList(updated);
        // Optimistically update whichever modal is open
        if (isAddModalOpen) {
          setNewProductForm((prev) => ({ ...prev, subCategory: trimmed }));
        }
        if (editingProduct) {
          setEditingProduct((prev) => (prev ? { ...prev, subCategory: trimmed } : null));
        }
        setQuickSubName("");
        setQuickAddSubOpen(false);
      } else {
        alert("Failed to save new subcategory.");
      }
    } catch (e) {
      alert("Error adding subcategory: " + String(e));
    } finally {
      setIsAddingSubCategory(false);
    }
  };

  // Instant tab selection handler that updates URL and layout synchronously
  const handleSelectTab = (newTab: AdminTab) => {
    setActiveTab(newTab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.pushState({}, "", url.toString());
      window.dispatchEvent(new CustomEvent("admin-active-tab-changed", { detail: newTab }));
    } catch {}
  };

  // Sync tab with URL parameter if it changes
  useEffect(() => {
    const tabParam = searchParams.get("tab") as AdminTab | null;
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Support instant custom event from layout navigation
  useEffect(() => {
    const handleCustomTabSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const target = customEvent.detail as AdminTab;
      if (target && VALID_TABS.includes(target)) {
        setActiveTab(target);
      }
    };
    window.addEventListener("admin-switch-tab", handleCustomTabSwitch);
    return () => {
      window.removeEventListener("admin-switch-tab", handleCustomTabSwitch);
    };
  }, []);

  // Load all operational data
  const refreshData = async () => {
    try {
      const [resProd, resOrders, resUsers, resCats] = await Promise.all([
        fetch("/api/products?all=true", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);

      if (resProd.ok) setProductsList(await resProd.json());
      if (resOrders.ok) setOrdersList(await resOrders.json());
      if (resUsers.ok) setUsersList(await resUsers.json());
      if (resCats.ok) {
        const json = await resCats.json();
        setCategoriesList(parseCategoriesData(json));
      }
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

    const handleCatsSync = (e: any) => {
      if (e?.detail) {
        setCategoriesList(parseCategoriesData(e.detail));
      } else {
        refreshCategories();
      }
    };
    window.addEventListener("driivn_categories_updated", handleCatsSync);

    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("driivn_categories_updated", handleCatsSync);
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
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q));

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl shadow-xs font-inter">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#E8262A] uppercase font-inter">
            Control Center • Real-time Operations
          </span>
          <h1 className="text-xl sm:text-3xl font-bold uppercase tracking-wide text-[#2C2A29] mt-0.5 font-anton">
            DRIIVN Administration
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => refreshData()}
            className="border border-white/80 bg-white/70 hover:bg-white text-[#2C2A29] px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold tracking-widest uppercase transition-all rounded-xl shadow-2xs backdrop-blur-sm text-center cursor-pointer"
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              handleSelectTab("products");
              setIsAddModalOpen(true);
            }}
            className="bg-[#E8262A] text-white hover:bg-[#d01e22] px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 rounded-xl shadow-xs active:scale-95 border border-red-500/30 text-center cursor-pointer"
          >
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Top High-level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 font-inter">
        <div className="bg-white/75 backdrop-blur-xl border border-white/80 p-3.5 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Total Revenue</p>
          <p className="text-lg sm:text-2xl font-bold text-[#2C2A29] mt-1 font-inter tracking-tight truncate">RS. {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white/75 backdrop-blur-xl border border-white/80 p-3.5 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Total Orders</p>
          <p className="text-lg sm:text-2xl font-bold text-[#2C2A29] mt-1 font-inter tracking-tight">{ordersList.length}</p>
        </div>
        <div className="bg-white/75 backdrop-blur-xl border border-white/80 p-3.5 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Live Catalog</p>
          <p className="text-lg sm:text-2xl font-bold text-[#2C2A29] mt-1 font-inter tracking-tight">{productsList.length} Items</p>
        </div>
        <div className="bg-white/75 backdrop-blur-xl border border-white/80 p-3.5 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Registered Users</p>
          <p className="text-lg sm:text-2xl font-bold text-[#E8262A] mt-1 font-inter tracking-tight">{usersList.length} Members</p>
        </div>
      </div>

      {/* ALL SEVEN DEDICATED TABS - FULLY RESPONSIVE & MOBILE-FRIENDLY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-inter">
        {ADMIN_TAB_NAV.map((item) => {
          const isActive = activeTab === item.key;
          let badgeText = "";
          if (item.key === "orders") badgeText = `${ordersList.length}`;
          else if (item.key === "products") badgeText = `${productsList.length}`;
          else if (item.key === "inventory") {
            const outCount = productsList.filter((p) => p.inStock === false).length;
            badgeText = outCount > 0 ? `${outCount} Out` : "All In";
          } else if (item.key === "sections") badgeText = "Active";
          else if (item.key === "categories") badgeText = "Drawer";
          else if (item.key === "reels") badgeText = "Reels";
          else if (item.key === "users") badgeText = `${usersList.length}`;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelectTab(item.key)}
              className={`p-2.5 sm:p-3 rounded-2xl transition-all flex flex-col items-center justify-between text-center cursor-pointer border ${
                item.key === "users" ? "col-span-2 sm:col-span-1" : ""
              } ${
                isActive
                  ? "bg-[#E8262A] text-white border-[#E8262A] shadow-md font-black ring-2 ring-[#E8262A]/20 scale-[1.01]"
                  : "bg-white/85 hover:bg-white text-neutral-800 hover:text-black border-white/80 shadow-2xs backdrop-blur-sm hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-1.5 justify-center w-full min-w-0">
                <span className={isActive ? "text-white" : "text-[#E8262A]"}>
                  {item.icon}
                </span>
                <span className="text-[11px] xl:text-xs font-black uppercase tracking-tight leading-tight truncate">
                  {item.num} {item.label}
                </span>
              </div>
              <span
                className={`mt-1.5 px-2 py-0.5 text-[9px] rounded-full font-bold uppercase transition-colors ${
                  isActive
                    ? "bg-white text-[#E8262A] font-black"
                    : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                }`}
              >
                {badgeText}
              </span>
            </button>
          );
        })}
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
                                className="bg-[#2C2A29] hover:bg-[#E8262A] disabled:bg-neutral-300 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap rounded-lg"
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
                All Categories ({productsList.length})
              </button>
              {categoriesList.map((cat) => {
                const count = productsList.filter((p) => {
                  const pCat = p.category.toLowerCase();
                  const cId = cat.id.toLowerCase();
                  return (
                    pCat === cId ||
                    pCat === cat.name.toLowerCase() ||
                    (cId === "tops" && pCat === "top") ||
                    (cId === "top" && pCat === "tops") ||
                    (cId === "bottoms" && pCat === "bottom") ||
                    (cId === "bottom" && pCat === "bottoms")
                  );
                }).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setProductCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors rounded-xl ${
                      productCategoryFilter.toLowerCase() === cat.id.toLowerCase()
                        ? "bg-[#E8262A] text-white font-black shadow-xs"
                        : "bg-[#F5F4EE] text-neutral-700 hover:text-black hover:bg-neutral-200 border border-neutral-300"
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => handleSelectTab("categories")}
                className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 rounded-xl transition-colors flex items-center gap-1.5"
                title="Configure Coming Soon Drop Pages"
              >
                <span>🚧 Coming Soon Pages &rarr;</span>
              </button>
            </div>
          </div>

          {/* Products Container: Responsive Mobile Cards + Desktop Table */}
          <div className="bg-white border border-neutral-300 rounded-2xl shadow-xs overflow-hidden">
            {/* Mobile Cards View (Visible on Mobile / Small screens) */}
            <div className="md:hidden divide-y divide-neutral-200">
              {filteredProducts.map((product) => {
                const isInStock = product.inStock !== false;
                const prodSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ALL_SIZES;

                return (
                  <div key={product.id} className="p-4 space-y-3 bg-white">
                    <div className="flex gap-3 items-start">
                      <div
                        onClick={() => setEditingProduct({ ...product })}
                        className="relative w-16 h-20 bg-neutral-100 border border-neutral-300 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 group"
                        title="Click to edit photo"
                      >
                        <Image
                          src={product.images[0] || "/images/products/oversized-tshirt.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                          {product.images.length}P
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-bold text-black text-xs uppercase leading-snug truncate">{product.name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 uppercase">
                          <span className="text-[#E8262A] font-bold">{product.category}</span>
                          <span>•</span>
                          <span>{product.subCategory || "Streetwear"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-black text-xs">
                            RS. {product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-neutral-400 line-through text-[10px]">
                              RS. {product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {/* Sizes */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {ALL_SIZES.map((sz) => (
                            <span
                              key={sz}
                              className={`text-[8px] font-bold px-1.5 py-0.2 uppercase rounded ${
                                prodSizes.includes(sz)
                                  ? "bg-neutral-800 text-white"
                                  : "bg-neutral-100 text-neutral-400 line-through"
                              }`}
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(product.id, isInStock)}
                        className={`text-[9px] font-black uppercase px-2.5 py-1 border transition-colors rounded-lg cursor-pointer ${
                          isInStock
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-red-50 border-red-300 text-red-800"
                        }`}
                      >
                        {isInStock ? "● In Stock (Active)" : "○ Sold Out"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...product })}
                          className="bg-neutral-100 text-neutral-900 border border-neutral-300 hover:bg-[#E8262A] hover:text-white px-3 py-1 text-[10px] font-black tracking-wider uppercase transition-colors rounded-lg cursor-pointer"
                        >
                          Edit & Photos
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase transition-colors rounded-lg cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block overflow-x-auto w-full">
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
                          <p className="font-bold text-black text-xs">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-500 uppercase">
                            <span className="text-[#E8262A] font-bold">{product.category}</span>
                            <span>•</span>
                            <span>{product.subCategory || "Streetwear"}</span>
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
                            className={`text-[9px] font-black uppercase px-2.5 py-1 border transition-colors rounded-lg cursor-pointer ${
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
                            className="bg-neutral-100 text-neutral-900 border border-neutral-300 hover:bg-[#E8262A] hover:text-white px-3 py-1.5 text-[10px] font-black tracking-wider uppercase transition-colors rounded-lg cursor-pointer"
                          >
                            Edit & Photos
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors rounded-lg cursor-pointer"
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
          categoriesList={categoriesList}
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
        <CategoryManager
          products={productsList}
          onCategoriesUpdated={refreshCategories}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 6: LOOKBOOK REELS & PHOTOS MANAGER */}
      {/* ========================================================================= */}
      {activeTab === "reels" && (
        <ReelsManager products={productsList} />
      )}

      {/* ========================================================================= */}
      {/* TAB 7: REGISTERED USERS (WHO CREATED ACCOUNTS) */}
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
              {/* Mobile Cards View (Visible on Mobile / Small screens) */}
            <div className="md:hidden divide-y divide-neutral-200">
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
                  <div key={user.id} className="p-4 space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#E8262A] flex items-center justify-center font-black text-white text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-black text-xs uppercase leading-snug">{user.name}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Recent"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-neutral-100 text-black border border-neutral-200">
                        {userOrderCount} Orders
                      </span>
                    </div>

                    <div className="text-xs space-y-1 bg-[#F9F8F5] p-2.5 rounded-xl border border-neutral-200 font-mono">
                      <p className="text-neutral-700 truncate">
                        ✉️ {user.email ? <a href={`mailto:${user.email}`} className="underline">{user.email}</a> : <span className="text-neutral-400 italic">None</span>}
                      </p>
                      <p className="text-neutral-700">
                        📞 {user.phone ? <a href={`tel:+91${userPhoneClean}`} className="underline">+91 {user.phone}</a> : <span className="text-neutral-400 italic">None</span>}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleSelectTab("orders");
                        setOrderSearchQuery(user.name);
                      }}
                      className="w-full text-center py-2 text-[10px] text-[#E8262A] hover:text-[#d01e22] font-black uppercase tracking-wider bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer"
                    >
                      View Customer Orders &rarr;
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block overflow-x-auto w-full">
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
                              handleSelectTab("orders");
                              setOrderSearchQuery(user.name);
                            }}
                            className="text-[10px] text-[#E8262A] hover:text-[#d01e22] font-bold uppercase tracking-wider underline cursor-pointer"
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
          </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PRODUCT & MULTI-PHOTO MANAGER */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md font-inter">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/70 w-full max-w-2xl p-4 sm:p-8 space-y-6 text-black rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
              <div>
                <span className="text-[9px] font-black tracking-widest text-[#E8262A] uppercase">
                  Product & Photo Editor
                </span>
                <h3 className="text-xl font-bold tracking-wide uppercase mt-0.5 font-anton text-[#2C2A29]">
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
                        <span className="absolute bottom-1 left-1 bg-[#2C2A29] text-white text-[8px] font-black uppercase px-1 rounded">
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
                      className="w-full text-xs text-neutral-600 file:mr-2 file:py-1.5 file:px-3 file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#2C2A29] file:text-white hover:file:bg-[#E8262A] file:cursor-pointer file:rounded-lg"
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
                        className="bg-[#2C2A29] hover:bg-[#E8262A] disabled:bg-neutral-300 text-white px-2.5 py-1 text-[10px] font-black uppercase rounded-lg transition-colors"
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
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Category *
                  </label>
                  <select
                    value={
                      categoriesList.find(
                        (c) => c.id.toLowerCase() === (editingProduct.category || "").toLowerCase()
                      )?.id || editingProduct.category
                    }
                    onChange={(e) => {
                      const selCat = e.target.value;
                      const matched = categoriesList.find(
                        (c) => c.id.toLowerCase() === selCat.toLowerCase()
                      );
                      setEditingProduct({
                        ...editingProduct,
                        category: matched ? matched.id : selCat,
                        subCategory: (matched?.subCategories[0] || "") as any,
                      });
                    }}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                      Sub-Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickSubTargetCat(editingProduct.category || "Tops");
                        setQuickAddSubOpen(true);
                      }}
                      className="text-[9px] font-bold uppercase text-[#E8262A] hover:underline"
                    >
                      + Add Sub-Category
                    </button>
                  </div>
                  <select
                    value={editingProduct.subCategory || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subCategory: e.target.value as any })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    {(() => {
                      const matchedCat = categoriesList.find(
                        (c) => c.id.toLowerCase() === (editingProduct.category || "").toLowerCase()
                      );
                      const subs = matchedCat?.subCategories || [];
                      return (
                        <>
                          {subs.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                          {editingProduct.subCategory &&
                            !subs.some((s) => s.toLowerCase() === editingProduct.subCategory?.toLowerCase()) && (
                              <option value={editingProduct.subCategory}>{editingProduct.subCategory}</option>
                            )}
                        </>
                      );
                    })()}
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
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md font-inter">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/70 w-full max-w-2xl p-4 sm:p-8 space-y-6 text-black rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
              <div>
                <span className="text-[9px] font-black tracking-widest text-[#E8262A] uppercase">
                  Catalog Operations
                </span>
                <h3 className="text-xl font-bold tracking-wide uppercase mt-0.5 font-anton text-[#2C2A29]">
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
                        <span className="absolute bottom-1 left-1 bg-[#2C2A29] text-white text-[8px] font-black uppercase px-1 rounded">
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
                      className="w-full text-xs text-neutral-600 file:mr-2 file:py-1.5 file:px-3 file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#2C2A29] file:text-white hover:file:bg-[#E8262A] file:cursor-pointer file:rounded-lg"
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
                        className="bg-[#2C2A29] hover:bg-[#E8262A] disabled:bg-neutral-300 text-white px-2.5 py-1 text-[10px] font-black uppercase rounded-lg transition-colors"
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
                    placeholder="e.g. Tactical V2 Cargo Pants"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Category *
                  </label>
                  <select
                    value={
                      categoriesList.find(
                        (c) => c.id.toLowerCase() === (newProductForm.category || "").toLowerCase()
                      )?.id || (categoriesList[0]?.id || "Tops")
                    }
                    onChange={(e) => {
                      const selCat = e.target.value;
                      const matched = categoriesList.find(
                        (c) => c.id.toLowerCase() === selCat.toLowerCase()
                      );
                      setNewProductForm({
                        ...newProductForm,
                        category: matched ? matched.id : selCat,
                        subCategory: (matched?.subCategories[0] || "") as any,
                      });
                    }}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                      Sub-Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickSubTargetCat(newProductForm.category || categoriesList[0]?.id || "Tops");
                        setQuickAddSubOpen(true);
                      }}
                      className="text-[9px] font-bold uppercase text-[#E8262A] hover:underline"
                    >
                      + Add Sub-Category
                    </button>
                  </div>
                  <select
                    value={newProductForm.subCategory || ""}
                    onChange={(e) => setNewProductForm({ ...newProductForm, subCategory: e.target.value as any })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    {(() => {
                      const matchedCat =
                        categoriesList.find(
                          (c) => c.id.toLowerCase() === (newProductForm.category || "").toLowerCase()
                        ) || categoriesList[0];
                      const subs = matchedCat?.subCategories || [];
                      return (
                        <>
                          {subs.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                          {newProductForm.subCategory &&
                            !subs.some((s) => s.toLowerCase() === newProductForm.subCategory?.toLowerCase()) && (
                              <option value={newProductForm.subCategory}>{newProductForm.subCategory}</option>
                            )}
                        </>
                      );
                    })()}
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

      {/* Quick Add Subcategory Modal */}
      {quickAddSubOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-sm w-full p-6 border border-white/70 shadow-2xl animate-in zoom-in-95">
            <h4 className="text-sm font-bold font-anton uppercase text-[#2C2A29] tracking-wide mb-1">
              Add New Sub-Category
            </h4>
            <p className="text-xs text-neutral-500 mb-4">
              Adding to <strong className="text-black">{quickSubTargetCat}</strong>. This will be immediately available in product forms and drawer menu.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleQuickAddSubCategory(quickSubTargetCat, quickSubName);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Sub-Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shirts, Oversized Tees, Joggers..."
                  value={quickSubName}
                  onChange={(e) => setQuickSubName(e.target.value)}
                  autoFocus
                  className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuickAddSubOpen(false);
                    setQuickSubName("");
                  }}
                  className="flex-1 py-2 text-xs font-bold uppercase rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingSubCategory || !quickSubName.trim()}
                  className="flex-1 py-2 text-xs font-bold uppercase rounded-xl bg-[#E8262A] text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isAddingSubCategory ? "Saving..." : "Add & Select"}
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
