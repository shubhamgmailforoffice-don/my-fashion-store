"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/lib/data";
import { Order } from "@/lib/store";

const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

export default function AdminDashboardPage() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Image Changer Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: "",
    price: 3999,
    category: "Tops",
    subCategory: "T-Shirts",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    images: ["/images/products/oversized-tshirt.jpg"],
    description: "",
  });

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch("/api/products", { cache: "no-store" }),
      fetch("/api/orders", { cache: "no-store" }),
    ])
      .then(async ([resProd, resOrders]) => {
        if (!isMounted) return;
        if (resProd.ok) {
          const prodData = await resProd.json();
          setProductsList(prodData);
        }
        if (resOrders.ok) {
          const ordersData = await resOrders.json();
          setOrdersList(ordersData);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load admin data:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshData = async () => {
    try {
      const [resProd, resOrders] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
      ]);
      if (resProd.ok) setProductsList(await resProd.json());
      if (resOrders.ok) setOrdersList(await resOrders.json());
    } catch {
      // ignore
    }
  };

  // Quick 1-click toggle product stock
  const handleToggleStock = async (id: string, currentInStock: boolean) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, inStock: !currentInStock }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error("Failed to toggle stock:", err);
    }
  };

  // Handle uploading an image directly from computer
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

      // Update image URL in state
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

  // Save product changes to backend
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
        }, 1200);
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
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

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

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Metrics
  const totalRevenue = ordersList.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-[10px] font-black tracking-[0.3em] text-orange-500 uppercase">
            Live Store Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-white mt-1">
            Store Management Console
          </h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-white text-black hover:bg-orange-500 hover:text-white px-5 py-3 text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
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
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Active Products</p>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{productsList.length}</p>
        </div>
        <div className="bg-[#141414] border border-neutral-800 p-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Database Status</p>
          <p className="text-xs sm:text-sm font-bold text-green-400 mt-2 uppercase">Online & Saved</p>
        </div>
      </div>

      {/* Products & Image Manager Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-baseline border-b border-neutral-800 pb-3">
          <div>
            <h2 className="text-lg font-black uppercase tracking-widest text-white">
              Catalog & Inventory Manager
            </h2>
            <p className="text-xs text-neutral-400">
              Manage stock status, size availability, product photography, and prices.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            {productsList.length} Items Loaded
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-neutral-500 text-xs font-bold uppercase tracking-widest">
            Loading products from database...
          </div>
        ) : (
          <div className="bg-[#121212] border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Available Sizes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {productsList.map((product) => {
                  const isInStock = product.inStock !== false;
                  const prodSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ALL_SIZES;

                  return (
                    <tr key={product.id} className="hover:bg-neutral-800/40 transition-colors">
                      {/* Image preview with quick change indicator */}
                      <td className="py-3 px-4">
                        <div
                          className="relative w-14 h-18 bg-neutral-900 border border-neutral-700 overflow-hidden flex-shrink-0 group cursor-pointer"
                          onClick={() => setEditingProduct({ ...product })}
                        >
                          <Image
                            src={product.images[0] || "/images/products/oversized-tshirt.jpg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[8px] font-bold text-white uppercase text-center">Change</span>
                          </div>
                        </div>
                      </td>

                      {/* Product Name & Description */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-white uppercase tracking-wider">{product.name}</p>
                        <span className="text-[9px] bg-neutral-800 text-neutral-300 px-2 py-0.5 uppercase tracking-widest mt-1 inline-block">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-white tracking-wider whitespace-nowrap">
                        RS. {product.price.toLocaleString()}
                      </td>

                      {/* Stock Status & Quick 1-Click Toggle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-xs ${
                              isInStock
                                ? "bg-green-950/80 text-green-400 border border-green-800"
                                : "bg-red-950/80 text-red-400 border border-red-800"
                            }`}
                          >
                            {isInStock ? "In Stock" : "Out of Stock"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleStock(product.id, isInStock)}
                            className="text-[9px] text-neutral-400 hover:text-white underline uppercase tracking-wider"
                          >
                            Toggle
                          </button>
                        </div>
                      </td>

                      {/* Available Sizes */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {ALL_SIZES.map((sz) => {
                            const isAvailable = prodSizes.includes(sz);
                            return (
                              <span
                                key={sz}
                                className={`text-[8px] font-bold px-1.5 py-0.5 rounded-xs uppercase ${
                                  isAvailable
                                    ? "bg-neutral-800 text-white"
                                    : "bg-neutral-900 text-neutral-600 line-through"
                                }`}
                              >
                                {sz}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setEditingProduct({ ...product })}
                          className="bg-white text-black hover:bg-orange-500 hover:text-white px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors"
                        >
                          Edit / Stock
                        </button>
                        <button
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
        )}
      </section>

      {/* Customer Orders Section */}
      <section id="orders" className="space-y-6 pt-6">
        <div className="flex justify-between items-baseline border-b border-neutral-800 pb-3">
          <div>
            <h2 className="text-lg font-black uppercase tracking-widest text-white">
              Customer Orders & Dispatch
            </h2>
            <p className="text-xs text-neutral-400">
              Track customer orders and update real-time fulfillment status.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            {ordersList.length} Total Orders
          </span>
        </div>

        <div className="bg-[#121212] border border-neutral-800 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact & City</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {ordersList.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-800/30">
                  <td className="py-3 px-4 font-mono font-bold text-orange-400">
                    {order.id}
                    <p className="text-[9px] text-neutral-500 font-sans">{order.date}</p>
                  </td>
                  <td className="py-3 px-4 font-bold text-white uppercase">{order.customerName}</td>
                  <td className="py-3 px-4 text-[10px] text-neutral-400">
                    <p>{order.phone}</p>
                    <p className="line-clamp-1">{order.address}</p>
                  </td>
                  <td className="py-3 px-4">
                    <ul className="text-[10px] text-neutral-300 space-y-0.5 uppercase">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.quantity}x {item.name} ({item.size})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    RS. {order.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="bg-neutral-900 border border-neutral-700 text-[10px] font-bold uppercase tracking-wider text-white px-2 py-1 outline-none cursor-pointer focus:border-orange-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Product & Stock Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#161616] border border-neutral-700 w-full max-w-2xl p-6 sm:p-8 space-y-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[9px] font-black tracking-widest text-orange-500 uppercase">
                  Product & Stock Editor
                </span>
                <h3 className="text-lg font-black tracking-widest uppercase">
                  Edit Details, Stock & Sizes
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
              {/* Image Upload Area */}
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
                    Upload New Image from Computer
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "edit")}
                    className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-white file:text-black hover:file:bg-orange-500 file:cursor-pointer"
                  />
                  {uploadingImage && (
                    <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                      Uploading image to public/images/products/...
                    </p>
                  )}
                  {uploadError && (
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                      {uploadError}
                    </p>
                  )}
                  <p className="text-[9px] text-neutral-500">
                    Current path: {editingProduct.images[0]}
                  </p>
                </div>
              </div>

              {/* Stock Status Selector */}
              <div className="border border-neutral-800 bg-[#121212] p-4 space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-300">
                  Stock Availability Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, inStock: true })}
                    className={`py-3 text-xs font-black uppercase tracking-wider border transition-colors flex items-center justify-center gap-2 ${
                      editingProduct.inStock !== false
                        ? "bg-green-600 border-green-500 text-white font-black"
                        : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span>✓ In Stock (Purchasable)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, inStock: false })}
                    className={`py-3 text-xs font-black uppercase tracking-wider border transition-colors flex items-center justify-center gap-2 ${
                      editingProduct.inStock === false
                        ? "bg-red-600 border-red-500 text-white font-black"
                        : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span>✕ Out of Stock (Sold Out)</span>
                  </button>
                </div>
              </div>

              {/* Available Sizes Multi-Select */}
              <div className="border border-neutral-800 bg-[#121212] p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-300">
                      Available Sizes for Customers
                    </label>
                    <p className="text-[9px] text-neutral-400 uppercase">
                      Select which sizes customers can buy. Unchecked sizes will appear crossed out.
                    </p>
                  </div>
                  <div className="flex gap-2 text-[9px] font-bold uppercase">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProduct({ ...editingProduct, sizes: [...ALL_SIZES] })
                      }
                      className="text-orange-400 hover:underline"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, sizes: [] })}
                      className="text-neutral-500 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {ALL_SIZES.map((sz) => {
                    const currentSizes = editingProduct.sizes || ALL_SIZES;
                    const isChecked = currentSizes.includes(sz);

                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const newSizes = isChecked
                            ? currentSizes.filter((s) => s !== sz)
                            : [...currentSizes, sz];
                          setEditingProduct({ ...editingProduct, sizes: newSizes });
                        }}
                        className={`py-3 text-xs font-black uppercase border transition-all ${
                          isChecked
                            ? "bg-white text-black border-white shadow-sm"
                            : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-700 line-through"
                        }`}
                      >
                        {sz} {isChecked ? "✓" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full bg-[#111] border border-neutral-700 px-3 py-2 text-xs text-white uppercase focus:border-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#111] border border-neutral-700 px-3 py-2 text-xs text-white uppercase focus:border-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Category
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as "Tops" | "Bottoms" | "Special",
                      })
                    }
                    className="w-full bg-[#111] border border-neutral-700 px-3 py-2 text-xs text-white uppercase focus:border-white outline-none cursor-pointer"
                  >
                    <option value="Tops">Tops</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Special">Special / Drops</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Available Colors (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.colors.join(", ")}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        colors: e.target.value.split(",").map((c) => c.trim()),
                      })
                    }
                    className="w-full bg-[#111] border border-neutral-700 px-3 py-2 text-xs text-white uppercase focus:border-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-[#111] border border-neutral-700 px-3 py-2 text-xs text-white uppercase focus:border-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 border border-neutral-700 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-white text-black hover:bg-orange-500 hover:text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-colors"
                >
                  {saveSuccess ? "✓ Saved to Database!" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#161616] border border-neutral-700 w-full max-w-lg p-6 sm:p-8 space-y-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
              <h3 className="text-base font-black tracking-widest uppercase">
                Add New Streetwear Product
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.G. OVERSIZED BOX LOGO TEE"
                  value={newProductForm.name}
                  onChange={(e) =>
                    setNewProductForm({ ...newProductForm, name: e.target.value })
                  }
                  className="w-full bg-[#111] border border-neutral-700 px-3 py-2 text-xs text-white uppercase outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  required
                  value={newProductForm.price}
                  onChange={(e) =>
                    setNewProductForm({
                      ...newProductForm,
                      price: Number(e.target.value),
                    })
                  }
                  className="w-full bg-[#111] border border-neutral-700 px-3 py-2 text-xs text-white uppercase outline-none focus:border-white"
                />
              </div>

              {/* Stock Status in Add Form */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Stock Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewProductForm({ ...newProductForm, inStock: true })}
                    className={`py-2 text-[10px] font-bold uppercase border ${
                      newProductForm.inStock !== false
                        ? "bg-green-600 border-green-500 text-white font-black"
                        : "bg-neutral-900 border-neutral-800 text-neutral-400"
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProductForm({ ...newProductForm, inStock: false })}
                    className={`py-2 text-[10px] font-bold uppercase border ${
                      newProductForm.inStock === false
                        ? "bg-red-600 border-red-500 text-white font-black"
                        : "bg-neutral-900 border-neutral-800 text-neutral-400"
                    }`}
                  >
                    Out of Stock
                  </button>
                </div>
              </div>

              {/* Sizes in Add Form */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Available Sizes
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {ALL_SIZES.map((sz) => {
                    const currentSizes = newProductForm.sizes || ALL_SIZES;
                    const isChecked = currentSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const updated = isChecked
                            ? currentSizes.filter((s) => s !== sz)
                            : [...currentSizes, sz];
                          setNewProductForm({ ...newProductForm, sizes: updated });
                        }}
                        className={`py-1.5 text-[10px] font-bold uppercase border ${
                          isChecked
                            ? "bg-white text-black border-white"
                            : "bg-neutral-900 text-neutral-500 border-neutral-800 line-through"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                  Upload Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "new")}
                  className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-white file:text-black hover:file:bg-orange-500 file:cursor-pointer"
                />
                {uploadingImage && (
                  <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mt-1">
                    Uploading image...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                  Category
                </label>
                <select
                  value={newProductForm.category}
                  onChange={(e) =>
                    setNewProductForm({
                      ...newProductForm,
                      category: e.target.value as "Tops" | "Bottoms" | "Special",
                    })
                  }
                  className="w-full bg-[#111] border border-neutral-700 px-3 py-2 text-xs text-white uppercase outline-none focus:border-white cursor-pointer"
                >
                  <option value="Tops">Tops</option>
                  <option value="Bottoms">Bottoms</option>
                  <option value="Special">Special / Drops</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newProductForm.description}
                  onChange={(e) =>
                    setNewProductForm({
                      ...newProductForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-[#111] border border-neutral-700 px-3 py-2 text-xs text-white uppercase outline-none focus:border-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-neutral-700 text-xs font-bold uppercase tracking-wider text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-white text-black hover:bg-orange-500 hover:text-white px-5 py-2 text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
