"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StoresPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/shop");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E8262A] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
