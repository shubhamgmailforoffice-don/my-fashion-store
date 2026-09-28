import { Suspense } from "react";
import { getAsyncComingSoonData } from "@/lib/comingSoon";
import ComingSoonClient from "./ComingSoonClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ComingSoonPage() {
  const data = await getAsyncComingSoonData();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#E8E6DF] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#E8262A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ComingSoonClient initialData={data} />
    </Suspense>
  );
}
