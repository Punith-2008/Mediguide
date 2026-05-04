"use client";

import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState } from "react";

interface WhereToBuyProps {
  medicineName: string;
}

export default function WhereToBuy({ medicineName }: WhereToBuyProps) {
  const encodedName = encodeURIComponent(medicineName.trim());
  
  const pharmacies = [
    { name: "Apollo Pharmacy", price: "₹62", url: `https://www.apollopharmacy.in/search-medicines/${encodedName}` },
    { name: "Tata 1mg", price: "₹31", best: true, url: `https://www.1mg.com/search/all?name=${encodedName}` },
    { name: "Netmeds", price: "₹31", url: `https://www.netmeds.com/products?q=${encodedName}` },
    { name: "PharmEasy", price: "₹41", url: `https://pharmeasy.in/search/all?name=${encodedName}` }
  ];

  return (
    <>
      <Card className="w-full border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-[#1051a3] dark:text-blue-500 flex items-center text-lg">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Where to Buy (Best Price)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative">

          <div className="flex flex-col divide-y divide-border">
            {pharmacies.map((store, i) => (
              <div key={i} className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="font-medium text-slate-800 dark:text-slate-200">{store.name}</div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg text-slate-900 dark:text-white">{store.price}</span>
                  {store.best && (
                    <span className="hidden sm:inline-block bg-[#3bb160] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      Best Price
                    </span>
                  )}
                  <a 
                    href={store.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1051a3] hover:bg-blue-800 text-white font-medium text-sm px-5 py-1.5 rounded-full shadow-sm transition-colors inline-block"
                  >
                    Buy Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
