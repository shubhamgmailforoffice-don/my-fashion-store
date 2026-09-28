"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

interface ProductDetailsClientProps {
  product: Product;
  allProducts?: Product[];
}

interface CartStorageItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export default function ProductDetailsClient({ product, allProducts }: ProductDetailsClientProps) {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const isOutOfStock = product.inStock === false;
  const availableSizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : ["S", "M", "L", "XL", "XXL"];

  // Recommendations: exclude current product
  const productPool = allProducts && allProducts.length > 0 ? allProducts : products;
  const recommendations = productPool
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  // Get customized streetwear specs based on the product type
  const getProductSpecs = () => {
    const name = product.name.toUpperCase();
    if (name.includes("T-SHIRT")) {
      return {
        material: "100% COMBED FRENCH TERRY COTTON",
        weight: "280 GSM HEAVYWEIGHT FABRIC",
        fit: "BOXY, OVERSIZED SILHOUETTE WITH DROPPED SHOULDERS",
        print: "HIGH-DENSITY EMBOSSED GRAPHIC SCREEN PRINT",
        care: "COLD MACHINE WASH INSIDE OUT. DO NOT IRON ON PRINT.",
        details: [
          "Preshrunk to minimize shrinkage",
          "Thick 1.2-inch ribbed collar",
          "Double-needle stitched shoulders, armholes, cuffs, and hem",
          "Signature rubberized branding patch on back neck",
        ],
      };
    } else if (name.includes("HOODIE")) {
      return {
        material: "80% ORGANIC COTTON, 20% RECYCLED POLYESTER FLEECE",
        weight: "420 GSM SUPER-HEAVYWEIGHT PREMIUM FLEECE",
        fit: "OVERSIZED ULTRA-BOXY COMFORT FIT",
        print: "PREMIUM CHENILLE EMBROIDERY & PUFF PRINT ON CHEST",
        care: "HAND WASH RECOMMENDED. DRY FLAT. DO NOT TUMBLE DRY.",
        details: [
          "Double-lined hood without drawstrings for minimal, clean aesthetic",
          "Kangaroo front pouch pocket with reinforced stitching",
          "Heavy ribbed cuffs and waistband for secure fit",
          "Drop shoulder pattern with premium coverseaming",
        ],
      };
    } else if (name.includes("PANTS") || name.includes("CARGO")) {
      return {
        material: "100% DURABLE RIPSTOP MILITARY-GRADE COTTON",
        weight: "320 GSM MID-HEAVY RUGGED FABRIC",
        fit: "RELAXED WIDE-LEG FIT WITH ADJUSTABLE HEM TOGGLES",
        print: "TONAL HIGH-DENSITY RUNNING BRAND LOGO PRINT",
        care: "MACHINE WASH COLD WITH LIKE COLORS. HANG DRY.",
        details: [
          "6-pocket tactical design including deep side cargo pockets",
          "Articulated knees for unrestricted movement and structure",
          "Premium YKK zipper fly with heavy-duty metal button closure",
          "Adjustable drawcords at waist and ankle openings",
        ],
      };
    } else {
      return {
        material: "100% PREMIUM COTTON SHIRTING / SPECIAL ARCHIVE BLEND",
        weight: "300 GSM PREMIUM FABRIC WEIGHT",
        fit: "STREETWEAR SILHOUETTE, TRUE TO SIZE FOR OVERSIZED DRAPE",
        print: "LIMITED EDITION SERIALIZED BRANDING",
        care: "DRY CLEAN OR DELICATE COLD MACHINE WASH.",
        details: [
          "Exclusive collection-specific woven brand labels",
          "Reinforced side seams with high-tensile strength thread",
          "Premium custom hardware details throughout",
          "Comes in custom collection dustbag and collectible box",
        ],
      };
    }
  };

