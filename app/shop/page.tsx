import { getAsyncProducts } from "@/lib/store";
import { getAsyncComingSoonData } from "@/lib/comingSoon";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopPage() {
  const [products, comingSoonData] = await Promise.all([
    getAsyncProducts(),
    getAsyncComingSoonData(),
  ]);

  return <ShopClient initialProducts={products} initialComingSoon={comingSoonData} />;
}
