import { getAsyncProducts } from "@/lib/store";
import ModernLandingView from "@/components/ModernLandingView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const allProducts = await getAsyncProducts();

  return <ModernLandingView products={allProducts} />;
}
