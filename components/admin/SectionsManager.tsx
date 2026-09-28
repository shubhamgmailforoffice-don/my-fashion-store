"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/lib/data";
import { HomepageSection } from "@/lib/sections";

interface SectionsManagerProps {
  products: Product[];
}

export default function SectionsManager({ products }: SectionsManagerProps) {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New section form state
  const [newSection, setNewSection] = useState<Partial<HomepageSection>>({
    id: "",
    title: "",
    subtitle: "",
    enabled: true,
    type: "grid",
    actionButton: {
      label: "Discover more",
      href: "/shop",
    },
    productIds: [],
  });

  // Load sections from /api/sections
  const loadSections = async () => {
    try {
      const res = await fetch("/api/sections", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSections(data);
      }
    } catch (err) {
      console.error("Failed to load sections:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  // Save sections to backend
  const handleSaveAll = async (updatedList?: HomepageSection[]) => {
    const listToSave = updatedList || sections;
    setIsSaving(true);
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listToSave),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        alert("Failed to save sections.");
      }
    } catch (err) {
      alert("Error saving sections: " + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Section Visibility
  const handleToggleEnable = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Update Section text field
  const handleUpdateField = (
    sectionId: string,
    field: "title" | "subtitle",
    value: string
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s))
    );
  };

  // Update Action Button
  const handleUpdateButton = (
    sectionId: string,
    key: "label" | "href",
    value: string
  ) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              actionButton: {
                label: s.actionButton?.label || "Discover more",
                href: s.actionButton?.href || "/shop",
                [key]: value,
              },
            }
          : s
      )
    );
  };

  // Add Product to Section
  const handleAddProductToSection = (sectionId: string, productId: string) => {
    if (!productId) return;
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const currentIds = s.productIds || [];
        if (currentIds.includes(productId)) return s;
        return {
          ...s,
          productIds: [...currentIds, productId],
        };
      })
    );
  };

  // Remove Product from Section
  const handleRemoveProductFromSection = (sectionId: string, productId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          productIds: (s.productIds || []).filter((id) => id !== productId),
        };
      })
    );
  };

  // Delete an entire section
  const handleDeleteSection = (sectionId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the "${title}" section from the homepage?`)) {
      return;
    }
    const updated = sections.filter((s) => s.id !== sectionId);
    setSections(updated);
    handleSaveAll(updated);
  };

  // Create a brand new section
  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSection.title) return;

    const created: HomepageSection = {
      id: `section-${Date.now()}`,
      title: newSection.title,
      subtitle: newSection.subtitle || "",
      enabled: true,
      type: newSection.type || "grid",
      actionButton: {
        label: newSection.actionButton?.label || "Discover more",
        href: newSection.actionButton?.href || "/shop",
      },
      productIds: newSection.productIds || [],
    };

    const updated = [...sections, created];
    setSections(updated);
    setIsAddModalOpen(false);
    handleSaveAll(updated);

    // reset
    setNewSection({
      title: "",
      subtitle: "",
      type: "grid",
      actionButton: { label: "Discover more", href: "/shop" },
      productIds: [],
    });
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs font-bold text-neutral-500 uppercase">
        Loading Storefront Sections...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-inter">
      {/* Top Header & Save Actions */}
      <div className="bg-white border border-neutral-300 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8262A] block">
            Storefront Sections & Showcase
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-black font-anton uppercase mt-0.5">
            Homepage Options Manager
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Enable, disable, rename, or reorder options like Headwear & Layering, DRIIVN Bags, or add custom drops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider transition-colors active:scale-95"
          >
            + Add New Section
          </button>

          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#E8262A] hover:bg-[#d01e22] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isSaving ? "Publishing..." : "Save & Publish Changes"}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-md">
          <span>✓ Homepage sections published successfully! Changes are live.</span>
          <button onClick={() => setSaveSuccess(false)}>&times;</button>
        </div>
      )}

      {/* Sections List Cards */}
      <div className="space-y-6">
        {sections.map((section, idx) => {
          const sectionProductList = (section.productIds || [])
            .map((id) => products.find((p) => String(p.id) === String(id)))
            .filter(Boolean) as Product[];

          return (
            <div
              key={section.id}
              className={`bg-white border rounded-2xl p-6 shadow-xs transition-all ${
                section.enabled
                  ? "border-neutral-300"
                  : "border-neutral-200 opacity-60 bg-neutral-50"
              }`}
            >
              {/* Section Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-black text-black">
                    0{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-black text-black font-anton uppercase">
                      {section.title || "Untitled Section"}
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Type: {section.type.toUpperCase()} &bull; ID: {section.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Enabled / Disabled Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer bg-[#F5F4EE] px-3 py-1.5 rounded-full border border-neutral-300">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={() => handleToggleEnable(section.id)}
                      className="w-4 h-4 accent-[#E8262A] rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-neutral-800 uppercase">
                      {section.enabled ? "Visible on Storefront" : "Hidden"}
                    </span>
                  </label>

                  {/* Delete Section Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(section.id, section.title)}
                    className="p-1.5 text-neutral-400 hover:text-[#E8262A] transition-colors"
                    title="Remove Section"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Editable Information Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1">
                    Section Name / Title *
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      handleUpdateField(section.id, "title", e.target.value)
                    }
                    placeholder="e.g. DRIIVN Bags"
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={section.subtitle || ""}
                    onChange={(e) =>
                      handleUpdateField(section.id, "subtitle", e.target.value)
                    }
                    placeholder="e.g. Architectural Series"
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={section.actionButton?.label || ""}
                    onChange={(e) =>
                      handleUpdateButton(section.id, "label", e.target.value)
                    }
                    placeholder="e.g. Discover more"
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1">
                    Button Link URL
                  </label>
                  <input
                    type="text"
                    value={section.actionButton?.href || ""}
                    onChange={(e) =>
                      handleUpdateButton(section.id, "href", e.target.value)
                    }
                    placeholder="e.g. /shop"
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-[#E8262A]"
                  />
                </div>
              </div>

              {/* Products in this Section */}
              <div className="pt-3 border-t border-neutral-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-700">
                    Garments Displayed in this Section ({sectionProductList.length})
                  </span>

                  {/* Add Product Dropdown */}
                  <div className="flex items-center gap-2">
                    <select
                      onChange={(e) => {
                        handleAddProductToSection(section.id, e.target.value);
                        e.target.value = "";
                      }}
                      className="bg-[#F5F4EE] border border-neutral-300 rounded-lg px-2.5 py-1 text-xs font-bold text-black"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        + Add Piece to Section...
                      </option>
                      {products
                        .filter(
                          (p) => !(section.productIds || []).includes(p.id)
                        )
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (RS. {p.price})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Products Thumbnails Row */}
                {sectionProductList.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic py-2">
                    No products selected. Showing automatic category drops.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {sectionProductList.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center gap-2 bg-[#F5F4EE] border border-neutral-300 px-3 py-1.5 rounded-xl shadow-2xs group"
                      >
                        <div className="relative w-7 h-8 rounded overflow-hidden bg-neutral-200 flex-shrink-0">
                          <Image
                            src={prod.images[0]}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-black truncate max-w-[140px]">
                            {prod.name}
                          </p>
                          <p className="text-[9px] text-neutral-500 font-mono">
                            RS. {prod.price}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveProductFromSection(section.id, prod.id)
                          }
                          className="text-neutral-400 hover:text-[#E8262A] text-sm ml-1 p-0.5 leading-none"
                          title="Remove product from this section"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add New Custom Section */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-neutral-300 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#E8262A]">
                  New Showcase
                </span>
                <h3 className="text-lg font-black uppercase text-black font-anton">
                  Add Homepage Section
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-black text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                  Section Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Fleece Drop, Exclusive Cargo Pants"
                  value={newSection.title}
                  onChange={(e) =>
                    setNewSection({ ...newSection, title: e.target.value })
                  }
                  className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold text-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Limited Atelier Pieces"
                  value={newSection.subtitle || ""}
                  onChange={(e) =>
                    setNewSection({ ...newSection, subtitle: e.target.value })
                  }
                  className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Display Layout
                  </label>
                  <select
                    value={newSection.type}
                    onChange={(e) =>
                      setNewSection({
                        ...newSection,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-bold text-black"
                  >
                    <option value="grid">2-Column / 4-Column Grid</option>
                    <option value="carousel">Horizontal Scroll Reel</option>
                    <option value="lookbook">Editorial Model Lookbook</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={newSection.actionButton?.label}
                    onChange={(e) =>
                      setNewSection({
                        ...newSection,
                        actionButton: {
                          label: e.target.value,
                          href: newSection.actionButton?.href || "/shop",
                        },
                      })
                    }
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                  Select Initial Products
                </label>
                <div className="max-h-40 overflow-y-auto border border-neutral-300 rounded-xl p-2 space-y-1 bg-[#F5F4EE]">
                  {products.map((p) => {
                    const isSelected = (newSection.productIds || []).includes(
                      p.id
                    );
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg text-xs cursor-pointer font-bold"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const cur = newSection.productIds || [];
                            if (e.target.checked) {
                              setNewSection({
                                ...newSection,
                                productIds: [...cur, p.id],
                              });
                            } else {
                              setNewSection({
                                ...newSection,
                                productIds: cur.filter((id) => id !== p.id),
                              });
                            }
                          }}
                          className="w-4 h-4 accent-[#E8262A] rounded"
                        />
                        <span>
                          {p.name} (RS. {p.price})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E8262A] hover:bg-[#d01e22] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md"
                >
                  Create &amp; Publish Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
