import { getAsyncProductById, getAsyncProducts } from "@/lib/store";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getAsyncProductById(id);

  if (!product) {
    notFound();
  }

  const allProducts = await getAsyncProducts();

  return (
    <ProductDetailsClient
      key={product.id}
      product={product}
      allProducts={allProducts}
    />
  );
}

