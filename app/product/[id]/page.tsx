import { getDB } from "@/lib/store";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const db = getDB();
  const product = db.products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailsClient
      key={product.id}
      product={product}
      allProducts={db.products}
    />
  );
}
