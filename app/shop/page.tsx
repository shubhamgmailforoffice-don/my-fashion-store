import { getAsyncProducts } from "@/lib/store";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopPage() {
  const products = await getAsyncProducts();
  return <ShopClient initialProducts={products} />;
}