  const specs = getProductSpecs();

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("PLEASE SELECT A SIZE BEFORE ADDING TO BAG.");
      return;
    }

    setIsAdding(true);

    setTimeout(() => {
      // Save item to local storage cart
      const currentCart: CartStorageItem[] = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      const cartItem: CartStorageItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
      };

      // Check if item with same ID and size exists
      const existingItemIndex = currentCart.findIndex(
        (item: CartStorageItem) =>
          item.id === product.id && item.size === selectedSize
      );

      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += quantity;
      } else {
        currentCart.push(cartItem);
      }

      localStorage.setItem("cart", JSON.stringify(currentCart));

      // Dispatch storage update event for Navbar listener
      window.dispatchEvent(new Event("cart-updated"));

      setIsAdding(false);
      setAddedToCart(true);

      // Auto-hide success message after 4 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 4000);
    }, 400);
  };

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-8">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-black transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-black font-extrabold">{product.name}</span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          {/* Column 1: Image Gallery (Takes 7 columns on large screens) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
            {/* Main Active Image */}
            <div className="relative aspect-[3/4] flex-1 bg-neutral-900 rounded-3xl overflow-hidden border border-white/80 shadow-md">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />

              {/* Floating Badges with Frosted Glass */}
              <div className="absolute left-4 top-4 flex flex-col gap-1.5 z-10">
                {isOutOfStock ? (
                  <span className="bg-white/85 text-black border border-white/70 backdrop-blur-md px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded-full shadow-xs">
                    Sold Out
                  </span>
                ) : (
                  <>
                    {product.isNew && (
                      <span className="bg-black/80 text-white border border-white/20 backdrop-blur-md px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded-full shadow-xs">
                        New Arrival
                      </span>
                    )}
                    {product.isSale && (
                      <span className="bg-[#E8262A]/90 text-white border border-white/20 backdrop-blur-md px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded-full shadow-xs">
                        Sale Drop
                      </span>
                    )}
                    {product.isBlindBox && (
                      <span className="bg-blue-600/90 text-white border border-white/20 backdrop-blur-md px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded-full shadow-xs">
                        Mystery Box
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Selectors */}
            <div className="flex md:flex-col gap-3 md:w-24 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-[3/4] w-20 md:w-full flex-shrink-0 rounded-2xl overflow-hidden bg-neutral-900 border transition-all ${
                    activeImage === img
                      ? "border-black ring-2 ring-black shadow-md scale-102"
                      : "border-white/80 hover:border-black shadow-2xs opacity-80 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} gallery ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Details & Purchase Options (Takes 5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="border-b border-black/5 pb-6">
              <span className="text-[10px] font-black tracking-[0.3em] text-[#E8262A] uppercase block mb-1">
                DRIIVN COUTURE
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-normal text-black leading-tight mb-3">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-lg font-black tracking-widest text-black">
                  RS. {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm font-bold tracking-widest text-gray-400 line-through">
                    RS. {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full mt-2.5 backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-[#E8262A] animate-ping" />
                  <span className="text-[11px] font-black text-[#E8262A] uppercase tracking-wider">
                    Hurry! Only {product.stockQuantity} left in stock
                  </span>
                </div>
              )}
              <p className="text-[9px] text-neutral-500 tracking-wider mt-1.5 uppercase font-medium">
                INCLUSIVE OF ALL TAXES • COMPLIMENTARY EXPRESS SHIPPING
              </p>
            </div>

            {/* Selector Section */}
            <div className="py-6 space-y-6 border-b border-black/5">
              {/* Color Selection */}
              <div>
                <h3 className="text-[10px] font-bold tracking-[0.25em] text-neutral-800 uppercase mb-3">
                  Select Color: <span className="font-semibold text-black">{selectedColor}</span>
                </h3>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-xl transition-all ${
                        selectedColor === color
                          ? "border border-black bg-black text-white shadow-xs"
                          : "border border-white/80 hover:border-black text-neutral-700 bg-white/70 hover:bg-white backdrop-blur-xs shadow-2xs"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[10px] font-bold tracking-[0.25em] text-neutral-800 uppercase">
                    Select Size
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[9px] font-black tracking-widest text-[#E8262A] hover:text-black uppercase underline transition-colors"
                  >
                    Sizing Guide
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {["S", "M", "L", "XL", "XXL"].map((size) => {
                    const isAvailable = availableSizes.includes(size) && !isOutOfStock;
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        className={`relative h-11 flex items-center justify-center text-xs font-black tracking-wider uppercase rounded-xl transition-all ${
                          !isAvailable
                            ? "border border-black/5 bg-black/5 text-neutral-400 cursor-not-allowed line-through backdrop-blur-2xs"
                            : selectedSize === size
                            ? "border border-black bg-black text-white shadow-xs scale-102"
                            : "border border-white/80 hover:border-black text-neutral-800 bg-white/70 hover:bg-white backdrop-blur-xs shadow-2xs"
                        }`}
                      >
                        <span>{size}</span>
                        {!isAvailable && (
                          <span className="absolute -top-1.5 -right-1 bg-neutral-800 text-white text-[7px] font-bold px-1 rounded-xs uppercase">
                            Out
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedSize && !isOutOfStock && (
                  <p className="text-[9px] text-neutral-500 font-medium tracking-widest mt-2.5 uppercase">
                    Selected size {selectedSize}: boxy streetwear fit, drop shoulder silhouette.
                  </p>
                )}
                {isOutOfStock && (
                  <p className="text-[9px] text-[#E8262A] font-bold tracking-widest mt-2.5 uppercase">
                    Garment is sold out across all sizes.
                  </p>
                )}
              </div>

              {/* Quantity */}
              {!isOutOfStock && (
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.25em] text-neutral-800 uppercase mb-3">
                    Quantity
                  </h3>
                  <div className="flex items-center w-32 bg-white/70 backdrop-blur-md border border-white/80 rounded-xl overflow-hidden shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-sm font-black text-neutral-600 hover:text-black hover:bg-white/80 transition-colors"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-xs font-black tracking-widest text-black">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-sm font-black text-neutral-600 hover:text-black hover:bg-white/80 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {/* Action Buttons */}
            <div className="py-6 space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className={`w-full py-4 text-xs font-black tracking-[0.2em] uppercase rounded-xl transition-all duration-300 flex items-center justify-center shadow-md ${
                  isOutOfStock
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed border border-neutral-300"
                    : isAdding
                    ? "bg-neutral-400 text-white cursor-wait"
                    : addedToCart
                    ? "bg-emerald-600 text-white"
                    : "bg-black text-white hover:bg-[#E8262A] active:scale-[0.99]"
                }`}
              >
                {isOutOfStock
                  ? "Sold Out / Out of Stock"
                  : isAdding
                  ? "Adding to Bag..."
                  : addedToCart
                  ? "✓ Added to Bag"
                  : "Add to Bag"}
              </button>

              {isOutOfStock && (
                <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xs p-3.5 rounded-xl text-center">
                  <p className="text-[10px] font-black tracking-widest text-[#E8262A] uppercase">
                    This garment is currently sold out. Check back soon for our next drop!
                  </p>
                </div>
              )}

              {addedToCart && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xs p-3.5 rounded-xl text-center">
                  <p className="text-[10px] font-black tracking-widest text-emerald-800 uppercase">
                    Success! Product added to shopping bag.
                  </p>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="mt-2 space-y-4 border border-white/80 bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-xs">
              <div>
                <h4 className="text-[10px] font-black tracking-[0.25em] text-black uppercase mb-2">
                  Specifications
                </h4>
                <ul className="text-[11px] text-neutral-600 space-y-1.5 tracking-wide uppercase font-medium">
                  <li>
                    <span className="font-black text-neutral-800">Fabric:</span>{" "}
                    {specs.material}
                  </li>
                  <li>
                    <span className="font-black text-neutral-800">Weight:</span>{" "}
                    {specs.weight}
                  </li>
                  <li>
                    <span className="font-black text-neutral-800">Fit:</span>{" "}
                    {specs.fit}
                  </li>
                  <li>
                    <span className="font-black text-neutral-800">Graphics:</span>{" "}
                    {specs.print}
                  </li>
                </ul>
              </div>

              <div className="border-t border-black/5 pt-4">
                <h4 className="text-[10px] font-black tracking-[0.25em] text-black uppercase mb-2">
                  Details
                </h4>
                <ul className="text-[11px] text-neutral-600 list-disc pl-4 space-y-1.5 tracking-wide uppercase font-medium">
                  {specs.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-black/5 pt-4">
                <h4 className="text-[10px] font-black tracking-[0.25em] text-black uppercase mb-1">
                  Care Guide
                </h4>
                <p className="text-[11px] text-neutral-600 tracking-wide uppercase font-medium">
                  {specs.care}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sizing Guide Modal */}
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
              onClick={() => setIsSizeGuideOpen(false)}
            />
            <div className="relative bg-white/95 backdrop-blur-2xl max-w-lg w-full p-6 sm:p-8 z-10 shadow-2xl rounded-3xl border border-white/80 space-y-6">
              <div className="flex justify-between items-center border-b border-black/5 pb-4">
                <div>
                  <span className="text-[9px] font-black tracking-widest text-[#E8262A] uppercase">
                    DRIIVN MEASUREMENT TABLE
                  </span>
                  <h3 className="text-base font-black tracking-widest uppercase">
                    Oversized Fit Guide (Inches)
                  </h3>
                </div>
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="w-8 h-8 rounded-full bg-black/5 hover:bg-black hover:text-white flex items-center justify-center text-lg font-bold transition-colors"
                >
                  &times;
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-black/10">
                <table className="w-full text-[10px] uppercase font-bold tracking-wider text-left">
                  <thead className="bg-black/5 border-b border-black/10 text-black">
                    <tr>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Chest</th>
                      <th className="py-2.5 px-3">Length</th>
                      <th className="py-2.5 px-3">Shoulder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    <tr>
                      <td className="py-2.5 px-3 font-black">S</td>
                      <td className="py-2.5 px-3">44&quot;</td>
                      <td className="py-2.5 px-3">28.5&quot;</td>
                      <td className="py-2.5 px-3">21&quot;</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-black">M</td>
                      <td className="py-2.5 px-3">46&quot;</td>
                      <td className="py-2.5 px-3">29.5&quot;</td>
                      <td className="py-2.5 px-3">22&quot;</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-black">L</td>
                      <td className="py-2.5 px-3">48&quot;</td>
                      <td className="py-2.5 px-3">30.5&quot;</td>
                      <td className="py-2.5 px-3">23&quot;</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-black">XL</td>
                      <td className="py-2.5 px-3">50&quot;</td>
                      <td className="py-2.5 px-3">31.5&quot;</td>
                      <td className="py-2.5 px-3">24&quot;</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-black">XXL</td>
                      <td className="py-2.5 px-3">52&quot;</td>
                      <td className="py-2.5 px-3">32.5&quot;</td>
                      <td className="py-2.5 px-3">25&quot;</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-medium">
                *All garments are designed with a boxy silhouette and dropped shoulders. For a more fitted look, consider sizing down.
              </p>

              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="w-full bg-black text-white py-3.5 text-xs font-black tracking-widest uppercase hover:bg-[#E8262A] transition-colors rounded-xl shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        )}

        {/* You May Also Like Section */}
        {recommendations.length > 0 && (
          <section className="mt-24 pt-16 border-t border-gray-100">
            <div className="mb-12">
              <p className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase mb-2">
                Exclusive Drops
              </p>
              <h2 className="text-3xl font-black tracking-tighter text-black uppercase">
                You May Also Like
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-8">
              {recommendations.map((rec) => (
                <ProductCard key={rec.id} product={rec} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
