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
    <div className="bg-white min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-8">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-black transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          {/* Column 1: Image Gallery (Takes 7 columns on large screens) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
            {/* Main Active Image */}
            <div className="relative aspect-[3/4] flex-1 bg-gray-50 overflow-hidden border border-gray-100">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />

              {/* Floating Badges */}
              <div className="absolute left-4 top-4 flex flex-col gap-1.5 z-10">
                {isOutOfStock ? (
                  <span className="bg-red-600 px-3 py-1 text-[9px] font-black tracking-widest text-white uppercase shadow-md">
                    Sold Out
                  </span>
                ) : (
                  <>
                    {product.isNew && (
                      <span className="bg-black px-3 py-1 text-[9px] font-black tracking-widest text-white uppercase">
                        New Arrival
                      </span>
                    )}
                    {product.isSale && (
                      <span className="bg-orange-600 px-3 py-1 text-[9px] font-black tracking-widest text-white uppercase">
                        Sale Drop
                      </span>
                    )}
                    {product.isBlindBox && (
                      <span className="bg-blue-600 px-3 py-1 text-[9px] font-black tracking-widest text-white uppercase">
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
                  className={`relative aspect-[3/4] w-20 md:w-full flex-shrink-0 overflow-hidden bg-gray-50 border transition-all ${
                    activeImage === img
                      ? "border-black ring-1 ring-black"
                      : "border-gray-200 hover:border-gray-400"
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
            <div className="border-b border-gray-100 pb-6">
              <span className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase block mb-1">
                BLUORNG COUTURE
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-widest text-black uppercase leading-tight mb-3">
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
              <p className="text-[9px] text-gray-400 tracking-wider mt-1 uppercase">
                INCLUSIVE OF ALL TAXES • COMPLIMENTARY EXPRESS SHIPPING
              </p>
            </div>

            {/* Selector Section */}
            <div className="py-6 space-y-6 border-b border-gray-100">
              {/* Color Selection */}
              <div>
                <h3 className="text-[10px] font-bold tracking-[0.25em] text-gray-900 uppercase mb-3">
                  Select Color: <span className="font-medium text-gray-500">{selectedColor}</span>
                </h3>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`text-[10px] font-bold tracking-widest uppercase px-4 py-2 border transition-all ${
                        selectedColor === color
                          ? "border-black bg-black text-white"
                          : "border-gray-200 hover:border-black text-gray-600 bg-white"
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
                  <h3 className="text-[10px] font-bold tracking-[0.25em] text-gray-900 uppercase">
                    Select Size
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[9px] font-bold tracking-widest text-orange-500 hover:text-black uppercase underline transition-colors"
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
                        className={`relative h-11 flex items-center justify-center text-xs font-bold tracking-wider uppercase border transition-all ${
                          !isAvailable
                            ? "border-gray-200 bg-gray-100/70 text-gray-300 cursor-not-allowed line-through"
                            : selectedSize === size
                            ? "border-black bg-black text-white font-black"
                            : "border-gray-200 hover:border-black text-gray-700 bg-white"
                        }`}
                      >
                        <span>{size}</span>
                        {!isAvailable && (
                          <span className="absolute -top-1.5 -right-1 bg-neutral-700 text-white text-[7px] font-bold px-1 rounded-xs uppercase">
                            Out
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedSize && !isOutOfStock && (
                  <p className="text-[9px] text-zinc-500 font-medium tracking-widest mt-2 uppercase">
                    Selected size {selectedSize}: boxy streetwear fit, drop shoulder silhouette.
                  </p>
                )}
                {isOutOfStock && (
                  <p className="text-[9px] text-red-600 font-bold tracking-widest mt-2 uppercase">
                    Garment is sold out across all sizes.
                  </p>
                )}
              </div>

              {/* Quantity */}
              {!isOutOfStock && (
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.25em] text-gray-900 uppercase mb-3">
                    Quantity
                  </h3>
                  <div className="flex items-center w-28 border border-gray-200">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-9 flex items-center justify-center text-sm font-bold text-gray-500 hover:text-black"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-xs font-bold tracking-widest">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-9 flex items-center justify-center text-sm font-bold text-gray-500 hover:text-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="py-6 space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className={`w-full py-4 text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center ${
                  isOutOfStock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                    : isAdding
                    ? "bg-gray-400 text-white cursor-wait"
                    : addedToCart
                    ? "bg-green-600 text-white"
                    : "bg-black text-white hover:bg-orange-600"
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
                <div className="bg-red-50 border border-red-200 p-3 text-center">
                  <p className="text-[10px] font-bold tracking-widest text-red-700 uppercase">
                    This garment is currently sold out. Check back soon for our next drop!
                  </p>
                </div>
              )}

              {addedToCart && (
                <div className="bg-green-50 border border-green-200 p-3 text-center">
                  <p className="text-[10px] font-bold tracking-widest text-green-800 uppercase">
                    Success! Product added to shopping bag.
                  </p>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="mt-4 space-y-4 border-t border-gray-100 pt-6">
              <div>
                <h4 className="text-[10px] font-bold tracking-[0.25em] text-black uppercase mb-2">
                  Specifications
                </h4>
                <ul className="text-[11px] text-gray-500 space-y-1 tracking-wide uppercase font-medium">
                  <li>
                    <span className="font-bold text-gray-700">Fabric:</span>{" "}
                    {specs.material}
                  </li>
                  <li>
                    <span className="font-bold text-gray-700">Weight:</span>{" "}
                    {specs.weight}
                  </li>
                  <li>
                    <span className="font-bold text-gray-700">Fit:</span>{" "}
                    {specs.fit}
                  </li>
                  <li>
                    <span className="font-bold text-gray-700">Graphics:</span>{" "}
                    {specs.print}
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-bold tracking-[0.25em] text-black uppercase mb-2">
                  Details
                </h4>
                <ul className="text-[11px] text-gray-500 list-disc pl-4 space-y-1 tracking-wide uppercase font-medium">
                  {specs.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-bold tracking-[0.25em] text-black uppercase mb-1">
                  Care Guide
                </h4>
                <p className="text-[11px] text-gray-500 tracking-wide uppercase font-medium">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsSizeGuideOpen(false)}
            />
            <div className="relative bg-white max-w-lg w-full p-6 sm:p-8 z-10 shadow-2xl border border-gray-200 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[9px] font-black tracking-widest text-orange-500 uppercase">
                    BLUORNG MEASUREMENT TABLE
                  </span>
                  <h3 className="text-base font-black tracking-widest uppercase">
                    Oversized Fit Guide (Inches)
                  </h3>
                </div>
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="text-gray-400 hover:text-black text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[10px] uppercase font-bold tracking-wider text-left border border-gray-200">
                  <thead className="bg-zinc-100 border-b border-gray-200 text-black">
                    <tr>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Chest</th>
                      <th className="py-2.5 px-3">Length</th>
                      <th className="py-2.5 px-3">Shoulder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
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

              <p className="text-[9px] text-gray-500 uppercase tracking-widest">
                *All garments are designed with a boxy silhouette and dropped shoulders. For a more fitted look, consider sizing down.
              </p>

              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="w-full bg-black text-white py-3 text-xs font-bold tracking-widest uppercase hover:bg-orange-600 transition-colors"
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
