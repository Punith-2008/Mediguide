"use client";

import { ShoppingCart } from "lucide-react";

export default function BuyNowButton() {
  return (
    <button 
      onClick={() => alert("Redirecting to pharmacy partners...")}
      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors"
    >
      <ShoppingCart className="h-5 w-5" />
      Buy Now
    </button>
  );
}
