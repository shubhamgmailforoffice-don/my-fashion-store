import { getAsyncProducts } from "@/lib/store";
import VexoLandingView from "@/components/VexoLandingView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const allProducts = await getAsyncProducts();

  return <VexoLandingView products={allProducts} />;
}
