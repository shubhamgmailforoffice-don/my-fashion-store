export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: "Tops" | "Bottoms" | "Special" | "Accessories" | string;
  subCategory?: string;
  colors: string[];
  sizes?: string[];
  inStock?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  isBlindBox?: boolean;
  collectionSlug: string;
  description?: string;
  stockQuantity?: number;
  visibleOnSite?: boolean;
}

export interface CollectionInfo {
  slug: string;
  name: string;
  tag: string;
  concept: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface StoreLocation {
  city: string;
  name: string;
  address: string;
  timing: string;
  phone: string;
  status: string;
}

export const products: Product[] = [
  {
    id: "102",
    name: "Black Tiger Bonsai T-Shirt",
    price: 8900,
    originalPrice: 9900,
    images: [
      "/images/streetwear-tiger.jpg",
      "/images/streetwear-tiger.jpg",
    ],
    category: "Tops",
    subCategory: "T-Shirts",
    colors: ["Black", "Orange"],
    sizes: ["S", "M", "L", "XL"],
    isNew: true,
    inStock: true,
    collectionSlug: "racing-club",
    description: "Architectural bonsai branch and prowling tiger back embroidery with metallic Japanese gold threading on 300 GSM cotton.",
  },
  {
    id: "103",
    name: "Silent Rage T-Shirt",
    price: 4900,
    images: [
      "/images/streetwear-tee-1.jpg",
      "/images/streetwear-tee-1.jpg",
    ],
    category: "Tops",
    subCategory: "T-Shirts",
    colors: ["Black", "Red"],
    sizes: ["M", "L", "XL", "XXL"],
    isNew: true,
    inStock: true,
    collectionSlug: "racing-club",
    description: "Subversive tactile screen print with distressed velvet flocking and oversized dropped shoulder silhouette.",
  },
  {
    id: "104",
    name: "Crimson Betta Polo T-Shirt",
    price: 9000,
    images: [
      "/images/streetwear-betta.jpg",
      "/images/streetwear-betta.jpg",
    ],
    category: "Tops",
    subCategory: "T-Shirts",
    colors: ["Black", "Red"],
    sizes: ["S", "M", "L", "XL"],
    isNew: true,
    inStock: true,
    collectionSlug: "winter-collection",
    description: "Knit ribbed collar polo with multi-layer crimson betta fin embroidery cascading across the shoulder and chest.",
  },
  {
    id: "101",
    name: "Purple Dragonfly Navy T-Shirt",
    price: 4700,
    images: [
      "/images/streetwear-dragonfly.jpg",
      "/images/streetwear-dragonfly.jpg",
    ],
    category: "Tops",
    subCategory: "T-Shirts",
    colors: ["Purple", "Navy"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isNew: true,
    inStock: true,
    collectionSlug: "winter-collection",
    description: "Deep violet pigment wash heavyweight tee featuring high-density chenille dragonfly embroidery with metallic accents.",
  },
  {
    id: "105",
    name: "Azura Aquila T-Shirt",
    price: 5800,
    images: [
      "/images/streetwear-tee-2.jpg",
      "/images/streetwear-tee-2.jpg",
    ],
    category: "Tops",
    subCategory: "T-Shirts",
    colors: ["Blue"],
    sizes: ["S", "M", "L", "XL"],
    isNew: false,
    inStock: true,
    collectionSlug: "racing-club",
    description: "Royal cobalt blue base with soaring Aquila wings embroidery rendered in contrasting vermilion script.",
  },
  {
    id: "106",
    name: "Forest Aquila T-Shirt",
    price: 5800,
    images: [
      "/images/streetwear-model-cap.jpg",
      "/images/streetwear-model-cap.jpg",
    ],
    category: "Tops",
    subCategory: "T-Shirts",
    colors: ["Green"],
    sizes: ["M", "L", "XL"],
    isNew: false,
    inStock: true,
    collectionSlug: "racing-club",
    description: "Emerald forest green vintage wash with high-octane bird of prey graphic and tactile raised puff lettering.",
  },
  {
    id: "107",
    name: "Jacquard Card Case",
    price: 7000,
    images: [
      "/images/jacquard-wallet.jpg",
      "/images/jacquard-wallet.jpg",
    ],
    category: "Accessories",
    subCategory: "Wallets",
    colors: ["Black"],
    sizes: ["One Size"],
    isNew: true,
    inStock: true,
    collectionSlug: "essentials",
    description: "Full-grain textured jacquard weave calfskin cardholder with matte black metal DRIIVN atelier hardware.",
  },
  {
    id: "108",
    name: "Nocturnal Leather Messenger Bag",
    price: 14500,
    images: [
      "/images/leather-bag.jpg",
      "/images/leather-bag.jpg",
    ],
    category: "Accessories",
    subCategory: "Bags",
    colors: ["Black"],
    sizes: ["One Size"],
    isNew: false,
    inStock: false, // Matches "Sold Out" in screenshot 2!
    collectionSlug: "essentials",
    description: "Handcrafted pebble-grain leather utility bag with modular straps and multi-pocket compartmentalization.",
  },
  {
    id: "109",
    name: "Tactical Leather Backpack",
    price: 18900,
    images: [
      "/images/leather-backpack.jpg",
      "/images/leather-backpack.jpg",
    ],
    category: "Accessories",
    subCategory: "Bags",
    colors: ["Black"],
    sizes: ["One Size"],
    isNew: true,
    inStock: true,
    collectionSlug: "essentials",
    description: "Architectural bucket backpack engineered with drum-dyed full-grain leather, polished nickel buckles, and reinforced base.",
  },
  {
    id: "1",
    name: "Racing Club Oversized T-Shirt",
    price: 4499,
    originalPrice: 5499,
    images: [
      "/images/products/oversized-tshirt.jpg",
      "/images/products/oversized-tshirt.jpg",
    ],
    category: "Tops",
    subCategory: "T-Shirts",
    colors: ["Black", "Orange"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isNew: true,
    inStock: true,
    collectionSlug: "racing-club",
    description: "High-octane vintage motorsport inspired graphic oversized tee crafted in 280 GSM heavyweight combed cotton.",
  },
  {
    id: "2",
    name: "Black Nocturnal Hoodie",
    price: 6999,
    originalPrice: 7999,
    images: [
      "/images/products/black-nocturnal-hoodie.jpg",
      "/images/products/black-nocturnal-hoodie.jpg",
    ],
    category: "Tops",
    subCategory: "Hoodies",
    colors: ["Black"],
    sizes: ["M", "L", "XL", "XXL"],
    isNew: true,
    inStock: true,
    collectionSlug: "winter-collection",
    description: "Signature 420 GSM French Terry heavyweight boxy hoodie with tonal high-density embossed branding.",
  },
  {
    id: "3",
    name: "Tactical Industrial Cargo Pants",
    price: 5999,
    originalPrice: 6999,
    images: [
      "/images/products/tactical-cargo-pants.jpg",
      "/images/products/tactical-cargo-pants.jpg",
    ],
    category: "Bottoms",
    subCategory: "Cargo Pants",
    colors: ["Grey", "Black"],
    sizes: ["30", "32", "34", "36"],
    isNew: true,
    inStock: true,
    collectionSlug: "essentials",
    description: "Military ripstop relaxed-fit cargos with modular buckle straps, deep utility pockets, and adjustable ankle toggles.",
  },
  {
    id: "4",
    name: "Star Studded Brown Hoodie",
    price: 7499,
    originalPrice: 8499,
    images: [
      "/images/products/star-studded-brown-hoodie.jpg",
      "/images/products/star-studded-brown-hoodie.jpg",
    ],
    category: "Tops",
    subCategory: "Hoodies",
    colors: ["Brown", "Orange"],
    sizes: ["S", "M", "L", "XL"],
    isNew: true,
    isSale: true,
    inStock: true,
    collectionSlug: "winter-collection",
    description: "Rich chocolate brown fleece hoodie featuring premium multi-layer chenille star embroidery and tactile puff prints.",
  },
];

export const collections: CollectionInfo[] = [
  {
    slug: "winter-collection",
    name: "Winter Collection 2025/26",
    tag: "WINTER SHIELD",
    concept: "C.01 / TECHNICAL THERMAL",
    description: "Ultra-heavyweight 420 GSM French Terry layers, fleece hoodies, and structured thermal garments engineered for cold weather.",
    image: "/images/hero-streetwear.jpg",
    itemCount: 4,
  },
  {
    slug: "racing-club",
    name: "DRIIVN Racing Club",
    tag: "SPEEDWAY SERIES",
    concept: "C.02 / GRAPHIC CAPSULE",
    description: "Inspired by vintage motorsport culture. High-octane contrast colorways, speed typography, and dropped-shoulder boxy cuts.",
    image: "/images/streetwear-tiger.jpg",
    itemCount: 4,
  },
  {
    slug: "essentials",
    name: "DRIIVN Basics & Essentials",
    tag: "DAILY UNIFORM",
    concept: "C.03 / PERMANENT LINE",
    description: "Premium daily uniform. Minimal branding, meticulously tailored silhouettes, and rugged long-staple cotton fabrication.",
    image: "/images/leather-bag.jpg",
    itemCount: 3,
  },
  {
    slug: "blind-box",
    name: "Blind Box 26 Series",
    tag: "LIMITED DROP",
    concept: "C.04 / SERIALIZED VAULT",
    description: "Unbox the unexpected. Highly sought-after mystery drop with rare studio samples and numbered collector accessories.",
    image: "/images/products/star-studded-brown-hoodie.jpg",
    itemCount: 1,
  },
];

export const colors = [
  { name: "Black", hex: "#121212" },
  { name: "Purple", hex: "#6B21A8" },
  { name: "Blue", hex: "#1E40AF" },
  { name: "Green", hex: "#15803D" },
  { name: "Red", hex: "#DC2626" },
  { name: "Orange", hex: "#EA580C" },
  { name: "Brown", hex: "#78350F" },
  { name: "Grey", hex: "#4B5563" },
];

export const stores: StoreLocation[] = [
  {
    city: "New Delhi",
    name: "DRIIVN DLF PROMENADE",
    address: "Ground Floor, DLF Promenade Mall, Vasant Kunj, New Delhi - 110070",
    timing: "11:00 AM - 10:00 PM (Mon - Sun)",
    phone: "+91 98100 00001",
    status: "Flagship Store",
  },
  {
    city: "Mumbai",
    name: "DRIIVN KALA GHODA",
    address: "Forbes Street, Kala Ghoda, Fort, Mumbai, Maharashtra - 400001",
    timing: "11:00 AM - 09:30 PM (Mon - Sun)",
    phone: "+91 98200 00002",
    status: "Experience Store",
  },
  {
    city: "Hyderabad",
    name: "DRIIVN BANJARA HILLS",
    address: "Road No. 36, Jubilee Hills / Banjara Hills, Hyderabad, Telangana - 500034",
    timing: "11:30 AM - 10:00 PM (Mon - Sun)",
    phone: "+91 98300 00003",
    status: "Concept Store",
  },
];
