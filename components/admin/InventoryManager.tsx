"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/lib/data";
import { AdminCategory, DEFAULT_ADMIN_CATEGORIES, parseCategoriesData } from "@/lib/categories";

interface InventoryManagerProps {
  products: Product[];
  onRefresh: () => void;
  onEditProduct?: (product: Product) => void;
  categoriesList?: AdminCategory[];
}

const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

const CATEGORIES_LIST = DEFAULT_ADMIN_CATEGORIES;

export default function InventoryManager({
  products,
  onRefresh,
  categoriesList: initialCategoriesList,
}: InventoryManagerProps) {
  const [categoriesList, setCategoriesList] = useState<AdminCategory[]>(
    initialCategoriesList || DEFAULT_ADMIN_CATEGORIES
  );

  useEffect(() => {
    if (initialCategoriesList && initialCategoriesList.length > 0) {
      setCategoriesList(initialCategoriesList);
    }
  }, [initialCategoriesList]);

  useEffect(() => {
    const handleCatsUpdated = (e: any) => {
      if (e?.detail) {
        setCategoriesList(parseCategoriesData(e.detail));
      } else {
        fetch("/api/categories", { cache: "no-store" })
          .then((r) => r.json())
          .then((json) => setCategoriesList(parseCategoriesData(json)))
          .catch(() => {});
      }
    };
    window.addEventListener("driivn_categories_updated", handleCatsUpdated);
    return () => window.removeEventListener("driivn_categories_updated", handleCatsUpdated);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "live" | "draft" | "low_stock" | "out_of_stock">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modal States
  const [activeManageProduct, setActiveManageProduct] = useState<Product | null>(null);
  const [isAddDraftOpen, setIsAddDraftOpen] = useState(false);
  const [publishingProduct, setPublishingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // New Draft Form State
  const [draftForm, setDraftForm] = useState({
    name: "",
    price: 4900,
    originalPrice: 5900,
    description: "",
    stockQuantity: 5,
    images: ["/images/products/oversized-tshirt.jpg"],
    category: "Tops",
    subCategory: "T-shirts",
  });

  // Publishing to Site Form State
  const [publishForm, setPublishForm] = useState({
    category: "Tops",
    subCategory: "T-shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stockQuantity: 5,
  });

  // Metrics
  const totalCount = products.length;
  const liveCount = products.filter((p) => p.visibleOnSite !== false).length;
  const draftCount = products.filter((p) => p.visibleOnSite === false).length;
  const lowStockCount = products.filter((p) => (p.stockQuantity !== undefined && p.stockQuantity > 0 && p.stockQuantity <= 5)).length;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const isDraft = p.visibleOnSite === false;
      const isLowStock = p.stockQuantity !== undefined && p.stockQuantity > 0 && p.stockQuantity <= 5;
      const isOutOfStock = p.inStock === false || (p.stockQuantity !== undefined && p.stockQuantity === 0);

      if (filterStatus === "live" && isDraft) return false;
      if (filterStatus === "draft" && !isDraft) return false;
      if (filterStatus === "low_stock" && !isLowStock) return false;
      if (filterStatus === "out_of_stock" && !isOutOfStock) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q)
      );
    });
  }, [products, filterStatus, searchQuery]);

  // Fast Stock Toggle
  const handleToggleStock = async (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUpdatingId(product.id);
    const newInStock = product.inStock === false;
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          inStock: newInStock,
          stockQuantity: newInStock ? Math.max(product.stockQuantity || 5, 1) : 0,
        }),
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      alert("Error updating inventory: " + String(err));
    } finally {
      setUpdatingId(null);
    }
  };

  // Quick Change Quantity inline
  const handleUpdateQuantityInline = async (product: Product, newQty: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (newQty < 0) return;
    setUpdatingId(product.id);
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          stockQuantity: newQty,
          inStock: newQty > 0,
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Fast Empty Stock to 0
  const handleEmptyProductStock = async (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUpdatingId(product.id);
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          stockQuantity: 0,
          inStock: false,
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      alert("Error setting stock to 0: " + String(err));
    } finally {
      setUpdatingId(null);
    }
  };

  // Permanently Delete Product
  const handleDeleteProduct = async (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete "${product.name}" from inventory?`)) {
      return;
    }
    setUpdatingId(product.id);
    try {
      const res = await fetch(`/api/products?id=${product.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (activeManageProduct?.id === product.id) {
          setActiveManageProduct(null);
        }
        onRefresh();
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      alert("Error deleting product: " + String(err));
    } finally {
      setUpdatingId(null);
    }
  };

  // Bulk: Empty stock of all products
  const handleEmptyAllStock = async () => {
    if (!confirm(`Are you sure you want to set stock quantity to 0 (Sold Out) for all ${products.length} products?`)) {
      return;
    }
    setIsSaving(true);
    try {
      await Promise.all(
        products.map((p) =>
          fetch("/api/products", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: p.id,
              stockQuantity: 0,
              inStock: false,
            }),
          })
        )
      );
      onRefresh();
    } catch (err) {
      alert("Error: " + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk: Delete all products completely
  const handleDeleteAllProducts = async () => {
    if (!confirm(`⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE ALL ${products.length} products from the store? This will completely empty your inventory so you can start with a 100% clean catalog.`)) {
      return;
    }
    const secondConfirm = prompt(`Type "DELETE ALL" to confirm permanent deletion:`);
    if (secondConfirm !== "DELETE ALL") {
      alert("Deletion cancelled.");
      return;
    }
    setIsSaving(true);
    try {
      await Promise.all(
        products.map((p) =>
          fetch(`/api/products?id=${p.id}`, {
            method: "DELETE",
          })
        )
      );
      onRefresh();
    } catch (err) {
      alert("Error deleting products: " + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Image Upload Handler
  const handleUploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>, onUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        onUrl(data.url);
      } else {
        alert(data.error || "Failed to upload image.");
      }
    } catch (err) {
      alert("Upload failed: " + String(err));
    } finally {
      setUploadingImage(false);
    }
  };

  // Save New Draft to Inventory
  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftForm.name.trim()) {
      alert("Please enter garment name.");
      return;
    }

    setIsSaving(true);
    try {
      const validImages = draftForm.images.filter(Boolean);
      const payload = {
        name: draftForm.name.trim(),
        price: Number(draftForm.price),
        originalPrice: draftForm.originalPrice ? Number(draftForm.originalPrice) : undefined,
        description: draftForm.description.trim() || "Heavyweight luxury streetwear piece.",
        stockQuantity: Number(draftForm.stockQuantity),
        images: validImages.length > 0 ? validImages : ["/images/products/oversized-tshirt.jpg"],
        category: draftForm.category,
        subCategory: draftForm.subCategory,
        colors: ["Black"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        visibleOnSite: false, // Save as Draft in Inventory only!
        inStock: Number(draftForm.stockQuantity) > 0,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsAddDraftOpen(false);
        setDraftForm({
          name: "",
          price: 4900,
          originalPrice: 5900,
          description: "",
          stockQuantity: 5,
          images: ["/images/products/oversized-tshirt.jpg"],
          category: "Tops",
          subCategory: "T-shirts",
        });
        onRefresh();
      } else {
        alert("Failed to save draft.");
      }
    } catch (err) {
      alert("Error saving draft: " + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Draft Product to Live Storefront
  const handlePublishToSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishingProduct) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: publishingProduct.id,
          visibleOnSite: true,
          category: publishForm.category,
          subCategory: publishForm.subCategory,
          sizes: publishForm.sizes,
          stockQuantity: Number(publishForm.stockQuantity),
          inStock: Number(publishForm.stockQuantity) > 0,
        }),
      });

      if (res.ok) {
        setPublishingProduct(null);
        onRefresh();
      } else {
        alert("Failed to publish to site.");
      }
    } catch (err) {
      alert("Error publishing: " + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Visibility between Live and Draft
  const handleToggleVisibility = async (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUpdatingId(product.id);
    const newVisible = product.visibleOnSite === false;
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          visibleOnSite: newVisible,
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Save Full Product Edits from Modal
  const handleSaveActiveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeManageProduct) return;

    setIsSaving(true);
    try {
      const validImages = activeManageProduct.images.filter(Boolean);
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...activeManageProduct,
          images: validImages.length > 0 ? validImages : ["/images/products/oversized-tshirt.jpg"],
          stockQuantity: Number(activeManageProduct.stockQuantity ?? 10),
          inStock: Number(activeManageProduct.stockQuantity ?? 10) > 0 && activeManageProduct.inStock !== false,
        }),
      });

      if (res.ok) {
        setActiveManageProduct(null);
        onRefresh();
      } else {
        alert("Failed to save changes.");
      }
    } catch (err) {
      alert("Error: " + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-inter">
      {/* Top Action Bar with Separate "Add to Inventory" Button */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8262A] block font-inter">
            Catalogue & Stock Operations
          </span>
          <h2 className="text-2xl font-black uppercase tracking-wider text-black font-anton mt-0.5">
            Inventory & Stock Desk
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Click any product row to manage photos, stock quantity, available sizes, or visibility.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onRefresh()}
            className="px-3.5 py-2 bg-white/70 hover:bg-white border border-white/80 rounded-xl text-xs font-bold text-neutral-800 uppercase transition-all shadow-2xs backdrop-blur-sm"
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            onClick={handleEmptyAllStock}
            disabled={isSaving || products.length === 0}
            className="px-3 py-2 bg-amber-50/80 hover:bg-amber-100 border border-amber-300/80 rounded-xl text-xs font-black text-amber-900 uppercase transition-all shadow-2xs disabled:opacity-40 backdrop-blur-sm"
            title="Set stock quantity to 0 (Sold Out) for all products"
          >
            Set All Stock to 0
          </button>
          <button
            type="button"
            onClick={handleDeleteAllProducts}
            disabled={isSaving || products.length === 0}
            className="px-3 py-2 bg-red-50/80 hover:bg-red-100 border border-red-300/80 rounded-xl text-xs font-black text-red-700 uppercase transition-all shadow-2xs disabled:opacity-40 backdrop-blur-sm"
            title="Permanently delete all products to start completely fresh"
          >
            🗑️ Delete All Products
          </button>
          <button
            type="button"
            onClick={() => setIsAddDraftOpen(true)}
            className="px-4 py-2 bg-[#E8262A] hover:bg-[#d01e22] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 flex items-center gap-1.5 border border-red-500/30"
          >
            <span>+ Add to Inventory</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/75 backdrop-blur-xl border border-white/80 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
            Total Inventory Items
          </p>
          <p className="text-2xl font-black text-black font-anton mt-1">
            {totalCount}
          </p>
          <span className="text-[10px] text-neutral-400 font-bold uppercase mt-1 block">
            Drafts & Live Combined
          </span>
        </div>

        <div className="bg-white/75 backdrop-blur-xl border border-emerald-300/80 p-5 rounded-2xl shadow-xs bg-emerald-50/30 hover:shadow-md transition-all">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
            Live on Storefront
          </p>
          <p className="text-2xl font-black text-emerald-700 font-anton mt-1">
            {liveCount}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold uppercase mt-1 block">
            Purchasable by Customers
          </span>
        </div>

        <div className="bg-white/75 backdrop-blur-xl border border-amber-300/80 p-5 rounded-2xl shadow-xs bg-amber-50/30 hover:shadow-md transition-all">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">
            Inventory Drafts (Offline)
          </p>
          <p className="text-2xl font-black text-amber-700 font-anton mt-1">
            {draftCount}
          </p>
          <span className="text-[10px] text-amber-600 font-bold uppercase mt-1 block">
            Saved & Ready to Publish
          </span>
        </div>

        <div className="bg-white/75 backdrop-blur-xl border border-red-300/80 p-5 rounded-2xl shadow-xs bg-red-50/30 hover:shadow-md transition-all">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#E8262A]">
            Low Stock Alerts (&le; 5 left)
          </p>
          <p className="text-2xl font-black text-[#E8262A] font-anton mt-1">
            {lowStockCount}
          </p>
          <span className="text-[10px] text-red-500 font-bold uppercase mt-1 block">
            Shows &quot;Only X Left&quot; on Site
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-neutral-300 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search garment name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:border-[#E8262A]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black font-bold text-xs"
            >
              &times;
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: `All (${totalCount})` },
            { id: "live", label: `Live Store (${liveCount})` },
            { id: "draft", label: `Drafts (${draftCount})` },
            { id: "low_stock", label: `Low Stock (${lowStockCount})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
                filterStatus === f.id
                  ? "bg-black text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clickable Inventory Table */}
      <div className="bg-white border border-neutral-300 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F4EE] border-b border-neutral-300 text-[10px] font-black uppercase tracking-wider text-neutral-600">
                <th className="py-3 px-4">Garment & Photos</th>
                <th className="py-3 px-4">Category & Drop</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock Quantity</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 font-bold">
                    No garments match the current inventory filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isDraft = p.visibleOnSite === false;
                  const qty = p.stockQuantity ?? 10;
                  const isLow = qty > 0 && qty <= 5;
                  const isOut = p.inStock === false || qty === 0;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setActiveManageProduct({ ...p })}
                      className="hover:bg-[#F5F4EE]/60 transition-colors cursor-pointer group"
                      title="Click to manage photos, stock, sizes, and details"
                    >
                      {/* Product Thumbnail & Multiple Photos Count */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                            <Image
                              src={p.images[0] || "/images/products/oversized-tshirt.jpg"}
                              alt={p.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                            {p.images.length > 1 && (
                              <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[8px] font-mono font-bold px-1 rounded-xs">
                                {p.images.length}P
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-black text-xs group-hover:text-[#E8262A] transition-colors leading-snug">
                              {p.name}
                            </p>
                            <span className="text-[10px] font-mono text-neutral-400">
                              ID: {p.id} &bull; {p.images.length} {p.images.length === 1 ? "photo" : "photos"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-bold text-neutral-700">
                        {p.category} &bull; {p.subCategory || "Edition"}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-black text-black">
                        RS. {p.price.toLocaleString()}
                        {p.originalPrice && (
                          <span className="text-[10px] text-neutral-400 line-through block font-normal">
                            RS. {p.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Stock Quantity Controls */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleUpdateQuantityInline(p, Math.max(0, qty - 1), e)}
                            className="w-6 h-6 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center border border-neutral-300 text-xs"
                          >
                            -
                          </button>
                          <span
                            className={`min-w-8 text-center text-xs font-black font-mono px-1 py-0.5 rounded ${
                              isLow
                                ? "bg-red-50 text-[#E8262A] border border-red-200"
                                : isOut
                                ? "bg-neutral-100 text-neutral-400"
                                : "text-black"
                            }`}
                          >
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleUpdateQuantityInline(p, qty + 1, e)}
                            className="w-6 h-6 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center border border-neutral-300 text-xs"
                          >
                            +
                          </button>
                        </div>
                        {isLow && (
                          <span className="text-[9px] font-bold text-[#E8262A] block mt-0.5 uppercase">
                            Only {qty} left on site
                          </span>
                        )}
                      </td>

                      {/* Visibility State */}
                      <td className="py-3 px-4">
                        {isDraft ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Inventory Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Live on Site
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {isDraft ? (
                            <button
                              type="button"
                              onClick={() => {
                                setPublishingProduct(p);
                                setPublishForm({
                                  category: p.category || "Tops",
                                  subCategory: p.subCategory || "T-shirts",
                                  sizes: p.sizes || ["S", "M", "L", "XL", "XXL"],
                                  stockQuantity: p.stockQuantity ?? 5,
                                });
                              }}
                              className="px-2.5 py-1 bg-black hover:bg-[#E8262A] text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-xs"
                            >
                              + Add to Site
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleToggleVisibility(p, e)}
                              disabled={updatingId === p.id}
                              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-700 rounded-lg text-[10px] font-bold uppercase transition-colors"
                              title="Hide from store into drafts"
                            >
                              Unpublish
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleEmptyProductStock(p, e)}
                            disabled={updatingId === p.id || (p.stockQuantity === 0 && p.inStock === false)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-[10px] font-bold uppercase transition-colors disabled:opacity-40"
                            title="Set stock quantity to 0 (Mark as Sold Out)"
                          >
                            Qty: 0
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveManageProduct({ ...p })}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 rounded-lg text-[10px] font-bold uppercase transition-all"
                          >
                            Manage
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteProduct(p, e)}
                            disabled={updatingId === p.id}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold uppercase transition-colors"
                            title="Permanently delete this product"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD DRAFT TO INVENTORY */}
      {isAddDraftOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/70 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8262A]">
                  New Product Workflow &bull; Step 1
                </span>
                <h3 className="text-xl font-black uppercase tracking-wider text-black font-anton mt-0.5">
                  Add Draft to Inventory
                </h3>
                <p className="text-xs text-neutral-500">
                  Save garment photos, price, and description. It will remain in inventory until you choose to publish it to the live website.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDraftOpen(false)}
                className="text-neutral-400 hover:text-black text-2xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveDraft} className="space-y-5">
              {/* Product Photos (Supports multiple 2-4 photos) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-neutral-700">
                    Product Photos (Add 2 to 4 Photos) *
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftForm((prev) => ({
                        ...prev,
                        images: [...prev.images, ""],
                      }))
                    }
                    className="text-xs font-bold text-[#E8262A] hover:underline uppercase"
                  >
                    + Add Photo Slot
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {draftForm.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="border border-neutral-300 rounded-2xl p-2.5 bg-[#F5F4EE] space-y-2 relative"
                    >
                      <div className="relative aspect-[3/4] bg-neutral-200 rounded-xl overflow-hidden">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                        ) : (
                          <div className="h-full flex items-center justify-center text-[10px] text-neutral-400 font-bold uppercase">
                            No Photo
                          </div>
                        )}
                        <span className="absolute top-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                          {idx === 0 ? "Cover" : `Angle ${idx + 1}`}
                        </span>
                        {draftForm.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraftForm((prev) => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== idx),
                              }))
                            }
                            className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center"
                            title="Delete Photo"
                          >
                            &times;
                          </button>
                        )}
                      </div>

                      {/* Upload from Computer */}
                      <label className="block w-full text-center bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg py-1 text-[9px] font-bold uppercase text-neutral-700 cursor-pointer">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleUploadImageFile(e, (url) => {
                              const next = [...draftForm.images];
                              next[idx] = url;
                              setDraftForm((prev) => ({ ...prev, images: next }));
                            })
                          }
                        />
                      </label>

                      {/* Image URL */}
                      <input
                        type="text"
                        placeholder="Or Image URL..."
                        value={imgUrl}
                        onChange={(e) => {
                          const next = [...draftForm.images];
                          next[idx] = e.target.value;
                          setDraftForm((prev) => ({ ...prev, images: next }));
                        }}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2 py-1 text-[10px] text-black"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Title & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Garment Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midnight Tiger Oversized T-Shirt"
                    value={draftForm.name}
                    onChange={(e) => setDraftForm({ ...draftForm, name: e.target.value })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Price (RS.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={draftForm.price}
                    onChange={(e) => setDraftForm({ ...draftForm, price: Number(e.target.value) })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Initial Stock Quantity (Pieces available)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={draftForm.stockQuantity}
                    onChange={(e) => setDraftForm({ ...draftForm, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                  <span className="text-[9px] text-neutral-400 mt-1 block">
                    If set to 5 or less, storefront will show &quot;Only X left&quot;.
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Original Strike-through Price (RS. Optional)
                  </label>
                  <input
                    type="number"
                    value={draftForm.originalPrice}
                    onChange={(e) => setDraftForm({ ...draftForm, originalPrice: Number(e.target.value) })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>
              </div>

              {/* Category & SubCategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Category *
                  </label>
                  <select
                    value={
                      categoriesList.find(
                        (c) => c.id.toLowerCase() === (draftForm.category || "").toLowerCase()
                      )?.id || (categoriesList[0]?.id || "Tops")
                    }
                    onChange={(e) => {
                      const sel = e.target.value;
                      const matched = categoriesList.find((c) => c.id.toLowerCase() === sel.toLowerCase());
                      setDraftForm({
                        ...draftForm,
                        category: matched ? matched.id : sel,
                        subCategory: matched?.subCategories[0] || "",
                      });
                    }}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Sub-Category *
                  </label>
                  <select
                    value={draftForm.subCategory || ""}
                    onChange={(e) => setDraftForm({ ...draftForm, subCategory: e.target.value })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    {(() => {
                      const matched =
                        categoriesList.find(
                          (c) => c.id.toLowerCase() === (draftForm.category || "").toLowerCase()
                        ) || categoriesList[0];
                      const subs = matched?.subCategories || [];
                      return (
                        <>
                          {subs.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                          {draftForm.subCategory &&
                            !subs.some((s) => s.toLowerCase() === draftForm.subCategory?.toLowerCase()) && (
                              <option value={draftForm.subCategory}>{draftForm.subCategory}</option>
                            )}
                        </>
                      );
                    })()}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Fabric GSM, silhouette fit, embroidery details..."
                  value={draftForm.description}
                  onChange={(e) => setDraftForm({ ...draftForm, description: e.target.value })}
                  className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-black focus:outline-none focus:border-[#E8262A]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAddDraftOpen(false)}
                  className="w-1/3 py-3 rounded-xl border border-neutral-300 text-xs font-bold uppercase text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-2/3 py-3 rounded-xl bg-[#E8262A] hover:bg-[#d01e22] text-white text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-98"
                >
                  {isSaving ? "Saving to Inventory..." : "Save to Inventory (Draft) ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PUBLISH DRAFT TO LIVE SITE */}
      {publishingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/70 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8262A]">
                  Publish to Storefront
                </span>
                <h3 className="text-xl font-black uppercase tracking-wider text-black font-anton mt-0.5">
                  Add Product to Site
                </h3>
                <p className="text-xs text-neutral-500">
                  Select which section and sizes are available for &quot;{publishingProduct.name}&quot;.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPublishingProduct(null)}
                className="text-neutral-400 hover:text-black text-2xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePublishToSite} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                  Target Category *
                </label>
                <select
                  value={
                    categoriesList.find(
                      (c) => c.id.toLowerCase() === (publishForm.category || "").toLowerCase()
                    )?.id || (categoriesList[0]?.id || "Tops")
                  }
                  onChange={(e) => {
                    const sel = e.target.value;
                    const matched = categoriesList.find((c) => c.id.toLowerCase() === sel.toLowerCase());
                    setPublishForm({
                      ...publishForm,
                      category: matched ? matched.id : sel,
                      subCategory: matched?.subCategories[0] || "",
                    });
                  }}
                  className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                >
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SubCategory */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                  Sub-Category Pill *
                </label>
                <select
                  value={publishForm.subCategory || ""}
                  onChange={(e) => setPublishForm({ ...publishForm, subCategory: e.target.value })}
                  className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                >
                  {(() => {
                    const matched =
                      categoriesList.find(
                        (c) => c.id.toLowerCase() === (publishForm.category || "").toLowerCase()
                      ) || categoriesList[0];
                    const subs = matched?.subCategories || [];
                    return (
                      <>
                        {subs.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        {publishForm.subCategory &&
                          !subs.some((s) => s.toLowerCase() === publishForm.subCategory?.toLowerCase()) && (
                            <option value={publishForm.subCategory}>{publishForm.subCategory}</option>
                          )}
                      </>
                    );
                  })()}
                </select>
              </div>

              {/* Available Sizes */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1.5">
                  Available Sizes on Storefront *
                </label>
                <div className="flex gap-2">
                  {ALL_SIZES.map((sz) => {
                    const isSelected = publishForm.sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? publishForm.sizes.filter((s) => s !== sz)
                            : [...publishForm.sizes, sz];
                          setPublishForm({ ...publishForm, sizes: next });
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border transition-all ${
                          isSelected
                            ? "bg-[#E8262A] text-white border-[#E8262A] shadow-xs"
                            : "bg-[#F5F4EE] text-neutral-700 border-neutral-300 hover:border-black"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                  Units in Stock (Quantity)
                </label>
                <input
                  type="number"
                  min={0}
                  value={publishForm.stockQuantity}
                  onChange={(e) => setPublishForm({ ...publishForm, stockQuantity: Number(e.target.value) })}
                  className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                />
                <span className="text-[9px] text-neutral-400 mt-1 block">
                  e.g., Set 5 or 4 to show &quot;Only 5 left&quot; badge to online customers.
                </span>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setPublishingProduct(null)}
                  className="w-1/3 py-3 rounded-xl border border-neutral-300 text-xs font-bold uppercase text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-2/3 py-3 rounded-xl bg-black hover:bg-[#E8262A] text-white text-xs font-black uppercase tracking-widest transition-all shadow-md"
                >
                  {isSaving ? "Publishing..." : "Make Live on Website &rarr;"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: FULL PRODUCT MANAGEMENT (CLICKED PRODUCT) */}
      {activeManageProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/70 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8262A]">
                  Full Garment Control
                </span>
                <h3 className="text-xl font-black uppercase tracking-wider text-black font-anton mt-0.5">
                  Manage Product & Photos
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  ID: {activeManageProduct.id} &bull; Status: {activeManageProduct.visibleOnSite !== false ? "Live on Store" : "Inventory Draft"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveManageProduct(null)}
                className="text-neutral-400 hover:text-black text-2xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveActiveProduct} className="space-y-6">
              {/* Photo Gallery Manager (Multi-Photo) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-neutral-800">
                    Product Photos ({activeManageProduct.images.length} Photos)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveManageProduct({
                        ...activeManageProduct,
                        images: [...activeManageProduct.images, ""],
                      })
                    }
                    className="text-xs font-bold text-[#E8262A] hover:underline uppercase"
                  >
                    + Add Photo Slot
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {activeManageProduct.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="border border-neutral-300 rounded-2xl p-2.5 bg-[#F5F4EE] space-y-2 relative"
                    >
                      <div className="relative aspect-[3/4] bg-neutral-200 rounded-xl overflow-hidden">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                        ) : (
                          <div className="h-full flex items-center justify-center text-[10px] text-neutral-400 font-bold uppercase">
                            No Photo
                          </div>
                        )}
                        <span className="absolute top-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                          {idx === 0 ? "Cover" : `Angle ${idx + 1}`}
                        </span>
                        {activeManageProduct.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveManageProduct({
                                ...activeManageProduct,
                                images: activeManageProduct.images.filter((_, i) => i !== idx),
                              })
                            }
                            className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center"
                            title="Remove Photo"
                          >
                            &times;
                          </button>
                        )}
                      </div>

                      {/* Upload */}
                      <label className="block w-full text-center bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg py-1 text-[9px] font-bold uppercase text-neutral-700 cursor-pointer">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleUploadImageFile(e, (url) => {
                              const next = [...activeManageProduct.images];
                              next[idx] = url;
                              setActiveManageProduct({
                                ...activeManageProduct,
                                images: next,
                              });
                            })
                          }
                        />
                      </label>

                      {/* URL input */}
                      <input
                        type="text"
                        placeholder="Image URL..."
                        value={imgUrl}
                        onChange={(e) => {
                          const next = [...activeManageProduct.images];
                          next[idx] = e.target.value;
                          setActiveManageProduct({
                            ...activeManageProduct,
                            images: next,
                          });
                        }}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2 py-1 text-[10px] text-black"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Title & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={activeManageProduct.name}
                    onChange={(e) =>
                      setActiveManageProduct({ ...activeManageProduct, name: e.target.value })
                    }
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Price (RS.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={activeManageProduct.price}
                    onChange={(e) =>
                      setActiveManageProduct({ ...activeManageProduct, price: Number(e.target.value) })
                    }
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>
              </div>

              {/* Category & SubCategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Category *
                  </label>
                  <select
                    value={
                      categoriesList.find(
                        (c) => c.id.toLowerCase() === (activeManageProduct.category || "").toLowerCase()
                      )?.id || activeManageProduct.category
                    }
                    onChange={(e) => {
                      const sel = e.target.value;
                      const matched = categoriesList.find((c) => c.id.toLowerCase() === sel.toLowerCase());
                      setActiveManageProduct({
                        ...activeManageProduct,
                        category: matched ? matched.id : sel,
                        subCategory: matched?.subCategories[0] || "",
                      });
                    }}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Sub-Category *
                  </label>
                  <select
                    value={activeManageProduct.subCategory || ""}
                    onChange={(e) =>
                      setActiveManageProduct({
                        ...activeManageProduct,
                        subCategory: e.target.value,
                      })
                    }
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    {(() => {
                      const matched =
                        categoriesList.find(
                          (c) => c.id.toLowerCase() === (activeManageProduct.category || "").toLowerCase()
                        ) || categoriesList[0];
                      const subs = matched?.subCategories || [];
                      return (
                        <>
                          {subs.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                          {activeManageProduct.subCategory &&
                            !subs.some((s) => s.toLowerCase() === activeManageProduct.subCategory?.toLowerCase()) && (
                              <option value={activeManageProduct.subCategory}>{activeManageProduct.subCategory}</option>
                            )}
                        </>
                      );
                    })()}
                  </select>
                </div>
              </div>

              {/* Stock Quantity & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Stock Quantity (Units left)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={activeManageProduct.stockQuantity ?? 10}
                    onChange={(e) =>
                      setActiveManageProduct({
                        ...activeManageProduct,
                        stockQuantity: Number(e.target.value),
                        inStock: Number(e.target.value) > 0,
                      })
                    }
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                  <span className="text-[9px] text-neutral-400 mt-1 block">
                    (Shows &quot;Only X left&quot; when &le; 5)
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Storefront Visibility
                  </label>
                  <select
                    value={activeManageProduct.visibleOnSite !== false ? "live" : "draft"}
                    onChange={(e) =>
                      setActiveManageProduct({
                        ...activeManageProduct,
                        visibleOnSite: e.target.value === "live",
                      })
                    }
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    <option value="live">Live on Website</option>
                    <option value="draft">Inventory Draft (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Stock Availability
                  </label>
                  <select
                    value={activeManageProduct.inStock !== false ? "in" : "out"}
                    onChange={(e) =>
                      setActiveManageProduct({
                        ...activeManageProduct,
                        inStock: e.target.value === "in",
                      })
                    }
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  >
                    <option value="in">In Stock</option>
                    <option value="out">Sold Out</option>
                  </select>
                </div>
              </div>

              {/* Sizes Available */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1.5">
                  Available Sizes
                </label>
                <div className="flex gap-2">
                  {ALL_SIZES.map((sz) => {
                    const sizes = activeManageProduct.sizes || ALL_SIZES;
                    const isSelected = sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? sizes.filter((s) => s !== sz)
                            : [...sizes, sz];
                          setActiveManageProduct({ ...activeManageProduct, sizes: next });
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border transition-all ${
                          isSelected
                            ? "bg-[#E8262A] text-white border-[#E8262A]"
                            : "bg-[#F5F4EE] text-neutral-700 border-neutral-300"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={activeManageProduct.description || ""}
                  onChange={(e) =>
                    setActiveManageProduct({ ...activeManageProduct, description: e.target.value })
                  }
                  className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-black focus:outline-none focus:border-[#E8262A]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={(e) => activeManageProduct && handleDeleteProduct(activeManageProduct, e)}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold uppercase text-red-600 transition-colors"
                >
                  🗑️ Delete Product
                </button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveManageProduct(null)}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-neutral-300 text-xs font-bold uppercase text-neutral-700 hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-black hover:bg-[#E8262A] text-white text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-98"
                  >
                    {isSaving ? "Saving..." : "Save Product Changes ✓"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
