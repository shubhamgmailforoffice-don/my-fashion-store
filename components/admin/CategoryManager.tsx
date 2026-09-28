"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/data";
import {
  ComingSoonData,
  ComingSoonCategoryConfig,
  ComingSoonSubscriber,
  defaultComingSoonConfigs,
} from "@/lib/comingSoonTypes";

interface AccordionCategory {
  id: string;
  name: string;
  subCategories?: string[];
  type?: string;
  colors?: { name: string; palette: string[]; filter: string }[];
  links?: { name: string; href: string }[];
}

interface CategoriesData {
  topNavLinks: { name: string; href: string }[];
  accordions: AccordionCategory[];
  bottomLinks: { name: string; href: string }[];
}

interface CategoryManagerProps {
  products?: Product[];
  onCategoriesUpdated?: () => void;
}

export default function CategoryManager({
  products = [],
  onCategoriesUpdated,
}: CategoryManagerProps) {
  const [data, setData] = useState<CategoriesData | null>(null);
  const [comingSoonData, setComingSoonData] = useState<ComingSoonData>({
    categories: defaultComingSoonConfigs,
    subscribers: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSubCategoryInput, setNewSubCategoryInput] = useState<Record<string, string>>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // Modal States for Coming Soon
  const [editingConfig, setEditingConfig] = useState<ComingSoonCategoryConfig | null>(null);
  const [viewingLeadsCategory, setViewingLeadsCategory] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [copiedLead, setCopiedLead] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [resCat, resComing] = await Promise.all([
        fetch("/api/categories", { cache: "no-store" }),
        fetch("/api/coming-soon", { cache: "no-store" }),
      ]);

      if (resCat.ok) {
        const jsonCat = await resCat.json();
        setData(jsonCat);
      }
      if (resComing.ok) {
        const jsonComing = await resComing.json();
        if (jsonComing && jsonComing.categories) {
          setComingSoonData(jsonComing);
        }
      }
    } catch (e) {
      console.error("Error loading categories & coming soon data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate live product count for a category
  const getProductCount = (catId: string, catName?: string): number => {
    const cLower = catId.toLowerCase();
    const nameLower = (catName || "").toLowerCase();

    return products.filter((p) => {
      const pCat = p.category.toLowerCase();
      const pSub = (p.subCategory || "").toLowerCase();

      if (cLower === "tops" || cLower === "top" || nameLower.includes("top")) {
        return pCat === "tops" || pSub.includes("t-shirt") || pSub.includes("hoodie");
      }
      if (cLower === "bottoms" || cLower === "bottom" || nameLower.includes("bottom")) {
        return pCat === "bottoms" || pSub.includes("cargo") || pSub.includes("pants");
      }
      if (cLower === "accessories" || nameLower.includes("accessories")) {
        return pCat === "accessories" || pSub.includes("bag") || pSub.includes("wallet");
      }
      if (cLower === "special" || nameLower.includes("special")) {
        return pCat === "special";
      }

      return pCat === cLower || pSub === cLower;
    }).length;
  };

  // Toggle Coming Soon Status
  const handleToggleComingSoon = async (
    categoryId: string,
    field: "enabled" | "autoWhenEmpty",
    val: boolean
  ) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/coming-soon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          categoryId,
          field,
          value: val,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setComingSoonData(json.data);
        setSaveMessage(`Updated ${categoryId} Coming Soon mode`);
        setTimeout(() => setSaveMessage(""), 2000);
      }
    } catch (e) {
      alert("Error toggling coming soon: " + String(e));
    } finally {
      setIsSaving(false);
    }
  };

  // Save Full Config for a category
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/coming-soon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_category",
          config: editingConfig,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setComingSoonData(json.data);
        setEditingConfig(null);
        setSaveMessage(`Saved Coming Soon details for ${editingConfig.name}`);
        setTimeout(() => setSaveMessage(""), 2000);
      }
    } catch (e) {
      alert("Error saving config: " + String(e));
    } finally {
      setIsSaving(false);
    }
  };

  // Upload image from PC for Coming Soon banner
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingConfig) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEditingConfig({ ...editingConfig, bannerImage: data.url });
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Image upload error: " + String(err));
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete VIP subscriber
  const handleDeleteSubscriber = async (subscriberId: string) => {
    try {
      const res = await fetch("/api/coming-soon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_subscriber",
          subscriberId,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setComingSoonData(json.data);
      }
    } catch (e) {
      alert("Error deleting subscriber: " + String(e));
    }
  };

  // Subcategory management
  const handleAddSubCategory = async (accordionId: string) => {
    const val = newSubCategoryInput[accordionId]?.trim();
    if (!val) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_subcategory",
          accordionId,
          subCategory: val,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setData(result.data);
        setNewSubCategoryInput((prev) => ({ ...prev, [accordionId]: "" }));
        setSaveMessage(`Added "${val}" to ${accordionId}`);
        setTimeout(() => setSaveMessage(""), 2000);
        window.dispatchEvent(new CustomEvent("driivn_categories_updated", { detail: result.data }));
        onCategoriesUpdated?.();
      }
    } catch (e) {
      alert("Error adding subcategory: " + String(e));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSubCategory = async (accordionId: string, subCategory: string) => {
    if (!confirm(`Are you sure you want to remove "${subCategory}" from the website menu?`)) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_subcategory",
          accordionId,
          subCategory,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setData(result.data);
        setSaveMessage(`Removed "${subCategory}"`);
        setTimeout(() => setSaveMessage(""), 2000);
        window.dispatchEvent(new CustomEvent("driivn_categories_updated", { detail: result.data }));
        onCategoriesUpdated?.();
      }
    } catch (e) {
      alert("Error removing subcategory: " + String(e));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_accordion",
          name: newCategoryName.trim(),
          subCategories: [],
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setData(result.data);
        setNewCategoryName("");
        setSaveMessage(`Created category "${newCategoryName}"`);
        setTimeout(() => setSaveMessage(""), 2000);
        window.dispatchEvent(new CustomEvent("driivn_categories_updated", { detail: result.data }));
        onCategoriesUpdated?.();
      }
    } catch (e) {
      alert("Error creating category: " + String(e));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-neutral-300 text-center">
        <div className="w-8 h-8 border-2 border-[#E8262A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs uppercase font-bold text-neutral-500 tracking-wider">Loading category architecture...</p>
      </div>
    );
  }

  // Categories list for Coming Soon section
  const primaryCategoryKeys = ["Tops", "Bottoms", "Accessories", "Special"];
  const allComingSoonList: ComingSoonCategoryConfig[] = [
    ...primaryCategoryKeys.map((key) => {
      return (
        comingSoonData.categories[key] ||
        defaultComingSoonConfigs[key] || {
          id: key,
          name: key,
          enabled: false,
          autoWhenEmpty: true,
          title: `${key.toUpperCase()} DROP COMING SOON`,
          subtitle: "NEW CAPSULE COLLECTION IN PRODUCTION",
          description: "Our atelier is currently manufacturing pieces for this category. Register below for early VIP access.",
          releaseDate: "DROPPING SHORTLY",
          bannerImage: "/images/hero-streetwear.jpg",
          badge: "PRODUCTION IN PROGRESS",
        }
      );
    }),
  ];

  return (
    <div className="space-y-8 font-inter">
      {/* Header Banner */}
      <div className="bg-white border border-neutral-300 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8262A] block font-inter">
            Garment Structure & Drop Teasers
          </span>
          <h2 className="text-2xl font-black uppercase tracking-wider text-black font-anton mt-0.5">
            Category & Coming Soon Management
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Toggle Coming Soon drop pages for empty categories, manage subcategories, and view VIP notification signups.
          </p>
        </div>

        {saveMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase px-4 py-2 rounded-xl animate-in fade-in">
            ✓ {saveMessage}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: COMING SOON PAGES & VIP LEADS MANAGER */}
      {/* ========================================================================= */}
      <div className="bg-white border border-neutral-300 p-6 rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8262A]" />
              <h3 className="font-black text-black font-anton text-lg uppercase">
                Category &quot;Coming Soon&quot; Drop Pages
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              If a category has 0 products or is in production, enable Coming Soon so customers see a luxury drop teaser instead of an empty screen.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-300 text-neutral-700">
              ⚡ {comingSoonData.subscribers.length} VIP Leads Waiting
            </span>
            <Link
              href="/coming-soon"
              target="_blank"
              className="text-[10px] font-black uppercase tracking-wider text-[#E8262A] hover:underline"
            >
              Preview Live &rarr;
            </Link>
          </div>
        </div>

        {/* Coming Soon Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {allComingSoonList.map((catConfig) => {
            const prodCount = getProductCount(catConfig.id, catConfig.name);
            const isManualOn = catConfig.enabled;
            const isAutoOn = catConfig.autoWhenEmpty && prodCount === 0;
            const isActive = isManualOn || isAutoOn;
            const categorySubscribers = comingSoonData.subscribers.filter(
              (s) =>
                s.category.toLowerCase() === catConfig.id.toLowerCase() ||
                s.category.toLowerCase() === catConfig.name.toLowerCase()
            );

            return (
              <div
                key={catConfig.id}
                className={`border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                  isActive
                    ? "bg-[#FFF9F9] border-[#E8262A]/40 shadow-xs"
                    : "bg-[#F9F8F5] border-neutral-300"
                }`}
              >
                <div className="space-y-3">
                  {/* Category Title & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-black font-anton text-base uppercase">
                        {catConfig.name}
                      </h4>
                      <p className="text-[10px] text-neutral-500 font-bold uppercase">
                        {prodCount === 0 ? (
                          <span className="text-amber-700 font-black">⚠️ 0 Live Products</span>
                        ) : (
                          <span className="text-emerald-700">✓ {prodCount} Live Product{prodCount > 1 ? "s" : ""}</span>
                        )}
                      </p>
                    </div>

                    <span
                      className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isActive
                          ? "bg-[#E8262A] text-white"
                          : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {isActive ? "Coming Soon" : "Catalog Live"}
                    </span>
                  </div>

                  {/* Teaser Preview Box */}
                  <div className="relative h-24 rounded-xl overflow-hidden bg-[#2C2A29] border border-neutral-300">
                    <Image
                      src={catConfig.bannerImage || "/images/hero-streetwear.jpg"}
                      alt={catConfig.name}
                      fill
                      className="object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-2.5 flex flex-col justify-end">
                      <span className="text-[8px] font-black text-[#E8262A] uppercase">
                        {catConfig.badge || "DROPPING SOON"}
                      </span>
                      <p className="text-[11px] font-black text-white uppercase font-anton truncate">
                        {catConfig.title}
                      </p>
                      <p className="text-[8px] text-neutral-300 truncate">
                        {catConfig.releaseDate || "Dropping shortly"}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Controls */}
                  <div className="space-y-2 pt-2 border-t border-neutral-200/80">
                    {/* Manual Force Coming Soon */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold uppercase text-neutral-700">
                        Force Coming Soon:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleComingSoon(catConfig.id, "enabled", !catConfig.enabled)}
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg transition-colors ${
                          catConfig.enabled
                            ? "bg-[#E8262A] text-white"
                            : "bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
                        }`}
                      >
                        {catConfig.enabled ? "ON (Active)" : "OFF"}
                      </button>
                    </div>

                    {/* Auto When Empty */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={catConfig.autoWhenEmpty}
                        onChange={(e) =>
                          handleToggleComingSoon(catConfig.id, "autoWhenEmpty", e.target.checked)
                        }
                        className="rounded border-neutral-300 text-[#E8262A] focus:ring-[#E8262A] w-3.5 h-3.5"
                      />
                      <span className="text-[10px] font-bold text-neutral-600 uppercase">
                        Auto-show if 0 products
                      </span>
                    </label>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-neutral-200/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingConfig({ ...catConfig })}
                    className="flex-1 bg-white hover:bg-neutral-100 text-black border border-neutral-300 text-[10px] font-black uppercase py-1.5 rounded-lg transition-colors text-center"
                  >
                    Edit Teaser
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingLeadsCategory(catConfig.id)}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    title="View VIP customer waitlist"
                  >
                    👤 {categorySubscribers.length}
                  </button>

                  <Link
                    href={`/shop?category=${encodeURIComponent(catConfig.id)}`}
                    target="_blank"
                    className="text-neutral-500 hover:text-black p-1 text-xs"
                    title="Preview category in store"
                  >
                    ↗
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: DRAWER ACCORDIONS & SUBCATEGORIES */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
          <h3 className="font-black text-black font-anton text-lg uppercase">
            Mobile Drawer & Catalog Subcategories
          </h3>
          <span className="text-xs text-neutral-500">
            {data.accordions.length} Category Sections
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.accordions.map((acc) => (
            <div
              key={acc.id}
              className="bg-white border border-neutral-300 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E8262A]" />
                    <h3 className="font-black text-black font-anton text-base uppercase">
                      {acc.name}
                    </h3>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                    {acc.subCategories?.length || acc.colors?.length || acc.links?.length || 0} Options
                  </span>
                </div>

                {/* Subcategories Pills List */}
                {acc.subCategories && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Active Subcategories:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {acc.subCategories.length === 0 ? (
                        <p className="text-xs text-neutral-400 italic">No subcategories yet. Add one below.</p>
                      ) : (
                        acc.subCategories.map((sub) => (
                          <span
                            key={sub}
                            className="inline-flex items-center gap-1.5 bg-[#F5F4EE] hover:bg-neutral-200 text-black border border-neutral-300 rounded-full px-3 py-1 text-xs font-bold transition-colors"
                          >
                            <span>{sub}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubCategory(acc.id, sub)}
                              className="w-4 h-4 rounded-full hover:bg-red-500 hover:text-white flex items-center justify-center text-neutral-400 text-xs font-bold leading-none transition-colors"
                              title={`Remove ${sub}`}
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Color Palette Display */}
                {acc.colors && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Color Palettes:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {acc.colors.map((c) => (
                        <div
                          key={c.name}
                          className="bg-[#F5F4EE] border border-neutral-300 rounded-xl p-2 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-neutral-800 text-[11px]">{c.name}</span>
                          <div className="flex -space-x-1">
                            {c.palette.map((hex, i) => (
                              <span
                                key={i}
                                className="w-3 h-3 rounded-full border border-white shadow-2xs"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links Display */}
                {acc.links && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Support Channels:
                    </p>
                    {acc.links.map((link) => (
                      <div
                        key={link.name}
                        className="text-xs font-bold text-neutral-700 bg-[#F5F4EE] p-2 rounded-lg border border-neutral-200"
                      >
                        {link.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Subcategory Input */}
              {acc.subCategories && (
                <div className="mt-5 pt-4 border-t border-neutral-200">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddSubCategory(acc.id);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder={`Add to ${acc.name}...`}
                      value={newSubCategoryInput[acc.id] || ""}
                      onChange={(e) =>
                        setNewSubCategoryInput((prev) => ({
                          ...prev,
                          [acc.id]: e.target.value,
                        }))
                      }
                      className="flex-1 bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3 py-1.5 text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-[#E8262A]"
                    />
                    <button
                      type="submit"
                      disabled={isSaving || !newSubCategoryInput[acc.id]?.trim()}
                      className="bg-[#E8262A] hover:bg-[#d01e22] disabled:bg-neutral-300 text-white font-black text-xs px-3 py-1.5 rounded-xl uppercase tracking-wider transition-all"
                    >
                      + Add
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}

          {/* Create New Category Card */}
          <div className="bg-white border-2 border-dashed border-neutral-300 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#E8262A]/10 text-[#E8262A] flex items-center justify-center text-2xl font-bold">
              +
            </div>
            <div>
              <h3 className="font-black text-black font-anton text-base uppercase">
                Add New Category
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                Create a custom section (e.g., Headwear, Layering, Leatherwear).
              </p>
            </div>

            <form onSubmit={handleAddNewCategory} className="w-full max-w-xs space-y-2">
              <input
                type="text"
                required
                placeholder="e.g. Headwear / Knitwear"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-black font-bold focus:outline-none focus:border-[#E8262A]"
              />
              <button
                type="submit"
                disabled={isSaving || !newCategoryName.trim()}
                className="w-full bg-[#2C2A29] hover:bg-[#E8262A] disabled:bg-neutral-300 text-white font-black text-xs py-2.5 rounded-xl uppercase tracking-widest transition-all"
              >
                + Create Category
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT COMING SOON TEASER DETAILS */}
      {/* ========================================================================= */}
      {editingConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-neutral-300 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#E8262A]">
                  Configure Drop Teaser
                </span>
                <h3 className="text-xl font-black text-black font-anton uppercase">
                  {editingConfig.name} — Coming Soon Settings
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingConfig(null)}
                className="text-neutral-400 hover:text-black text-2xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs font-inter">
              {/* Drop Title */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Main Headline / Drop Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingConfig.title}
                  onChange={(e) => setEditingConfig({ ...editingConfig, title: e.target.value })}
                  className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Teaser Subtitle
                </label>
                <input
                  type="text"
                  value={editingConfig.subtitle}
                  onChange={(e) => setEditingConfig({ ...editingConfig, subtitle: e.target.value })}
                  className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Teaser Description
                </label>
                <textarea
                  rows={3}
                  value={editingConfig.description}
                  onChange={(e) => setEditingConfig({ ...editingConfig, description: e.target.value })}
                  className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-black focus:outline-none focus:border-[#E8262A]"
                />
              </div>

              {/* Release Date & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Target Drop Date / Window
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mid-October 2026"
                    value={editingConfig.releaseDate}
                    onChange={(e) => setEditingConfig({ ...editingConfig, releaseDate: e.target.value })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Status Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PRODUCTION IN PROGRESS"
                    value={editingConfig.badge}
                    onChange={(e) => setEditingConfig({ ...editingConfig, badge: e.target.value })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>
              </div>

              {/* Banner Image & Upload from PC */}
              <div className="border border-neutral-300 p-4 rounded-xl bg-[#F9F8F5] space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                  Teaser Backdrop Image
                </label>

                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#2C2A29] border border-neutral-300 shrink-0">
                    <Image
                      src={editingConfig.bannerImage || "/images/hero-streetwear.jpg"}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <span className="text-[9px] font-bold text-neutral-500 uppercase block mb-1">
                        Upload Image from PC:
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="text-xs text-neutral-600 file:mr-2 file:py-1 file:px-2.5 file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-[#2C2A29] file:text-white hover:file:bg-[#E8262A] file:cursor-pointer file:rounded-lg"
                      />
                      {uploadingImage && <p className="text-[10px] text-[#E8262A] font-bold mt-1">Uploading...</p>}
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-neutral-500 uppercase block mb-1">
                        Or Image URL:
                      </span>
                      <input
                        type="text"
                        value={editingConfig.bannerImage}
                        onChange={(e) => setEditingConfig({ ...editingConfig, bannerImage: e.target.value })}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-xs text-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingConfig(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold uppercase rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#E8262A] hover:bg-[#d01e22] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-colors"
                >
                  {isSaving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW VIP SUBSCRIBERS FOR CATEGORY */}
      {/* ========================================================================= */}
      {viewingLeadsCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-neutral-300 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#E8262A]">
                  Customer Waitlist
                </span>
                <h3 className="text-lg font-black text-black font-anton uppercase">
                  VIP Drop Leads: {viewingLeadsCategory}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingLeadsCategory(null)}
                className="text-neutral-400 hover:text-black text-2xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>

            {/* List */}
            {comingSoonData.subscribers.filter(
              (s) =>
                s.category.toLowerCase() === viewingLeadsCategory.toLowerCase() ||
                s.category === "All"
            ).length === 0 ? (
              <div className="text-center py-8 border border-dashed border-neutral-200 rounded-2xl">
                <p className="text-xs text-neutral-400 font-bold uppercase">
                  No VIP signups yet for this drop.
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">
                  When visitors submit their email or phone on the Coming Soon page, they appear here.
                </p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {comingSoonData.subscribers
                  .filter(
                    (s) =>
                      s.category.toLowerCase() === viewingLeadsCategory.toLowerCase() ||
                      s.category === "All"
                  )
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-[#F5F4EE] border border-neutral-200 rounded-xl p-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-mono font-bold text-black">{sub.contact}</p>
                        <p className="text-[9px] text-neutral-500 uppercase mt-0.5">
                          Signed up: {new Date(sub.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(sub.contact);
                            setCopiedLead(sub.id);
                            setTimeout(() => setCopiedLead(null), 1500);
                          }}
                          className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100"
                        >
                          {copiedLead === sub.id ? "✓ Copied" : "Copy"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubscriber(sub.id)}
                          className="w-6 h-6 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center font-bold"
                          title="Delete contact"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="pt-2 border-t border-neutral-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingLeadsCategory(null)}
                className="px-5 py-2 bg-[#2C2A29] hover:bg-[#E8262A] text-white text-xs font-black uppercase rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
