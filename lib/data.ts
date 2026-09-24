export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: "Tops" | "Bottoms" | "Special" | "Accessories";
  subCategory?: "T-Shirts" | "Hoodies" | "Cargo Pants" | "Joggers" | "Mystery Box";
  colors: string[];
  sizes?: string[];
  inStock?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  isBlindBox?: boolean;
  collectionSlug: string;
  description?: string;
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
    id: "1",
    name: "RACING CLUB OVERSIZED T-SHIRT",
    price: 4499,
    originalPrice: 5499,
    images: [
      "/images/products/oversized-tshirt.jpg",
      "/images/products/oversized-tshirt.jpg",
    ],
    category: "Tops",
    subCategory: "T-Shirts",
    colors: ["Black", "Orange"],
    isNew: true,
    isSale: false,
    collectionSlug: "racing-club",
    description: "High-octane vintage motorsport inspired graphic oversized tee crafted in 280 GSM heavyweight combed cotton.",
  },
  {
    id: "2",
    name: "BLACK NOCTURNAL HOODIE",
    price: 6999,
    originalPrice: 7999,
    images: [
      "/images/products/black-nocturnal-hoodie.jpg",
      "/images/products/black-nocturnal-hoodie.jpg",
    ],
    category: "Tops",
    subCategory: "Hoodies",
    colors: ["Black"],
    isNew: true,
    isSale: false,
    collectionSlug: "winter-collection",
    description: "Signature 420 GSM French Terry heavyweight boxy hoodie with tonal high-density embossed branding.",
  },
  {
    id: "3",
    name: "TACTICAL INDUSTRIAL CARGO PANTS",
    price: 5999,
    originalPrice: 6999,
    images: [
      "/images/products/tactical-cargo-pants.jpg",
      "/images/products/tactical-cargo-pants.jpg",
    ],
    category: "Bottoms",
    subCategory: "Cargo Pants",
    colors: ["Grey", "Black"],
    isNew: true,
    isSale: false,
    collectionSlug: "essentials",
    description: "Military ripstop relaxed-fit cargos with modular buckle straps, deep utility pockets, and adjustable ankle toggles.",
  },
  {
    id: "4",
    name: "STAR STUDDED BROWN HOODIE",
    price: 7499,
    originalPrice: 8499,
    images: [
      "/images/products/star-studded-brown-hoodie.jpg",
      "/images/products/star-studded-brown-hoodie.jpg",
    ],
    category: "Tops",
    subCategory: "Hoodies",
    colors: ["Brown", "Orange"],
    isNew: true,
    isSale: true,
    collectionSlug: "winter-collection",
    description: "Rich chocolate brown fleece hoodie featuring premium multi-layer chenille star embroidery and tactile puff prints.",
  },
  {
    id: "5",
    name: "BLIND BOX 26 - EXCLUSIVE DROP",
    price: 3999,
    originalPrice: 5999,
    images: [
      "/images/products/black-nocturnal-hoodie.jpg",
      "/images/products/oversized-tshirt.jpg",
    ],
    category: "Special",
    subCategory: "Mystery Box",
    colors: ["Mixed"],
    isBlindBox: true,
    collectionSlug: "blind-box",
    description: "Serialized mystery release containing limited sample garments, collectible accessories, and unreleased prints.",
  },
  {
    id: "6",
    name: "HEAVYWEIGHT RAW CUT CARGOS",
    price: 6499,
    originalPrice: 7499,
    images: [
      "/images/products/tactical-cargo-pants.jpg",
      "/images/products/tactical-cargo-pants.jpg",
    ],
    category: "Bottoms",
    subCategory: "Cargo Pants",
    colors: ["Black", "Grey"],
    isNew: false,
    isSale: true,
    collectionSlug: "essentials",
    description: "Heavy cotton canvas workwear silhouette with articulated knees, reinforced seams, and custom branded metal rivets.",
  },
];

export const collections: CollectionInfo[] = [
  {
    slug: "winter-collection",
    name: "Winter Collection 2025/26",
    tag: "WINTER SHIELD",
    concept: "C.01 / TECHNICAL THERMAL",
    description: "Ultra-heavyweight 420 GSM French Terry layers, fleece hoodies, and structured thermal garments engineered for cold weather.",
    image: "/images/products/black-nocturnal-hoodie.jpg",
    itemCount: 2,
  },
  {
    slug: "racing-club",
    name: "DRIIVN Racing Club",
    tag: "SPEEDWAY SERIES",
    concept: "C.02 / GRAPHIC CAPSULE",
    description: "Inspired by vintage motorsport culture. High-octane contrast colorways, speed typography, and dropped-shoulder boxy cuts.",
    image: "/images/products/oversized-tshirt.jpg",
    itemCount: 1,
  },
  {
    slug: "essentials",
    name: "DRIIVN Basics & Essentials",
    tag: "DAILY UNIFORM",
    concept: "C.03 / PERMANENT LINE",
    description: "Premium daily uniform. Minimal branding, meticulously tailored silhouettes, and rugged long-staple cotton fabrication.",
    image: "/images/products/tactical-cargo-pants.jpg",
    itemCount: 2,
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
  { name: "Orange", hex: "#FF4D00" },
  { name: "Brown", hex: "#4A2E18" },
  { name: "Grey", hex: "#7A7D81" },
  { name: "White", hex: "#F5F5F7" },
  { name: "Blue", hex: "#0033CC" },
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
