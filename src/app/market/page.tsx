"use client";

import { useRouter } from "next/navigation";
import { MarketStore } from "@/components/MarketStore";

export default function MarketPage() {
  const router = useRouter();
  return <MarketStore onBack={() => router.push("/home")} />;
}
