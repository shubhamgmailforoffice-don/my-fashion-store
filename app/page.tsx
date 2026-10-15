import { getAsyncProducts } from "@/lib/store";
import WiDKLandingView from "@/components/WiDKLandingView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const allProducts = await getAsyncProducts();

  return <WiDKLandingView products={allProducts} />;
}
