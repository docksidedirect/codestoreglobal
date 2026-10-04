"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";

export function BuyButton({
  productId,
  locale,
  className,
}: {
  productId: string;
  locale: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function buy() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server error — try again");
      }

      if (res.status === 401) {
        router.push(`/${locale}/login`);
        return;
      }
      if (!res.ok || !data.success)
        throw new Error(data.error || "Checkout failed");

      window.location.href = data.paypalUrl; // go to PayPal
    } catch (e: any) {
      setError(e.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <Button onClick={buy} disabled={loading} className={className}>
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <ShoppingBag className="h-4 w-4 mr-2" />
        )}
        {loading ? "Connecting to PayPal..." : "Buy Now"}
      </Button>
      {error && (
        <p className="mt-2 text-center text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
