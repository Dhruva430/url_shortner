"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { loadRazorpayScript } from "@/utils/razorpay";
import { useCreateRazorpayOrder } from "@/features/razorpay/hooks";

interface PaymentPortalProps {
  open: boolean;
  onClose: () => void;
  defaultAmount?: number; // rupees
}

export function PaymentPortal({
  open,
  onClose,
  defaultAmount = 100,
}: PaymentPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState<number>(defaultAmount);
  const createOrder = useCreateRazorpayOrder();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  const handlePay = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Failed to load Razorpay SDK");
      return;
    }

    createOrder.mutate(
      { amount },
      {
        onSuccess: (data) => {
          const options = {
            key: data.key,
            amount: data.amount,
            currency: data.currency, // "INR"
            name: "Dhruva App",
            description: "Payment",
            order_id: data.order_id,
            handler: function (resp: any) {
              // TODO: POST resp back to backend for signature verification
              console.log("Payment success:", resp);
              onClose();
            },
            prefill: {
              name: "Dhruva",
              email: "user@example.com",
            },
            theme: { color: "#3399cc" },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        },
        onError: (err) => {
          alert(err.message);
        },
      }
    );
  };

  // Simple overlay
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-black">Add Credits / Pay</h2>
        <label className="block text-sm text-gray-600">
          Amount (₹)
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1 w-full rounded border border-gray-300 p-2 text-black"
          />
        </label>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700"
            disabled={createOrder.isPending}
          >
            Cancel
          </button>
          <button
            onClick={handlePay}
            disabled={createOrder.isPending || amount <= 0}
            className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {createOrder.isPending ? "Creating..." : `Pay ₹${amount}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
