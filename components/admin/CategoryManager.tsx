"use client";

import { useState, useEffect } from "react";

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

export default function CategoryManager() {
  const [data, setData] = useState<CategoriesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSubCategoryInput, setNewSubCategoryInput] = useState<Record<string, string>>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Error loading categories:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

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
        <p className="text-xs uppercase font-bold text-neutral-500 tracking-wider">Loading category hierarchy...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-inter">
      {/* Header Banner */}
      <div className="bg-white border border-neutral-300 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8262A] block font-inter">
            Mobile Drawer & Navigation Architecture
          </span>
          <h2 className="text-2xl font-black uppercase tracking-wider text-black font-anton mt-0.5">
            Category & Option Management
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Instantly add, rename, or remove garment categories and subcategories visible in the storefront menu.
          </p>
        </div>

        {saveMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase px-4 py-2 rounded-xl">
            ✓ {saveMessage}
          </div>
        )}
      </div>

      {/* Accordion Categories Grid (Top, Bottom, Accessories, etc.) */}
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

              {/* Color Palette Display for Shop by Color */}
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

              {/* Links display for Support */}
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
              className="w-full bg-black hover:bg-[#E8262A] disabled:bg-neutral-300 text-white font-black text-xs py-2.5 rounded-xl uppercase tracking-widest transition-all"
            >
              + Create Category
            </button>
          </form>
        </div>
      </div>

      {/* Top Special Collections Links Manager */}
      <div className="bg-white border border-neutral-300 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h3 className="font-black text-black font-anton text-lg uppercase">
              Featured Top Navigation Links
            </h3>
            <p className="text-xs text-neutral-500">
              Primary collections displayed at the top of the mobile drawer (Screenshot 7).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.topNavLinks.map((item) => (
            <div
              key={item.name}
              className="bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-black uppercase text-black flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8262A]" />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
