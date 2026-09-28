"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Product } from "@/lib/data";

interface InventoryManagerProps {
  products: Product[];
  onRefresh: () => void;
  onEditProduct?: (product: Product) => void;
}

export default function InventoryManager({
  products,
  onRefresh,
  onEditProduct,
}: InventoryManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Metrics
  const totalCount = products.length;
  const inStockCount = products.filter((p) => p.inStock !== false).length;
  const outOfStockCount = products.filter((p) => p.inStock === false).length;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const isOutOfStock = p.inStock === false;
      if (filterStatus === "in_stock" && isOutOfStock) return false;
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
  const handleToggleStock = async (product: Product) => {
    setUpdatingId(product.id);
    const newInStock = product.inStock === false; // toggle to true, or vice versa
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          inStock: newInStock,
        }),
      });

      if (res.ok) {
        onRefresh();
      } else {
        alert("Failed to update inventory status.");
      }
    } catch (err) {
      alert("Error updating inventory: " + String(err));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 font-inter">
      {/* Top Inventory Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-300 p-5 rounded-2xl shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
            Total Catalogue Pieces
          </p>
          <p className="text-2xl font-black text-black font-anton mt-1">
            {totalCount}
          </p>
          <span className="text-[10px] text-neutral-400 font-bold uppercase mt-1 block">
            Across all categories & drops
          </span>
        </div>

        <div className="bg-white border border-emerald-300 p-5 rounded-2xl shadow-xs bg-emerald-50/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
            Available In Stock
          </p>
          <p className="text-2xl font-black text-emerald-700 font-anton mt-1">
            {inStockCount}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold uppercase mt-1 block">
            Ready for instant customer purchase
          </span>
        </div>

        <div className="bg-white border border-red-300 p-5 rounded-2xl shadow-xs bg-red-50/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#E8262A]">
            Sold Out / Out of Stock
          </p>
          <p className="text-2xl font-black text-[#E8262A] font-anton mt-1">
            {outOfStockCount}
          </p>
          <span className="text-[10px] text-red-500 font-bold uppercase mt-1 block">
            Displaying &quot;Sold Out&quot; badge on storefront
          </span>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white border border-neutral-300 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search piece by name, SKU or category..."
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

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase transition-colors whitespace-nowrap ${
              filterStatus === "all"
                ? "bg-black text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300"
            }`}
          >
            All Pieces ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus("in_stock")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase transition-colors whitespace-nowrap ${
              filterStatus === "in_stock"
                ? "bg-emerald-700 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300"
            }`}
          >
            In Stock ({inStockCount})
          </button>
          <button
            onClick={() => setFilterStatus("out_of_stock")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase transition-colors whitespace-nowrap ${
              filterStatus === "out_of_stock"
                ? "bg-[#E8262A] text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300"
            }`}
          >
            Sold Out ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Interactive Table */}
      <div className="bg-white border border-neutral-300 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F4EE] border-b border-neutral-300 text-[10px] font-black uppercase tracking-wider text-neutral-600">
                <th className="py-3 px-4">Garment</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock Sizes</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Quick Stock Toggle</th>
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
                  const isOutOfStock = p.inStock === false;
                  const isUpdating = updatingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                            <Image
                              src={p.images[0] || "/images/products/oversized-tshirt.jpg"}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-black text-black uppercase font-anton text-sm">
                              {p.name}
                            </p>
                            <span className="text-[10px] font-mono text-neutral-400">
                              ID: {p.id}
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

                      {/* Stock Sizes */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(p.sizes || ["S", "M", "L", "XL", "XXL"]).map((sz) => (
                            <span
                              key={sz}
                              className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-[9px] font-bold text-neutral-700 uppercase"
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-[#E8262A] border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E8262A]" />
                            Sold Out
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Quick Toggle Button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStock(p)}
                          disabled={isUpdating}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 disabled:opacity-50 ${
                            isOutOfStock
                              ? "bg-emerald-700 hover:bg-emerald-600 text-white"
                              : "bg-[#E8262A] hover:bg-[#d01e22] text-white"
                          }`}
                        >
                          {isUpdating
                            ? "Updating..."
                            : isOutOfStock
                            ? "✓ Mark In Stock"
                            : "✕ Mark Sold Out"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
