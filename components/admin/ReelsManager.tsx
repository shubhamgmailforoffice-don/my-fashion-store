"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ReelItem, defaultReels } from "@/lib/reelsTypes";
import { Product } from "@/lib/data";
import ReelsModal from "@/components/ReelsModal";

interface ReelsManagerProps {
  products: Product[];
}

export default function ReelsManager({ products }: ReelsManagerProps) {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Edit / Add Modal
  const [editingReel, setEditingReel] = useState<ReelItem | null>(null);
  const [isNewReel, setIsNewReel] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // File input ref for quick inline photo replacement
  const inlineFileInputRef = useRef<HTMLInputElement | null>(null);
  const [inlineTargetReelId, setInlineTargetReelId] = useState<string | null>(null);

  // Load reels
  const fetchReels = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reels", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setReels(data);
        } else {
          setReels(defaultReels);
        }
      } else {
        setReels(defaultReels);
      }
    } catch {
      setReels(defaultReels);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  // Save all reels
  const handleSaveAll = async (reelsToSave = reels) => {
    setIsSaving(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reelsToSave),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        window.dispatchEvent(new CustomEvent("reels-updated"));
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to save reels changes.");
      }
    } catch {
      setErrorMessage("Network error while saving reels.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reordering
  const moveReel = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reels.length) return;

    const updated = [...reels];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setReels(updated);
  };

  // Toggle active
  const toggleActive = (id: string) => {
    const updated = reels.map((r) => (r.id === id ? { ...r, active: !r.active } : r));
    setReels(updated);
  };

  // Delete reel
  const handleDeleteReel = (id: string) => {
    if (reels.length <= 1) {
      alert("At least one lookbook reel must remain in catalog.");
      return;
    }
    if (confirm("Are you sure you want to remove this lookbook reel?")) {
      const updated = reels.filter((r) => r.id !== id);
      setReels(updated);
      handleSaveAll(updated);
    }
  };

  // Reset to default presets
  const handleResetDefaults = () => {
    if (confirm("Reset lookbook reels to factory presets? This will restore original 5 streetwear lookbook reels.")) {
      setReels(defaultReels);
      handleSaveAll(defaultReels);
    }
  };

  // Upload image handler
  const handleUploadImage = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        return data.url;
      } else {
        alert(data.error || "Image upload failed");
        return null;
      }
    } catch {
      alert("Network error uploading photo.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Inline quick photo replacement
  const handleInlineFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !inlineTargetReelId) return;

    const uploadedUrl = await handleUploadImage(file);
    if (uploadedUrl) {
      const updated = reels.map((r) =>
        r.id === inlineTargetReelId ? { ...r, image: uploadedUrl } : r
      );
      setReels(updated);
      handleSaveAll(updated);
    }
    e.target.value = "";
    setInlineTargetReelId(null);
  };

  // Save editing reel
  const handleSaveEditingReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReel) return;

    if (!editingReel.image.trim()) {
      alert("Please provide a photo for this reel.");
      return;
    }

    let updated: ReelItem[];
    if (isNewReel) {
      updated = [...reels, { ...editingReel, id: `reel-${Date.now()}` }];
    } else {
      updated = reels.map((r) => (r.id === editingReel.id ? editingReel : r));
    }

    setReels(updated);
    setEditingReel(null);
    setIsNewReel(false);
    handleSaveAll(updated);
  };

  // Linked product auto-filler
  const handleSelectProduct = (productId: string) => {
    if (!editingReel) return;
    const prod = products.find((p) => String(p.id) === String(productId));
    if (prod) {
      setEditingReel({
        ...editingReel,
        productId: String(prod.id),
        name: prod.name.toUpperCase(),
        price: prod.price,
        image: editingReel.image || prod.images?.[0] || "/images/hero-streetwear.jpg",
      });
    } else {
      setEditingReel({
        ...editingReel,
        productId,
      });
    }
  };

  return (
    <div className="space-y-6 font-inter pb-12">
      {/* Hidden File Input for Quick Inline Photo Change */}
      <input
        type="file"
        ref={inlineFileInputRef}
        onChange={handleInlineFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Header & Action Controls */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8262A] block font-inter">
            Mobile & Desktop Showcase Feature
          </span>
          <h2 className="text-2xl font-bold uppercase tracking-wide text-[#2C2A29] font-anton mt-0.5">
            Lookbook Reels Manager
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Edit photos, garment names, prices, and purchase destinations for the floating video/photo Reels launcher.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-50/80 hover:bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 cursor-pointer backdrop-blur-sm"
          >
            <span>🎬 Preview Live Reels</span>
          </button>

          {/* Add Reel Button */}
          <button
            type="button"
            onClick={() => {
              setIsNewReel(true);
              setEditingReel({
                id: `reel-${Date.now()}`,
                name: "NEW STREETWEAR LOOKBOOK REEL",
                price: 4999,
                image: "/images/hero-streetwear.jpg",
                productId: products[0]?.id ? String(products[0].id) : "1",
                active: true,
              });
            }}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 bg-white/70 hover:bg-white text-[#2C2A29] text-xs font-bold uppercase tracking-wider transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
          >
            <span>+ Add New Reel</span>
          </button>

          {/* Save & Publish Changes Button */}
          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#E8262A] hover:bg-[#d01e22] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer border border-red-500/30"
          >
            {isSaving ? "Publishing..." : "Save & Publish Changes"}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-between shadow-lg animate-in fade-in">
          <span>✓ Lookbook Reels published successfully! Changes are live on the storefront immediately.</span>
          <button onClick={() => setSaveSuccess(false)} className="text-lg leading-none cursor-pointer">&times;</button>
        </div>
      )}

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="bg-red-600 text-white px-5 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-between shadow-lg animate-in fade-in">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage("")} className="text-lg leading-none cursor-pointer">&times;</button>
        </div>
      )}

      {/* Reels Grid / Cards List */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h3 className="font-bold text-[#2C2A29] font-anton text-lg uppercase tracking-wide">
              Active Reels Queue ({reels.filter((r) => r.active !== false).length} / {reels.length} Active)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-[11px] font-bold text-neutral-500 hover:text-red-600 uppercase underline transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs font-bold text-neutral-500 uppercase tracking-widest animate-pulse">
            Loading lookbook reels...
          </div>
        ) : reels.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-neutral-300 rounded-2xl space-y-3">
            <p className="text-3xl">🎬</p>
            <h4 className="text-sm font-bold uppercase text-[#2C2A29]">No Lookbook Reels</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Add photos from your latest streetwear drops to show in the Lookbook player.
            </p>
            <button
              onClick={handleResetDefaults}
              className="mt-2 bg-[#2C2A29] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Load Default Reels
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {reels.map((reel, idx) => {
              const linkedProduct = products.find((p) => String(p.id) === String(reel.productId));
              const isActive = reel.active !== false;

              return (
                <div
                  key={reel.id}
                  className={`group relative rounded-2xl overflow-hidden border transition-all flex flex-col justify-between shadow-xs ${
                    isActive
                      ? "bg-white border-white/80 hover:shadow-md"
                      : "bg-neutral-100 border-neutral-300 opacity-60"
                  }`}
                >
                  {/* Card Media Preview (9:16 vertical style) */}
                  <div className="relative aspect-[3/4] w-full bg-[#2C2A29] overflow-hidden">
                    <Image
                      src={reel.image}
                      alt={reel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C2A29]/95 via-transparent to-[#2C2A29]/40 pointer-events-none" />

                    {/* Order Badge & Active Switch */}
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                      <span className="w-6 h-6 rounded-full bg-black/70 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        #{idx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleActive(reel.id)}
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border shadow-2xs backdrop-blur-sm transition-all cursor-pointer ${
                          isActive
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : "bg-neutral-800 text-neutral-300 border-neutral-600"
                        }`}
                        title="Toggle visibility in Reels Player"
                      >
                        {isActive ? "Visible" : "Hidden"}
                      </button>
                    </div>

                    {/* Quick "Change Photo" Overlay Button */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInlineTargetReelId(reel.id);
                          inlineFileInputRef.current?.click();
                        }}
                        className="px-3 py-1.5 rounded-full bg-white text-[#2C2A29] hover:bg-neutral-100 text-[10px] font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
                        title="Upload new image file directly"
                      >
                        📷 Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewReel(false);
                          setEditingReel({ ...reel });
                        }}
                        className="px-3 py-1.5 rounded-full bg-[#E8262A] text-white hover:bg-[#d01e22] text-[10px] font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
                        title="Full edit dialog"
                      >
                        ✏️ Edit
                      </button>
                    </div>

                    {/* Bottom Preview Info inside Media */}
                    <div className="absolute bottom-2.5 inset-x-2.5 z-10 text-left pointer-events-none">
                      <h4 className="text-xs font-bold text-white uppercase font-anton tracking-wide truncate drop-shadow">
                        {reel.name}
                      </h4>
                      <p className="text-[11px] font-bold text-neutral-300">
                        RS. {reel.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Card Controls & Details Below */}
                  <div className="p-3.5 space-y-3 bg-white">
                    {/* Destination Product Badge */}
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 border-b border-neutral-100 pb-2">
                      <span className="font-semibold uppercase tracking-wider">Destination:</span>
                      <span className="font-bold text-[#2C2A29] truncate max-w-[120px]" title={linkedProduct?.name || `ID #${reel.productId}`}>
                        {linkedProduct ? linkedProduct.name : `Product #${reel.productId}`}
                      </span>
                    </div>

                    {/* Reorder and Delete Actions */}
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveReel(idx, "up")}
                          disabled={idx === 0}
                          className="w-7 h-7 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                          title="Move Reel Left/Up"
                        >
                          &larr;
                        </button>
                        <button
                          type="button"
                          onClick={() => moveReel(idx, "down")}
                          disabled={idx === reels.length - 1}
                          className="w-7 h-7 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                          title="Move Reel Right/Down"
                        >
                          &rarr;
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewReel(false);
                            setEditingReel({ ...reel });
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReel(reel.id)}
                          className="w-7 h-7 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                          title="Delete Reel"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT REEL */}
      {/* ========================================================================= */}
      {editingReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-white/80 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8262A]">
                  Lookbook Reel Configuration
                </span>
                <h3 className="text-xl font-bold text-[#2C2A29] font-anton uppercase tracking-wide">
                  {isNewReel ? "Add New Lookbook Reel" : "Edit Lookbook Reel Photo & Details"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingReel(null)}
                className="text-neutral-400 hover:text-black text-2xl font-bold p-1 leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEditingReel} className="space-y-4 text-xs font-inter">
              {/* Photo Preview & Upload Section */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Reel Fullscreen Photo *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                  {/* Thumbnail Preview */}
                  <div className="sm:col-span-4 relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#2C2A29] border border-neutral-300 shadow-md">
                    {editingReel.image ? (
                      <Image
                        src={editingReel.image}
                        alt="Reel Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-neutral-400 text-xs font-bold uppercase">
                        No Image Selected
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold uppercase">
                        Uploading...
                      </div>
                    )}
                  </div>

                  {/* Image Options */}
                  <div className="sm:col-span-8 space-y-3">
                    {/* Option 1: File Upload */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                        1. Upload Image File from Device:
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleUploadImage(file);
                            if (url) {
                              setEditingReel({ ...editingReel, image: url });
                            }
                          }
                          e.target.value = "";
                        }}
                        className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3 py-2 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#2C2A29] file:text-white file:uppercase hover:file:bg-[#E8262A] file:cursor-pointer cursor-pointer"
                      />
                    </div>

                    {/* Option 2: Image URL Input */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                        2. Or Enter Public Image Path / URL:
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="/images/hero-streetwear.jpg or https://..."
                        value={editingReel.image}
                        onChange={(e) => setEditingReel({ ...editingReel, image: e.target.value })}
                        className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-[#2C2A29] focus:outline-none focus:border-[#E8262A]"
                      />
                    </div>

                    {/* Option 3: Choose from Inventory Products */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                        3. Or Pick from Catalog Garments:
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {products.slice(0, 8).map((p) => {
                          const pImg = p.images?.[0];
                          if (!pImg) return null;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setEditingReel({ ...editingReel, image: pImg })}
                              className="relative w-12 h-16 rounded-lg overflow-hidden border border-neutral-300 flex-shrink-0 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                              title={p.name}
                            >
                              <Image src={pImg} alt={p.name} fill className="object-cover" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Garment / Reel Title */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Reel Title / Garment Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BLACK NOCTURNAL HOODIE"
                  value={editingReel.name}
                  onChange={(e) => setEditingReel({ ...editingReel, name: e.target.value.toUpperCase() })}
                  className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase text-[#2C2A29] focus:outline-none focus:border-[#E8262A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Price */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Display Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="4999"
                    value={editingReel.price}
                    onChange={(e) => setEditingReel({ ...editingReel, price: Number(e.target.value) || 0 })}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2C2A29] focus:outline-none focus:border-[#E8262A]"
                  />
                </div>

                {/* Linked Product Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Direct &quot;Shop Now&quot; Link Product *
                  </label>
                  <select
                    value={editingReel.productId}
                    onChange={(e) => handleSelectProduct(e.target.value)}
                    className="w-full bg-[#F5F4EE] border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-bold text-[#2C2A29] focus:outline-none focus:border-[#E8262A]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Toggle Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingReel.active !== false}
                    onChange={(e) => setEditingReel({ ...editingReel, active: e.target.checked })}
                    className="w-4 h-4 text-[#E8262A] accent-[#E8262A] rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[#2C2A29] uppercase tracking-wide">
                    Active (Show in customer Reels player)
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingReel(null)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-[#E8262A] hover:bg-[#d01e22] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Save Reel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIVE REELS PLAYER PREVIEW MODAL */}
      {/* ========================================================================= */}
      <ReelsModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        reels={reels.filter((r) => r.active !== false)}
      />
    </div>
  );
}
