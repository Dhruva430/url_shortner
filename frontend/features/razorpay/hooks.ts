"use client";

import { useMutation } from "@tanstack/react-query";

export interface OrderRequest {
  amount: number; // in rupees
}

export interface OrderResponse {
  order_id: string;
  amount: number;   // paise from backend
  currency: string; // "INR"
  key: string;      // publishable key
}

export function useCreateRazorpayOrder() {
  return useMutation<OrderResponse, Error, OrderRequest>({
    mutationFn: async ({ amount }) => {
      const res = await fetch("/api/protected/payment/createorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send auth cookie
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Create order failed: ${res.status} ${txt}`);
      }
      return res.json();
    },
  });
}
