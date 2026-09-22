import { getDB } from "@/lib/store";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ShopPage() {
  const db = getDB();
  return <ShopClient initialProducts={db.products} />;
}
